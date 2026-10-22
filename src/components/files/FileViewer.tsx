"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Portal, useOverlay } from "@/components/ui";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Document, DocumentDownload, Export, Headphone, Minus, Plus, X } from "@/components/icons";
import { saveDownload } from "@/utils/api";
import { formatBytes, isPublicUrl, officeViewerUrl, parseDelimited, pdfPageImage, viewKind, extension, type ViewKind } from "@/utils/files";

/**
 * Opens a file in the app instead of downloading it: photos (zoom), videos and voice notes (play), PDFs
 * (the browser's reader), Word/Excel/PowerPoint (Microsoft's viewer), text and CSV (shown as text or a
 * table). Anything else shows its name and size with a download button. Pass `url` for a file on the web
 * (chat media) or `blob` for one the API returned (receipts, statements). With several `files`, the
 * arrows (and ← →) move between them.
 */

export interface ViewerFile {
  url?: string;
  blob?: Blob;
  name: string;
  size?: number | null;
  contentType?: string | null;
  /** The server's chat message_type when known (image, video, audio, document, file). */
  type?: string | null;
  /** A small picture to show while a video loads. */
  poster?: string | null;
  /** A line under the name, e.g. who sent it and when. */
  caption?: string;
}

/** Fetches a file into memory (for PDFs and text, and for downloads from another site). */
async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

/** Saves the file to the device: the explicit choice, never the default. */
export async function downloadFile(file: ViewerFile): Promise<void> {
  try {
    const blob = file.blob ?? await fetchBlob(file.url!);
    saveDownload({ blob, filename: file.name, contentType: blob.type, headers: {} }, file.name);
  } catch {
    // The file's host doesn't allow reading it from here; let the browser fetch it instead.
    if (file.url) window.open(file.url, "_blank", "noopener,noreferrer");
    else toast.error("Couldn’t save the file. Please try again.");
  }
}

/** An object URL for a blob, revoked when it changes or the viewer closes. */
function useObjectUrl(blob: Blob | null | undefined, type?: string): string | null {
  const url = useMemo(() => (blob ? URL.createObjectURL(type && blob.type !== type ? new Blob([blob], { type }) : blob) : null), [blob, type]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

function Unavailable({ file, reason }: { file: ViewerFile; reason?: string }) {
  return (
    <div className="m-auto flex max-w-sm flex-col items-center rounded-2xl bg-surface p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary"><Document className="h-7 w-7" /></span>
      <p className="mt-4 break-all font-medium text-ink">{file.name}</p>
      <p className="mt-1 text-sm text-muted">{[extension(file.name).toUpperCase(), formatBytes(file.size)].filter(Boolean).join(" · ")}</p>
      <p className="mt-3 text-sm text-ink-2">{reason ?? "This kind of file can’t be shown in the browser."}</p>
      <Button className="mt-5" icon={DocumentDownload} onClick={() => void downloadFile(file)}>Download</Button>
    </div>
  );
}

function ImageView({ file }: { file: ViewerFile }) {
  const blobUrl = useObjectUrl(file.blob);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  const src = blobUrl ?? file.url;
  if (failed || !src) return <Unavailable file={file} reason="This photo’s format can’t be shown in the browser (HEIC photos from iPhones, for example)." />;
  return (
    <>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto" onDoubleClick={() => setZoom(z => (z === 1 ? 2 : 1))}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={file.name} onError={() => setFailed(true)} draggable={false}
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          className={`max-h-full max-w-full select-none object-contain transition-transform ${zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"}`} />
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 p-1 text-white">
        <button type="button" aria-label="Zoom out" className="rounded-full p-2 hover:bg-white/10 disabled:opacity-40" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - 0.5))}><Minus className="h-4 w-4" /></button>
        <span className="w-12 text-center text-xs tabular">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="Zoom in" className="rounded-full p-2 hover:bg-white/10 disabled:opacity-40" disabled={zoom >= 4} onClick={() => setZoom(z => Math.min(4, z + 0.5))}><Plus className="h-4 w-4" /></button>
      </div>
    </>
  );
}

function MediaView({ file, kind }: { file: ViewerFile; kind: "video" | "audio" }) {
  const blobUrl = useObjectUrl(file.blob);
  const [failed, setFailed] = useState(false);
  const src = blobUrl ?? file.url;
  if (failed || !src) return <Unavailable file={file} reason={`This ${kind === "video" ? "video" : "recording"}’s format can’t be played in the browser.`} />;
  if (kind === "video") {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <video src={src} poster={file.poster ?? undefined} controls autoPlay playsInline onError={() => setFailed(true)} className="max-h-full max-w-full rounded-lg bg-black" />
      </div>
    );
  }
  return (
    <div className="m-auto flex w-full max-w-md flex-col items-center rounded-2xl bg-surface p-8">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary"><Headphone className="h-8 w-8" /></span>
      <p className="mt-4 break-all text-center font-medium text-ink">{file.name}</p>
      <audio src={src} controls autoPlay onError={() => setFailed(true)} className="mt-5 w-full" />
    </div>
  );
}

function PdfView({ file }: { file: ViewerFile }) {
  // Read into memory first so the browser's reader shows it (a download link would save it instead).
  const [state, setState] = useState<{ blob: Blob | null; failed: boolean }>({ blob: file.blob ?? null, failed: false });
  useEffect(() => {
    if (file.blob || !file.url) return;
    let live = true;
    fetchBlob(file.url).then(b => { if (live) setState({ blob: b, failed: false }); }).catch(() => { if (live) setState({ blob: null, failed: true }); });
    return () => { live = false; };
  }, [file.blob, file.url]);
  const url = useObjectUrl(state.blob, "application/pdf");
  if (url) return <iframe title={file.name} src={url} className="h-full w-full flex-1 rounded-lg bg-white" />;
  if (state.failed) {
    // Cloudinary can still draw the first page as a picture when it won't hand out the PDF itself.
    const page = file.url ? pdfPageImage(file.url) : null;
    if (page) return <ImageView file={{ ...file, url: page, blob: undefined, name: `${file.name} (page 1)` }} />;
    return <Unavailable file={file} reason="This PDF couldn’t be opened here." />;
  }
  return <p className="m-auto text-sm text-white/70">Opening…</p>;
}

function OfficeView({ file }: { file: ViewerFile }) {
  if (!file.url || !isPublicUrl(file.url)) return <Unavailable file={file} reason="Office files open here once they’re stored online; download it to open it now." />;
  return <iframe title={file.name} src={officeViewerUrl(file.url)} className="h-full w-full flex-1 rounded-lg bg-white" />;
}

function TextView({ file }: { file: ViewerFile }) {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    (file.blob ? Promise.resolve(file.blob) : fetchBlob(file.url!)).then(b => b.text())
      .then(t => { if (live) setText(t.length > 2_000_000 ? `${t.slice(0, 2_000_000)}\n…` : t); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [file.blob, file.url]);
  if (failed) return <Unavailable file={file} reason="This file couldn’t be read here." />;
  if (text === null) return <p className="m-auto text-sm text-white/70">Opening…</p>;
  const ext = extension(file.name);
  const delimiter = ext === "csv" ? "," : ext === "tsv" ? "\t" : null;
  if (delimiter) {
    const rows = parseDelimited(text, delimiter).slice(0, 2000);
    return (
      <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-surface">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === 0 ? "sticky top-0 bg-surface-2 font-medium text-ink" : "border-t border-line text-ink-2"}>
                {r.map((c, j) => <td key={j} className="whitespace-nowrap px-3 py-2">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface p-5 font-mono text-[13px] text-ink-2">{text}</pre>;
}

function Body({ file, kind }: { file: ViewerFile; kind: ViewKind }) {
  switch (kind) {
    case "image": return <ImageView file={file} />;
    case "video": case "audio": return <MediaView file={file} kind={kind} />;
    case "pdf": return <PdfView file={file} />;
    case "office": return <OfficeView file={file} />;
    case "text": return <TextView file={file} />;
    default: return <Unavailable file={file} />;
  }
}

export default function FileViewer({ files, index = 0, onClose }: { files: ViewerFile[]; index?: number; onClose: () => void }) {
  const open = files.length > 0;
  const [at, setAt] = useState(index);
  const [lastIndex, setLastIndex] = useState(index);
  if (index !== lastIndex) { setLastIndex(index); setAt(index); }
  useOverlay(open, onClose);
  const go = useCallback((step: number) => setAt(i => Math.min(files.length - 1, Math.max(0, i + step))), [files.length]);
  useEffect(() => {
    if (!open || files.length < 2) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, files.length, go]);
  if (!open) return null;
  const file = files[Math.min(at, files.length - 1)];
  const kind = viewKind(file);
  const iconBtn = "rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white";
  return (
    <Portal>
      <div role="dialog" aria-modal="true" aria-label={file.name} className="fixed inset-0 z-[60] flex flex-col bg-black/90">
        <header className="flex items-center gap-3 px-4 py-3 text-white">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="truncate text-xs text-white/60">{[file.caption, formatBytes(file.size), files.length > 1 ? `${at + 1} of ${files.length}` : ""].filter(Boolean).join(" · ")}</p>
          </div>
          {file.url && <a href={file.url} target="_blank" rel="noreferrer" className={iconBtn} aria-label="Open in a new tab" title="Open in a new tab"><Export className="h-5 w-5" /></a>}
          <button type="button" className={iconBtn} aria-label="Download" title="Download" onClick={() => void downloadFile(file)}><DocumentDownload className="h-5 w-5" /></button>
          <button type="button" className={iconBtn} aria-label="Close" title="Close (Esc)" onClick={onClose}><X className="h-5 w-5" /></button>
        </header>
        <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-14">
          <Body key={`${at}-${file.url ?? file.name}`} file={file} kind={kind} />
          {files.length > 1 && (
            <>
              <button type="button" aria-label="Previous" disabled={at === 0} onClick={() => go(-1)}
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 disabled:opacity-30 sm:block"><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" aria-label="Next" disabled={at === files.length - 1} onClick={() => go(1)}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 disabled:opacity-30 sm:block"><ChevronRight className="h-5 w-5" /></button>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
