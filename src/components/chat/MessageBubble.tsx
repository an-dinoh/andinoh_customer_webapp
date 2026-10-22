"use client";

import { Document, DocumentDownload, Edit, Headphone, Play, RotateLeft, Trash } from "@/components/icons";
import { downloadFile, type ViewerFile } from "@/components/files/FileViewer";
import { formatTime } from "@/utils/format";
import { extension, formatBytes, formatDuration } from "@/utils/files";
import { MEDIA_LABELS } from "@/utils/chatUpload";
import type { ChatMessage, ReplyPreview } from "@/types/api";

/** The file a message carries, for the viewer (null for text messages). */
export function messageFile(m: ChatMessage): ViewerFile | null {
  const url = m.media_url || m.attachment_url;
  if (!url || m.is_deleted) return null;
  const name = m.media_name || decodeURIComponent(url.split(/[?#]/)[0].split("/").pop() || "") || MEDIA_LABELS[m.message_type] || "File";
  return {
    url, name, size: m.media_size ?? null, contentType: m.media_content_type || null,
    type: m.message_type, poster: m.preview_url || null, caption: `${m.sender_name} · ${formatTime(m.created_at)}`,
  };
}

/** Old messages carry "Sent a file: menu.png" as their text; that's the file card's job now. */
const autoText = (m: ChatMessage) => /^Sent a (file|photo|video|document)\b/i.test(m.message ?? "");

function Quote({ r, mine, onJump }: { r: ReplyPreview; mine: boolean; onJump: (id: string) => void }) {
  return (
    <button type="button" onClick={() => onJump(r.id)}
      className={`mb-1.5 flex w-full items-center gap-2 rounded-lg border-l-4 px-2.5 py-1.5 text-left text-xs ${mine ? "border-white/70 bg-white/15 text-white/90" : "border-primary bg-primary-50 text-ink-2"}`}>
      <span className="min-w-0 flex-1">
        <span className={`block font-medium ${mine ? "text-white" : "text-primary"}`}>{r.sender_type === "customer" ? "You" : (r.sender_name || "The hotel")}</span>
        <span className={`block truncate ${r.is_deleted ? "italic" : ""}`}>{r.message || MEDIA_LABELS[r.message_type] || "Message"}</span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {r.preview_url && <img src={r.preview_url} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />}
    </button>
  );
}

function Attachment({ m, file, mine, onOpen }: { m: ChatMessage; file: ViewerFile; mine: boolean; onOpen: () => void }) {
  const type = m.message_type;
  if (type === "image") {
    return (
      <button type="button" onClick={onOpen} className="mb-1 block overflow-hidden rounded-lg" aria-label={`Open photo ${file.name}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.preview_url || file.url} alt={file.name} loading="lazy" className="max-h-72 w-full min-w-[160px] object-cover" />
      </button>
    );
  }
  if (type === "video") {
    return (
      <button type="button" onClick={onOpen} className="relative mb-1 block w-full min-w-[200px] overflow-hidden rounded-lg bg-black" aria-label={`Play video ${file.name}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {m.preview_url ? <img src={m.preview_url} alt="" loading="lazy" className="max-h-72 w-full object-cover opacity-90" /> : <span className="block h-40" />}
        <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-black/55 p-3 text-white"><Play className="h-6 w-6" /></span></span>
        {m.media_duration ? <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white tabular">{formatDuration(m.media_duration)}</span> : null}
      </button>
    );
  }
  if (type === "audio") {
    // Voice notes play right in the thread.
    return (
      <div className={`mb-1 flex min-w-[240px] items-center gap-2 rounded-lg p-2 ${mine ? "bg-white/15" : "bg-surface-2"}`}>
        <Headphone className={`h-5 w-5 shrink-0 ${mine ? "text-white" : "text-primary"}`} />
        <audio src={file.url} controls preload="none" className="h-9 w-full min-w-0" />
        {m.media_duration ? <span className={`shrink-0 text-[11px] tabular ${mine ? "text-white/80" : "text-muted"}`}>{formatDuration(m.media_duration)}</span> : null}
      </div>
    );
  }
  // PDFs and any other file: a card that opens in the viewer, with a separate download button.
  const ext = extension(file.name).toUpperCase();
  return (
    <div className={`mb-1 flex min-w-[240px] items-center gap-3 rounded-lg p-2.5 ${mine ? "bg-white/15" : "bg-surface-2"}`}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Open ${file.name}`}>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${mine ? "bg-white/20 text-white" : "bg-primary-50 text-primary"}`}><Document className="h-5 w-5" /></span>
        <span className="min-w-0">
          <span className={`block truncate text-sm font-medium ${mine ? "text-white" : "text-ink"}`}>{file.name}</span>
          <span className={`block text-[11px] ${mine ? "text-white/75" : "text-muted"}`}>{[ext, formatBytes(file.size)].filter(Boolean).join(" · ")} · Tap to open</span>
        </span>
      </button>
      <button type="button" onClick={() => void downloadFile(file)} aria-label={`Download ${file.name}`} title="Download"
        className={`shrink-0 rounded-lg p-1.5 ${mine ? "text-white/80 hover:bg-white/15" : "text-muted hover:bg-surface"}`}><DocumentDownload className="h-4 w-4" /></button>
    </div>
  );
}

export function MessageBubble({ m, mine, canEdit, canDelete, highlighted, onOpen, onReply, onEdit, onDelete, onJump }: {
  m: ChatMessage;
  /** Sent by the guest (right). */
  mine: boolean;
  canEdit: boolean;
  canDelete: boolean;
  highlighted?: boolean;
  onOpen: (m: ChatMessage) => void;
  onReply?: (m: ChatMessage) => void;
  onEdit?: (m: ChatMessage) => void;
  onDelete?: (m: ChatMessage) => void;
  onJump: (id: string) => void;
}) {
  if (m.sender_type === "system") {
    return <p className="mx-auto my-2 max-w-md rounded-full bg-surface-2 px-3 py-1 text-center text-xs text-muted">{m.message}</p>;
  }
  const file = messageFile(m);
  const text = m.is_deleted ? "This message was deleted" : (file && autoText(m) ? "" : m.message);
  const action = "rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink";
  return (
    <div id={`msg-${m.id}`} className={`group flex items-center gap-1 ${mine ? "flex-row-reverse" : ""}`}>
      <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm transition-shadow ${highlighted ? "ring-4 ring-primary/30" : ""} ${mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-line bg-surface text-ink"} ${m.is_deleted ? "opacity-80" : ""}`}>
        {!mine && <p className="mb-0.5 text-[11px] font-medium text-primary">{m.sender_name}</p>}
        {m.reply_to && !m.is_deleted && <Quote r={m.reply_to} mine={mine} onJump={onJump} />}
        {file && <Attachment m={m} file={file} mine={mine} onOpen={() => onOpen(m)} />}
        {text && <p className={`whitespace-pre-wrap break-words ${m.is_deleted ? "italic" : ""}`}>{text}</p>}
        <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/70" : "text-subtle"}`}>
          {m.is_edited && !m.is_deleted ? "Edited · " : ""}{formatTime(m.created_at)}{mine && m.is_read && !m.is_deleted ? " · Read" : ""}
        </p>
      </div>
      {!m.is_deleted && (onReply || canEdit || canDelete) && (
        <div className="flex shrink-0 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {onReply && <button type="button" className={action} aria-label="Reply" title="Reply" onClick={() => onReply(m)}><RotateLeft className="h-4 w-4" /></button>}
          {canEdit && onEdit && <button type="button" className={action} aria-label="Edit" title={file ? "Edit caption" : "Edit"} onClick={() => onEdit(m)}><Edit className="h-4 w-4" /></button>}
          {canDelete && onDelete && <button type="button" className={`${action} hover:text-danger`} aria-label="Delete" title="Delete for everyone" onClick={() => onDelete(m)}><Trash className="h-4 w-4" /></button>}
        </div>
      )}
    </div>
  );
}
