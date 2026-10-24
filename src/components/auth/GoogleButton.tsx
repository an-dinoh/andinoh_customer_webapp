"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/services/api";
import { errorMessage } from "@/utils/api";

/**
 * "Continue with Google" (shared guide 3.5), as in the mobile app: Google's own button gives an ID
 * token, which POST /auth/google/ turns into an Andinoh session (creating the account the first time).
 *
 * The client ID is the mobile app's server client ID, which the backend lists in GOOGLE_CLIENT_IDS.
 * Google only shows the button on origins added to that client's "Authorized JavaScript origins".
 */
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "282813329592-ivipq3h0ajre6k57qamtrmkk1rm0arjv.apps.googleusercontent.com";

interface GoogleId {
  initialize(config: { client_id: string; callback: (r: { credential?: string }) => void; ux_mode?: "popup"; auto_select?: boolean }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
}

let loading: Promise<GoogleId> | null = null;

function loadGoogle(): Promise<GoogleId> {
  const w = window as unknown as { google?: { accounts?: { id?: GoogleId } } };
  if (w.google?.accounts?.id) return Promise.resolve(w.google.accounts.id);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => (w.google?.accounts?.id ? resolve(w.google.accounts.id) : reject(new Error("Google sign-in didn’t load.")));
    s.onerror = () => { loading = null; reject(new Error("Google sign-in couldn’t load. Check your connection.")); };
    document.head.appendChild(s);
  });
  return loading;
}

export default function GoogleButton({ onSignedIn, text = "continue_with" }: { onSignedIn: () => void; text?: "continue_with" | "signup_with" | "signin_with" }) {
  const { adoptSession } = useAuth();
  const box = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const done = useRef(onSignedIn);
  useEffect(() => { done.current = onSignedIn; });

  useEffect(() => {
    let cancelled = false;
    loadGoogle().then(google => {
      if (cancelled || !box.current) return;
      google.initialize({
        client_id: CLIENT_ID,
        ux_mode: "popup",
        callback: async ({ credential }) => {
          if (!credential) { setError("Google didn’t return an account. Please try again."); return; }
          setBusy(true);
          setError(null);
          try {
            await adoptSession(await authApi.google(credential));
            done.current();
          } catch (e) {
            setError(errorMessage(e, "We couldn’t sign you in with Google."));
            setBusy(false);
          }
        },
      });
      google.renderButton(box.current, { theme: "outline", size: "large", shape: "pill", text, logo_alignment: "center", width: box.current.offsetWidth || 400 });
    }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [adoptSession, text]);

  return (
    <div>
      <div ref={box} className={`flex min-h-11 w-full justify-center ${busy ? "pointer-events-none opacity-60" : ""}`} aria-busy={busy || undefined} />
      {error && <p role="alert" className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}

/** "or" between Google and the email form. */
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted" role="separator">
      <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
    </div>
  );
}
