"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/services/api";
import { useMutation } from "@/hooks/useApi";
import { safeFrom } from "@/components/RequireAccount";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, Input, Panel } from "@/components/ui";
import { Sms, Verify } from "@/components/icons";

/** Email verification (guide 3.6): a 6-digit code, valid 15 minutes, 3 tries. */
export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const from = safeFrom(params.get("from"), "/account");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const request = useMutation(() => authApi.requestEmailCode(), { success: "Code sent", onSuccess: () => setSent(true) });
  const confirm = useMutation(() => authApi.confirmEmail(otp), { silentError: true, onSuccess: async () => { await refreshProfile(); } });
  const done = confirm.busy === false && !confirm.error && profile?.email_verified;

  return (
    <Container narrow>
      <div className="mx-auto max-w-md">
        {params.has("welcome") && <div className="mb-5"><Callout tone="success" title="Welcome to Andinoh!">Your account is ready. One more step: confirm your email.</Callout></div>}
        <Panel>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary">{done ? <Verify className="h-6 w-6" /> : <Sms className="h-6 w-6" />}</span>
          {done ? (
            <>
              <h1 className="mt-4 text-xl font-semibold text-ink">Email verified</h1>
              <p className="mt-1 text-sm text-muted">Thanks! Any bookings you made with {user?.email} without signing in are now in your account.</p>
              <Button className="mt-6" fullWidth onClick={() => router.replace(from)}>Continue</Button>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-xl font-semibold text-ink">Verify your email</h1>
              <p className="mt-1 text-sm text-muted">{sent ? <>We sent a 6-digit code to <strong className="text-ink">{user?.email}</strong>. It expires in 15 minutes.</> : <>We’ll send a code to <strong className="text-ink">{user?.email}</strong>.</>}</p>
              {!sent ? (
                <div className="mt-6 space-y-2">
                  <Button fullWidth size="lg" loading={request.busy} onClick={() => request.run()}>Send code</Button>
                  <Button fullWidth variant="ghost" onClick={() => router.replace(from)}>Later</Button>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); void confirm.run(); }}>
                  <Input label="Code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="[&_input]:text-center [&_input]:text-lg [&_input]:tracking-[0.5em]" />
                  {confirm.error && <Callout tone="danger">{confirm.error.message}</Callout>}
                  <Button type="submit" fullWidth size="lg" loading={confirm.busy} disabled={otp.length !== 6}>Verify</Button>
                  <button type="button" className="w-full text-sm font-medium text-primary hover:underline" onClick={() => request.run()}>Send a new code</button>
                </form>
              )}
            </>
          )}
        </Panel>
      </div>
    </Container>
  );
}
