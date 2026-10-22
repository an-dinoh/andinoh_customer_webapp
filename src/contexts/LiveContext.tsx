"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { chatApi, notificationsApi } from "@/services/api";
import { webSocketService, type ServerEvent, type SocketState } from "@/services/websocket.service";
import { bookingStatusNotice, chatNotice, notificationHref, notificationText, notificationTone } from "@/utils/notify";
import { showNotice } from "@/components/shell/NoticeToast";

/**
 * Live state while signed in (Customer guide 12): the unread notification badge, unread hotel chats,
 * the socket, and a stream of its events for pages (chat threads, booking screens).
 */

interface LiveContextType {
  unreadNotifications: number;
  unreadChats: number;
  refreshNotifications: () => Promise<void>;
  refreshChats: () => Promise<void>;
  socketState: SocketState;
  /** Listen to socket events; returns an unsubscribe function. */
  onEvent: (listener: (event: ServerEvent) => void) => () => void;
}

const LiveContext = createContext<LiveContextType | undefined>(undefined);

/** The chat on screen, so its own messages don't also pop up as toasts. */
let viewingChat: string | null = null;
export const setViewingChat = (id: string | null) => { viewingChat = id; };

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, refreshProfile } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const [socketState, setSocketState] = useState<SocketState>(() => webSocketService.getState());

  const refreshNotifications = useCallback(async () => {
    try { setUnreadNotifications((await notificationsApi.unreadCount()).unread); } catch { /* badge only */ }
  }, []);

  const refreshChats = useCallback(async () => {
    try {
      const chats = await chatApi.list({ page_size: 50 });
      setUnreadChats(chats.results.filter(c => c.status === "active" && c.unread_count > 0).length);
    } catch { /* badge only */ }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      webSocketService.disconnect();
      return;
    }
    webSocketService.connect();
    const first = setTimeout(() => { void refreshNotifications(); void refreshChats(); }, 0);
    return () => clearTimeout(first);
  }, [isAuthenticated, refreshNotifications, refreshChats]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return webSocketService.addListener((event) => {
      const m = event.message ?? {};
      switch (event.type) {
        case "in_app_notification": {
          const { title, message } = notificationText(m as { title?: string; message?: string; type?: string });
          const ref = { reference_type: m.reference_type as string | null, reference_id: m.reference_id as string | null };
          // A chat reply also arrives as new_chat_message; one toast is enough.
          if (ref.reference_type !== "chat") {
            showNotice({ title, body: message || undefined, href: notificationHref(ref), tone: notificationTone(m.type as string) }, { id: `n-${m.id ?? Date.now()}` });
          }
          void refreshNotifications();
          if (m.type === "POINTS_EARNED" || m.type === "TIER_UPGRADE") void refreshProfile();
          break;
        }
        case "booking_status_update":
          showNotice(bookingStatusNotice(m), { id: `booking-${m.booking_id ?? ""}` });
          break;
        case "new_chat_message":
          if (m.sender_type === "staff") {
            if (viewingChat !== m.chat_id) showNotice(chatNotice(m), { id: `chat-${m.chat_id ?? ""}` });
            void refreshChats();
          }
          break;
        case "referral_success":
          showNotice({ title: "Your referral paid off", body: String(m.text ?? "You earned referral points."), href: "/account/rewards", tone: "success" });
          void refreshProfile();
          break;
        case "account_notification":
          showNotice({ title: String(m.title ?? "Update from Andinoh"), body: m.message ? String(m.message) : undefined, href: "/notifications", tone: "info" });
          break;
        // Typing, read receipts and anything else are for the screens that listen.
      }
    });
  }, [isAuthenticated, refreshNotifications, refreshChats, refreshProfile]);

  // Events sent while the socket was down are lost: catch up after a reconnect and when the tab returns.
  useEffect(() => {
    if (!isAuthenticated) return;
    const catchUp = () => { void refreshNotifications(); void refreshChats(); };
    const offState = webSocketService.onStateChange((state, reconnected) => {
      setSocketState(state);
      if (reconnected) catchUp();
    });
    const onVisible = () => { if (document.visibilityState === "visible") catchUp(); };
    document.addEventListener("visibilitychange", onVisible);
    const poll = setInterval(catchUp, 120_000);
    return () => { offState(); document.removeEventListener("visibilitychange", onVisible); clearInterval(poll); };
  }, [isAuthenticated, refreshNotifications, refreshChats]);

  const onEvent = useCallback((listener: (event: ServerEvent) => void) => webSocketService.addListener(listener), []);

  // Signed out, the badges are empty whatever was last counted.
  const value = useMemo(() => ({
    unreadNotifications: isAuthenticated ? unreadNotifications : 0, unreadChats: isAuthenticated ? unreadChats : 0,
    refreshNotifications, refreshChats, socketState, onEvent,
  }), [isAuthenticated, unreadNotifications, unreadChats, refreshNotifications, refreshChats, socketState, onEvent]);
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLive must be used within a LiveProvider");
  return ctx;
}

/** Re-runs `reload` when one of these socket events arrives, and after the socket reconnects. */
export function useLiveReload(types: readonly string[], reload: () => unknown, filter?: (event: ServerEvent) => boolean) {
  const { onEvent, socketState } = useLive();
  const latest = useRef({ reload, filter, types });
  useEffect(() => { latest.current = { reload, filter, types }; });
  useEffect(() => onEvent(event => {
    const { types: t, filter: f, reload: r } = latest.current;
    if (t.includes(event.type) && (!f || f(event))) void r();
  }), [onEvent]);
  const wasOpen = useRef(socketState === "open");
  useEffect(() => {
    if (socketState === "open" && !wasOpen.current) void latest.current.reload();
    wasOpen.current = socketState === "open";
  }, [socketState]);
}
