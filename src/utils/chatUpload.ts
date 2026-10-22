import { chatApi } from '@/services/api';
import { ApiError } from '@/utils/api';
import { extension, formatBytes } from '@/utils/files';
import type { ChatMessage, UUID } from '@/types/api';

export type ChatMediaType = 'image' | 'video' | 'audio' | 'document' | 'file';

// Customer guide 10.1: any file except programs and web pages, one
// request uploads and sends it; big files go straight to Cloudinary with a signed ticket.

const MB = 1024 * 1024;

/** The server's limits per kind (it checks again). */
export const CHAT_LIMITS: Record<ChatMediaType, number> = { image: 10 * MB, audio: 16 * MB, document: 10 * MB, file: 25 * MB, video: 100 * MB };

/** Refused by the server: programs and pages that run when opened. */
export const BLOCKED_EXTENSIONS = new Set([
  'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'pif', 'cpl', 'dll', 'sys', 'vbs', 'vbe', 'wsf', 'ps1',
  'sh', 'jar', 'apk', 'aab', 'ipa', 'app', 'dmg', 'pkg', 'deb', 'rpm', 'lnk', 'reg', 'hta',
  'js', 'mjs', 'html', 'htm', 'xhtml', 'shtml', 'svg', 'xml', 'php', 'asp', 'aspx', 'jsp',
]);

const IMAGE = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif']);
const VIDEO = new Set(['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv', '3gp']);
const AUDIO = new Set(['m4a', 'aac', 'mp3', 'ogg', 'opus', 'wav', 'amr']);

/** The kind the server will give a file (from its extension, as the server decides). */
export function chatKind(name: string): ChatMediaType {
  const ext = extension(name);
  if (IMAGE.has(ext)) return 'image';
  if (VIDEO.has(ext)) return 'video';
  if (ext === 'pdf') return 'document';
  if (AUDIO.has(ext)) return 'audio';
  return 'file';
}

const KIND_WORDS: Record<ChatMediaType, string> = { image: 'Photos', video: 'Videos', audio: 'Voice notes', document: 'PDFs', file: 'Files' };

/** Why a file can't be sent, or null when it can. */
export function chatFileProblem(file: { name: string; size: number }): string | null {
  if (BLOCKED_EXTENSIONS.has(extension(file.name))) return 'Programs and web pages can’t be sent. Send the file in another format.';
  if (file.size === 0) return 'That file is empty.';
  const kind = chatKind(file.name);
  if (file.size > CHAT_LIMITS[kind]) return `${KIND_WORDS[kind]} can be up to ${formatBytes(CHAT_LIMITS[kind])}; this one is ${formatBytes(file.size)}.`;
  return null;
}

/** Files above this go straight to Cloudinary (the guide recommends it for videos and anything over ~5 MB). */
export const DIRECT_UPLOAD_BYTES = 5 * MB;

/**
 * Smaller photos send faster on mobile data: JPEG and WebP photos over 1 MB or wider than 1600 px are
 * redrawn at most 1600 px wide as 80% JPEG. Other images (PNG transparency, GIF animation) are left as
 * they are.
 */
export async function compressPhoto(file: File): Promise<File> {
  if (!/^image\/(jpeg|webp)$/.test(file.type) || typeof createImageBitmap === 'undefined') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= MB) { bitmap.close(); return file; }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.(webp|jpe?g)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

/** A recording's or video's length in seconds, read by the browser (undefined if it can't tell). */
export function mediaDuration(file: File): Promise<number | undefined> {
  const kind = chatKind(file.name);
  if ((kind !== 'audio' && kind !== 'video') || typeof document === 'undefined') return Promise.resolve(undefined);
  return new Promise(resolve => {
    const el = document.createElement(kind === 'audio' ? 'audio' : 'video');
    const url = URL.createObjectURL(file);
    const done = (v?: number) => { URL.revokeObjectURL(url); resolve(v); };
    el.preload = 'metadata';
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? Math.round(el.duration * 10) / 10 : undefined);
    el.onerror = () => done(undefined);
    setTimeout(() => done(undefined), 5000);
    el.src = url;
  });
}

/** Posts a file to Cloudinary with a signed ticket, reporting progress. */
function postToCloudinary(url: string, fields: Record<string, string | number>, file: File, onProgress?: (f: number) => void):
  Promise<{ public_id: string; resource_type: 'image' | 'video' | 'raw' }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, String(v));
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && body.public_id) resolve(body);
        else reject(new Error(body?.error?.message || 'The upload didn’t finish. Please try again.'));
      } catch {
        reject(new Error('The upload didn’t finish. Please try again.'));
      }
    };
    xhr.onerror = () => reject(new Error('The upload stopped. Check your connection and try again.'));
    xhr.send(form);
  });
}

export interface SendFileOptions {
  caption?: string;
  replyToId?: UUID;
  onProgress?: (fraction: number) => void;
}

/**
 * Sends one file to a chat: photos are compressed, lengths are read for audio and video, and big files
 * go straight to Cloudinary (falling back to the API when the server has no Cloudinary, e.g. test servers).
 */
export async function sendChatFile(chatId: UUID, original: File, { caption, replyToId, onProgress }: SendFileOptions = {}): Promise<ChatMessage> {
  const problem = chatFileProblem(original);
  if (problem) throw new Error(problem);
  const file = chatKind(original.name) === 'image' ? await compressPhoto(original) : original;
  const duration = await mediaDuration(file);
  const message = caption?.trim() || undefined;
  if (file.size > DIRECT_UPLOAD_BYTES) {
    let ticket = null;
    try {
      ticket = await chatApi.uploadTicket(chatId);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 400)) throw err;
    }
    if (ticket) {
      const uploaded = await postToCloudinary(ticket.upload_url, ticket.fields, file, f => onProgress?.(f * 0.95));
      const sent = await chatApi.sendUploaded(chatId, {
        cloudinary_public_id: uploaded.public_id, resource_type: uploaded.resource_type, file_name: original.name, message, reply_to_id: replyToId, duration,
      });
      onProgress?.(1);
      return sent;
    }
  }
  return chatApi.sendFile(chatId, { file, message, reply_to_id: replyToId, duration }, onProgress);
}

/** What a file message says in a list or a reply preview. */
export const MEDIA_LABELS: Record<string, string> = { image: 'Photo', video: 'Video', audio: 'Voice message', document: 'Document', file: 'File', location: 'Location' };

/** Whether `m` was sent by the guest (only they may edit or delete it). */
export function isOwnMessage(m: Pick<ChatMessage, 'sender_type'>): boolean {
  return m.sender_type === 'customer';
}

export const EDIT_WINDOW_MS = 15 * 60_000;
export const DELETE_WINDOW_MS = 48 * 3600_000;

/** Whether the sender may still edit (15 minutes) or delete (48 hours) a message. */
export function canChange(m: Pick<ChatMessage, 'created_at' | 'is_deleted'>, action: 'edit' | 'delete', now = Date.now()): boolean {
  if (m.is_deleted) return false;
  const age = now - Date.parse(m.created_at);
  return age >= 0 ? age <= (action === 'edit' ? EDIT_WINDOW_MS : DELETE_WINDOW_MS) : true;
}

/** A socket chat event's message as the REST shape (new_chat_message adds message_id; older servers sent only that). */
export function socketMessage(raw: Record<string, unknown>): ChatMessage {
  const m = raw as Partial<ChatMessage> & { message_id?: string };
  return {
    ...(m as ChatMessage),
    id: String(m.id ?? m.message_id),
    sender_id: (m.sender_id as string | null | undefined) ?? null,
    media_url: m.media_url ?? '',
    attachment_url: m.attachment_url ?? '',
    is_read: m.is_read ?? false,
    read_at: m.read_at ?? null,
  };
}
