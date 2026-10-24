"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Callout, Checkbox, Input, Spinnerish } from "@/components/ui";
import { UserAdd } from "@/components/icons";
import PasswordRules from "@/components/auth/PasswordRules";
import { safeFrom } from "@/components/RequireAccount";
import GoogleButton, { OrDivider } from "@/components/auth/GoogleButton";
import { ApiError, errorMessage } from "@/utils/api";
import { passwordOk } from "@/utils/stay";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const from = safeFrom(params.get("from"));
  const [form, setForm] = useState({
    full_name: params.get("name") ?? "", email: params.get("email") ?? "", phone_number: "", password: "", referral_code: params.get("ref") ?? "",
  });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const fe = error instanceof ApiError ? error.fieldErrors : {};
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({
        email: form.email.trim(), password: form.password, full_name: form.full_name.trim(),
        ...(form.phone_number.trim() ? { phone_number: form.phone_number.trim() } : {}),
        ...(form.referral_code.trim() ? { referral_code: form.referral_code.trim() } : {}),
      });
      // Signed in straight away; ask them to verify their email next (guide 3.6).
      router.replace(`/account/verify-email?welcome=1&from=${encodeURIComponent(from)}`);
    } catch (err) {
      setError(err as Error);
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Book faster, earn points and keep every trip in one place.</p>
      <div className="mt-6"><GoogleButton text="signup_with" onSignedIn={() => router.replace(from)} /></div>
      <OrDivider />
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" autoComplete="name" required value={form.full_name} onChange={set("full_name")} error={fe.full_name} />
        <Input label="Email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} error={fe.email} />
        <Input label="Phone" type="tel" autoComplete="tel" placeholder="+234…" value={form.phone_number} onChange={set("phone_number")} error={fe.phone_number} hint="Optional. Hotels use it if they need to reach you." />
        <div className="space-y-2">
          <Input label="Password" type="password" autoComplete="new-password" required value={form.password} onChange={set("password")} error={fe.password} />
          <PasswordRules password={form.password} />
        </div>
        <Input label="Referral code" value={form.referral_code} onChange={set("referral_code")} error={fe.referral_code} hint="Optional. You both earn points after your first stay." />
        <Checkbox checked={agreed} onChange={setAgreed} label={<>I agree to the <Link href="/legal/terms-of-service" target="_blank" className="text-primary underline">terms</Link> and <Link href="/legal/privacy-policy" target="_blank" className="text-primary underline">privacy policy</Link>.</>} />
        {error && !Object.keys(fe).length && <Callout tone="danger">{errorMessage(error)}</Callout>}
        <Button type="submit" size="lg" fullWidth loading={busy} icon={UserAdd} disabled={!agreed || !passwordOk(form.password)}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href={`/login${params.get("from") ? `?from=${encodeURIComponent(from)}` : ""}`} className="font-medium text-primary hover:underline">Sign in</Link></p>
    </>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<Spinnerish />}><RegisterForm /></Suspense>;
}
