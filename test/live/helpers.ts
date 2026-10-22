import fs from 'node:fs';
import path from 'node:path';
import { ApiError, session } from '@/utils/api';
import { authApi } from '@/services/api';

const LIVE_DIR = path.join(process.cwd(), '.live');

export interface Seed {
  password: string;
  customer_email: string;
  owner_email: string;
  palmview_id: string;
  eko_id: string;
  aso_id: string;
  inn_id: string;
  deluxe_id: string;
  suite_id: string;
  eko_room_id: string;
  garden_id: string;
  spa_id: string;
  breakfast_id: string;
  upcoming_booking_id: string;
  in_house_booking_id: string;
  finished_booking_id: string;
  awaiting_booking_id: string;
  chat_id: string;
  staff_id: string;
  airport_id: number;
  lagos_state_id: string;
  lekki_city_id: string;
  abuja_city_id: string;
}

export function seed(): Seed {
  return JSON.parse(fs.readFileSync(path.join(LIVE_DIR, 'seed.json'), 'utf8'));
}

/** Signs in through the API and makes the session current for every following call. */
export async function signIn(email: string, password: string) {
  const res = await authApi.login({ email, password, device_name: 'Live test (jsdom)', platform: 'web' });
  session.store(res.access_token, res.refresh_token);
  return res;
}

export function signOutLocally() {
  session.clear();
}

/** The rejection of `promise`, which must be an ApiError with `status`. */
export async function expectApiError(promise: Promise<unknown>, status: number): Promise<ApiError> {
  const err = await promise.then(() => null, e => e);
  if (!(err instanceof ApiError)) throw new Error(`Expected ApiError ${status}, got ${err === null ? 'success' : String(err)}`);
  expect(err.status).toBe(status);
  expect(err.message.length).toBeGreaterThan(0);
  return err;
}

/** The newest email to `to` whose text matches `pattern`, decoded from quoted-printable. */
export function latestEmail(to: string, pattern: RegExp): string {
  const dir = path.join(LIVE_DIR, 'emails');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).map(f => path.join(dir, f)) : [];
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8').replace(/=\r?\n/g, '').replace(/=3D/g, '=');
    for (const message of text.split(/-{70,}/).reverse()) {
      if (message.toLowerCase().includes(`to: ${to.toLowerCase()}`) && pattern.test(message)) return message;
    }
  }
  throw new Error(`No email to ${to} matching ${pattern}`);
}

// A real 8×8 PNG made with Pillow (the backend decodes uploads) and a minimal MP4 header.
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGOUqzjBgA0wYRUdtBIAFSEBbljO5/4AAAAASUVORK5CYII='), c => c.charCodeAt(0));

export function png(name = 'photo.png'): File {
  return new File([PNG], name, { type: 'image/png' });
}

export function mp4(name = 'tour.mp4'): File {
  const header = new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, 0, 0, 0, 0, 0x6d, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6f, 0x6d, ...new Array(64).fill(0)]);
  return new File([header], name, { type: 'video/mp4' });
}

export function pdf(name = 'contract.pdf'): File {
  return new File(['%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF'], name, { type: 'application/pdf' });
}

/** YYYY-MM-DD n days from today in Lagos. */
export function day(n = 0): string {
  const d = new Date(Date.now() + n * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export const unique = () => Math.random().toString(36).slice(2, 8);

/** The transaction id the offline gateway put in a payment link (as Flutterwave does on its return). */
export function paidTransaction(link: string | null | undefined): string {
  const id = new URL(link ?? '').searchParams.get('transaction_id');
  if (!id) throw new Error(`No transaction id in ${link}`);
  return id;
}
