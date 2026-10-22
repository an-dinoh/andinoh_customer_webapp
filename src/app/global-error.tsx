"use client";

import { useEffect } from "react";

/** Last resort when the root layout itself fails; no app styles or fonts are guaranteed here. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F4F6F9", color: "#101828" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Andinoh couldn’t load</h1>
          <p style={{ color: "#667085", fontSize: 14, maxWidth: 420 }}>Please try again. If it keeps happening, contact support{error.digest ? ` and quote ${error.digest}` : ""}.</p>
          <button onClick={reset} style={{ marginTop: 16, background: "#0F75BD", color: "#fff", border: 0, borderRadius: 12, padding: "10px 18px", fontSize: 14, cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
