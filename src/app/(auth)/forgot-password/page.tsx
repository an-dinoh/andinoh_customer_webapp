"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authApi } from "@/services/api";
import { useMutation } from "@/hooks/useApi";
import { Button, Callout, Input, Spinnerish } from "@/components/ui";
import PasswordRules from "@/components/auth/PasswordRules";
import { passwordOk } from "@/utils/stay";

type Step = "email" | "code" | "password";

/** Forgot password in three steps (guide 3.7): email → 6-digit code → new password. */
function Reset() {
  const params = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const request = useMutation(() => authApi.requestPasswordReset(email.trim()), { onSuccess: () => setStep("code"), silentError: true });
  const verify = useMutation(() => authApi.verifyResetCode(email.trim(), otp.trim()), { onSuccess: r => { setToken(r.reset_token); setStep("password"); }, silentError: true });
  const reset = useMutation(() => authApi.resetPassword(token, password), { onSuccess: () => router.replace("/login?reset=1"), silentError: true });
  const current = { email: request, code: verify, password: reset }[step];

  return (
    <>
      <p className="text-xs font-medium text-muted">Step {step === "email" ? 1 : step === "code" ? 2 : 3} of 3</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
        {step === "email" ? "Reset your password" : step === "code" ? "Check your email" : "Choose a new password"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {step === "email" ? "We’ll email you a 6-digit code." : step === "code" ? `If ${email} has an account, a code is on its way. It expires in 15 minutes.` : "Use something you don’t use anywhere else."}
      </p>
      <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); void current.run(); }}>
        {step === "email" && <Input label="Email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />}
        {step === "code" && (
          <Input label="6-digit code" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} className="[&_input]:text-center [&_input]:text-lg [&_input]:tracking-[0.5em]" />
        )}
        {step === "password" && (
          <>
            <Input label="New password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} error={reset.fieldErrors.new_password} />
            <PasswordRules password={password} />
            <Input label="Confirm password" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              error={confirm && confirm !== password ? "The passwords don’t match." : undefined} />
          </>
        )}
        {current.error && <Callout tone="danger">{current.error.message}</Callout>}
        <Button type="submit" size="lg" fullWidth loading={current.busy}
          disabled={(step === "code" && otp.length !== 6) || (step === "password" && (!passwordOk(password) || password !== confirm))}>
          {step === "email" ? "Send code" : step === "code" ? "Continue" : "Change password"}
        </Button>
        {step === "code" && <button type="button" onClick={() => request.run()} className="w-full text-sm font-medium text-primary hover:underline">Send a new code</button>}
      </form>
      <p className="mt-6 text-center text-sm text-muted"><Link href="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></p>
    </>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={<Spinnerish />}><Reset /></Suspense>;
}
