"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { setViewingChat, useLive } from "@/contexts/LiveContext";
import { webSocketService } from "@/services/websocket.service";
import { chatApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { MessageBubble, messageFile } from "@/components/chat/MessageBubble";
import FileViewer, { type ViewerFile } from "@/components/files/FileViewer";
import { Avatar, Button, Callout, ConfirmDialog, ErrorState, Skeleton } from "@/components/ui";
import { ArrowLeft, Paperclip, Send, X } from "@/components/icons";
import { errorMessage } from "@/utils/api";
import { formatDate } from "@/utils/format";
import { canChange, isOwnMessage, MEDIA_LABELS, sendChatFile, socketMessage } from "@/utils/chatUpload";
import type { ChatMessage } from "@/types/api";

/** One conversation with a hotel (guide 10.1, live updates 12.4). */
export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { onEvent, refreshChats } = useLive();
  const chat = useQuery(() => chatApi.get(id), [id]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [deleting, setDeleting] = useState<ChatMessage | null>(null);
  const [viewer, setViewer] = useState<{ files: ViewerFile[]; index: number } | null>(null);
  const [typing, setTyping] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const typingSent = useRef(0);
  const messages = chat.data?.messages ?? [];
  const active = chat.data?.status === "active";

  const markRead = useCallback(() => {
    void chatApi.markRead(id).then(() => refreshChats()).catch(() => undefined);
  }, [id, refreshChats]);

  // Subscribe while open; mark the hotel's messages read.
  useEffect(() => {
    setViewingChat(id);
    webSocketService.subscribe("subscribe_chat", id);
    markRead();
    return () => { setViewingChat(null); webSocketService.unsubscribe("subscribe_chat", id); };
  }, [id, markRead]);

  useEffect(() => onEvent(e => {
    const m = e.message ?? {};
    if (m.chat_id !== id) return;
    if (e.type === "new_chat_message" || e.type === "chat_message_updated") {
      const incoming = socketMessage(m);
      chat.setData(c => {
        if (!c) return c;
        const has = c.messages.some(x => x.id === incoming.id);
        return { ...c, messages: has ? c.messages.map(x => (x.id === incoming.id ? { ...x, ...incoming } : x)) : [...c.messages, incoming] };
      });
      if (m.sender_type === "staff") { setTyping(false); markRead(); }
    } else if (e.type === "is_typing" && m.sender_type === "staff") {
      setTyping(!!m.is_typing);
    } else if (e.type === "message_read" && m.reader_type === "staff") {
      chat.setData(c => (c ? { ...c, messages: c.messages.map(x => (x.sender_type === "customer" ? { ...x, is_read: true } : x)) } : c));
    }
  }), [onEvent, id, chat, markRead]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

  const send = useMutation(async () => {
    const body = text.trim();
    if (editing) {
      const updated = await chatApi.edit(id, editing.id, body);
      chat.setData(c => (c ? { ...c, messages: c.messages.map(x => (x.id === updated.id ? updated : x)) } : c));
      setEditing(null);
    } else {
      await chatApi.send(id, { message: body, ...(replyTo ? { reply_to_id: replyTo.id } : {}) });
      setReplyTo(null);
      await chat.reload();
    }
    setText("");
    webSocketService.typing(id, false);
  });
  const sendFile = useMutation(async (file: File) => {
    setProgress(0);
    try {
      await sendChatFile(id, file, { caption: text.trim() || undefined, replyToId: replyTo?.id, onProgress: setProgress });
      setText("");
      setReplyTo(null);
      await chat.reload();
    } finally {
      setProgress(null);
    }
  });
  const remove = useMutation(async (m: ChatMessage) => {
    const updated = await chatApi.remove(id, m.id);
    chat.setData(c => (c ? { ...c, messages: c.messages.map(x => (x.id === updated.id ? updated : x)) } : c));
    setDeleting(null);
  });
  const close = useMutation(() => chatApi.close(id), { success: "Conversation closed", onSuccess: () => void chat.reload() });

  const onType = (v: string) => {
    setText(v);
    if (Date.now() - typingSent.current > 3000) { typingSent.current = Date.now(); webSocketService.typing(id, true); }
  };
  const jump = (mid: string) => {
    document.getElementById(`msg-${mid}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlight(mid);
    setTimeout(() => setHighlight(null), 1500);
  };
  const openFile = (m: ChatMessage) => {
    const files = messages.map(messageFile).filter((f): f is ViewerFile => !!f);
    const mine = messageFile(m);
    setViewer({ files, index: Math.max(0, files.findIndex(f => f.url === mine?.url)) });
  };

  if (chat.error) return <div className="mx-auto max-w-3xl px-4 pt-8"><div className="rounded-2xl border border-line bg-surface"><ErrorState error={chat.error} onRetry={chat.reload} /></div></div>;
  const c = chat.data;
  let lastDay = "";

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px-52px-5rem)] max-w-3xl flex-col px-0 sm:px-6 lg:h-[calc(100dvh-64px)] lg:px-8 lg:py-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-line bg-surface sm:rounded-2xl sm:border">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Link href="/inbox" className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label="Back to messages"><ArrowLeft className="h-5 w-5" /></Link>
          {c ? <Avatar name={c.hotel_name} /> : <Skeleton className="h-9 w-9 rounded-full" />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{c?.hotel_name ?? "…"}</p>
            <p className="truncate text-xs text-muted">{typing ? <span className="text-primary">Typing…</span> : c ? `${c.subject || "Front desk"}${c.assigned_staff_name ? ` · ${c.assigned_staff_name}` : ""}` : ""}</p>
          </div>
          {active && <Button size="sm" variant="ghost" loading={close.busy} onClick={() => close.run()}>Close</Button>}
          {c && <Button size="sm" variant="outline" href={`/trips/${c.booking}`}>Booking</Button>}
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-background/60 px-3 py-4 sm:px-5">
          {!c ? [0, 1, 2].map(i => <Skeleton key={i} className={`h-12 w-2/3 rounded-2xl ${i % 2 ? "ml-auto" : ""}`} />) : messages.map(m => {
            const day = formatDate(m.created_at);
            const showDay = day !== lastDay;
            lastDay = day;
            const mine = isOwnMessage(m);
            return (
              <div key={m.id}>
                {showDay && <p className="my-3 text-center text-[11px] font-medium text-muted">{day}</p>}
                <MessageBubble m={m} mine={mine} highlighted={highlight === m.id} canEdit={mine && active && canChange(m, "edit")} canDelete={mine && canChange(m, "delete")}
                  onOpen={openFile} onReply={active && m.sender_type !== "system" ? setReplyTo : undefined}
                  onEdit={x => { setEditing(x); setReplyTo(null); setText(x.message); }} onDelete={setDeleting} onJump={jump} />
              </div>
            );
          })}
          <div ref={bottom} />
        </div>

        {c && !active ? (
          <div className="border-t border-line p-4"><Callout tone="info">This conversation is closed. {c.closed_at ? `It closed on ${formatDate(c.closed_at)}.` : ""} Start a new one from your booking while you’re checked in.</Callout></div>
        ) : (
          <form className="border-t border-line p-3" onSubmit={e => { e.preventDefault(); if (text.trim()) void send.run(); }}>
            {(replyTo || editing) && (
              <div className="mb-2 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
                <span className="min-w-0 flex-1 truncate"><span className="font-medium text-primary">{editing ? "Editing your message" : `Replying to ${replyTo!.sender_type === "customer" ? "yourself" : replyTo!.sender_name}`}</span>
                  {replyTo && <span className="text-muted"> · {replyTo.message || MEDIA_LABELS[replyTo.message_type]}</span>}</span>
                <button type="button" aria-label="Cancel" onClick={() => { setReplyTo(null); if (editing) { setEditing(null); setText(""); } }} className="text-subtle hover:text-ink"><X className="h-4 w-4" /></button>
              </div>
            )}
            {progress !== null && <div className="mb-2 h-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-primary transition-all" style={{ width: `${Math.round(progress * 100)}%` }} /></div>}
            {(send.error || sendFile.error) && <p className="mb-2 text-xs text-danger">{errorMessage(send.error ?? sendFile.error)}</p>}
            <div className="flex items-end gap-2">
              {!editing && (
                <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-primary" aria-label="Send a file" title="Send a photo, video or file">
                  <Paperclip className="h-5 w-5" />
                  <input type="file" className="sr-only" disabled={sendFile.busy} onChange={e => { const f = e.target.files?.[0]; if (f) void sendFile.run(f); e.target.value = ""; }} />
                </label>
              )}
              <textarea rows={1} value={text} onChange={e => onType(e.target.value)} placeholder="Write a message…" aria-label="Message"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (text.trim()) void send.run(); } }}
                className="max-h-36 min-h-10 flex-1 resize-none rounded-2xl border border-line-strong bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10" />
              <Button type="submit" size="icon" className="rounded-full" loading={send.busy} disabled={!text.trim()} aria-label={editing ? "Save" : "Send"}><Send className="h-5 w-5" /></Button>
            </div>
          </form>
        )}
      </div>
      {viewer && <FileViewer files={viewer.files} index={viewer.index} onClose={() => setViewer(null)} />}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete this message?" confirmLabel="Delete for everyone" busy={remove.busy}
        description="It’s removed for you and the hotel. “This message was deleted” stays in its place." onConfirm={() => deleting && remove.run(deleting)} />
    </div>
  );
}
