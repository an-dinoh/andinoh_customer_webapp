import { session } from '@/utils/api';

/**
 * The live socket (Customer guide 12.4). Personal events (in-app notifications, booking status, chat
 * replies, referral rewards) arrive on their own; a chat or a booking can be subscribed to for more.
 * Reconnects with backoff, re-subscribes, pings every 30 s, and reconnects with the new token
 * whenever the session is refreshed.
 */

export type SubscribeAction = 'subscribe_chat' | 'subscribe_booking';

export interface ServerEvent {
  type: 'in_app_notification' | 'booking_status_update' | 'new_chat_message' | 'chat_message_updated' | 'is_typing' | 'message_read' |
    'referral_success' | 'account_notification' | 'subscription_confirmed' | 'error' | 'pong' | string;
  message: Record<string, unknown> & { chat_id?: string; text?: string };
}

export type SocketState = 'connecting' | 'open' | 'closed';

const FIELD: Record<SubscribeAction, string> = {
  subscribe_chat: 'chat_id',
  subscribe_booking: 'booking_id',
};

function socketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api && /^https?:/.test(api)) return api.replace(/^http/, 'ws').replace(/\/api\/v1\/?$/, '/ws/notifications/');
  return 'wss://api.andinoh.com/ws/notifications/';
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners = new Set<(event: ServerEvent) => void>();
  private subscriptions = new Map<string, { action: SubscribeAction; id: string }>();
  private attempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private wanted = false;
  private state: SocketState = 'closed';
  private stateListeners = new Set<(state: SocketState, reconnected: boolean) => void>();
  private everOpened = false;
  private onTokens = () => { if (this.wanted) this.reconnectNow(); };

  connect() {
    if (typeof window === 'undefined') return;
    this.wanted = true;
    window.removeEventListener('andinoh:tokens', this.onTokens);
    window.addEventListener('andinoh:tokens', this.onTokens);
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;
    const token = session.access();
    if (!token) return;

    const socket = new WebSocket(`${socketUrl()}?token=${encodeURIComponent(token)}`);
    this.socket = socket;
    this.setState('connecting');
    socket.onopen = () => {
      this.attempts = 0;
      this.subscriptions.forEach(s => this.send({ action: s.action, [FIELD[s.action]]: s.id }));
      this.stopPing();
      this.pingTimer = setInterval(() => this.send({ action: 'ping', timestamp: Date.now() }), 30_000);
      // Resubscribed first, so a listener that re-reads what a drop may have missed can't miss more.
      this.setState('open', this.everOpened);
      this.everOpened = true;
    };
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as ServerEvent;
        if (!data.type || data.type === 'pong' || data.type === 'subscription_confirmed') return;
        this.listeners.forEach(l => l(data));
      } catch { /* ignore non-JSON frames */ }
    };
    socket.onclose = () => {
      // A socket we replaced closes late; its successor owns the heartbeat now.
      if (this.socket !== socket) return;
      this.stopPing();
      this.socket = null;
      this.setState('closed');
      if (this.wanted) this.scheduleReconnect();
    };
    socket.onerror = () => { /* onclose follows and handles the retry */ };
  }

  private setState(state: SocketState, reconnected = false) {
    this.state = state;
    this.stateListeners.forEach(l => l(state, reconnected));
  }

  getState() { return this.state; }

  /** Connection changes; `reconnected` is true when the socket opens again after a drop. */
  onStateChange(listener: (state: SocketState, reconnected: boolean) => void) {
    this.stateListeners.add(listener);
    return () => { this.stateListeners.delete(listener); };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(30_000, 1000 * 2 ** Math.min(this.attempts, 5)) + Math.random() * 500;
    this.attempts++;
    this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; this.connect(); }, delay);
  }

  private stopPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  private reconnectNow() {
    this.stopPing();
    const s = this.socket;
    this.socket = null;
    s?.close();
    this.connect();
  }

  private send(payload: Record<string, unknown>) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  subscribe(action: SubscribeAction, id: string) {
    this.subscriptions.set(`${action}:${id}`, { action, id });
    this.send({ action, [FIELD[action]]: id });
  }

  unsubscribe(action: SubscribeAction, id: string) {
    this.subscriptions.delete(`${action}:${id}`);
    this.send({ action: action.replace('subscribe_', 'unsubscribe_'), [FIELD[action]]: id });
  }

  /** Inside a subscribed chat. */
  typing(chatId: string, isTyping: boolean) {
    this.send({ action: 'typing_event', chat_id: chatId, is_typing: isTyping });
  }

  markChatRead(chatId: string) {
    this.send({ action: 'message_read_event', chat_id: chatId });
  }

  addListener(listener: (event: ServerEvent) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  disconnect() {
    this.wanted = false;
    if (typeof window !== 'undefined') window.removeEventListener('andinoh:tokens', this.onTokens);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.subscriptions.clear();
    this.everOpened = false;
    this.stopPing();
    const s = this.socket;
    this.socket = null;
    s?.close();
    this.setState('closed');
  }
}

export const webSocketService = new WebSocketService();
