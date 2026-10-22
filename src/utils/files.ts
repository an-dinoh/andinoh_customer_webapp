// How the app opens a file in place (chat attachments, receipts, statements) instead of downloading it.

/** How a file is shown in the viewer. */
export type ViewKind = 'image' | 'video' | 'audio' | 'pdf' | 'office' | 'text' | 'other';

const IMAGE = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'avif']);
const VIDEO = new Set(['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv', '3gp']);
const AUDIO = new Set(['m4a', 'aac', 'mp3', 'ogg', 'opus', 'wav', 'amr', 'flac']);
const OFFICE = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf']);
const TEXT = new Set(['txt', 'csv', 'tsv', 'md', 'json', 'log']);

/** "menu.PDF" → "pdf"; also reads a URL's last path segment. */
export function extension(nameOrUrl: string | null | undefined): string {
  if (!nameOrUrl) return '';
  const last = nameOrUrl.split(/[?#]/)[0].split('/').pop() ?? '';
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(dot + 1).toLowerCase() : '';
}

/**
 * How to show a file, from the server's chat `message_type` when there is one, else its name, URL or
 * content type. The browser can't play every format the server accepts (HEIC, AMR, MKV…); those still
 * open here and fall back to a download if the browser refuses them.
 */
export function viewKind(file: { name?: string | null; url?: string | null; contentType?: string | null; type?: string | null }): ViewKind {
  const ext = extension(file.name) || extension(file.url);
  const ct = (file.contentType ?? '').toLowerCase();
  if (file.type === 'image' || IMAGE.has(ext) || ct.startsWith('image/')) return 'image';
  if (file.type === 'video' || VIDEO.has(ext) || ct.startsWith('video/')) return 'video';
  if (file.type === 'audio' || AUDIO.has(ext) || ct.startsWith('audio/')) return 'audio';
  if (file.type === 'document' || ext === 'pdf' || ct === 'application/pdf') return 'pdf';
  if (OFFICE.has(ext) || /officedocument|msword|ms-excel|ms-powerpoint|opendocument/.test(ct)) return 'office';
  if (TEXT.has(ext) || ct.startsWith('text/') || ct === 'application/json') return 'text';
  return 'other';
}

/** "482 KB", "1.4 MB". */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

/** "1:05" for audio and video lengths. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return '';
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`;
}

/** Whether a URL can be fetched by an outside viewer (not localhost or a private address). */
export function isPublicUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    return !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\])/.test(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Microsoft's viewer shows Word, Excel and PowerPoint files from a public link, so they open here
 * without downloading. The file's link is sent to Microsoft to fetch it.
 */
export function officeViewerUrl(url: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

/** A Cloudinary picture of one page of a PDF (used when the PDF itself can't be shown). */
export function pdfPageImage(url: string, page = 1): string | null {
  if (!/res\.cloudinary\.com\/.+\/image\/upload\//.test(url)) return null;
  return url.replace('/upload/', `/upload/pg_${page},f_jpg,w_1400,q_auto/`).replace(/\.pdf($|\?)/i, '.jpg$1');
}

/** Rows of a CSV or TSV file (quoted fields with commas, quotes and line breaks are handled). */
export function parseDelimited(text: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === delimiter) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}
