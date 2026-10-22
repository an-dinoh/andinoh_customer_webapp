"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Callout, Input, Spinnerish } from "@/components/ui";
import { Login } from "@/components/icons";
import { safeFrom } from "@/components/RequireAccount";
import { errorMessage } from "@/utils/api";

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const from = safeFrom(params.get("from"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.replace(from);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to see your trips, points and messages.</p>
      {params.has("expired") && <div className="mt-5"><Callout tone="info">Your session ended. Please sign in again.</Callout></div>}
      {params.has("reset") && <div className="mt-5"><Callout tone="success">Password changed. Sign in with your new password.</Callout></div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input label="Email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex justify-end"><Link href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="text-sm font-medium text-primary hover:underline">Forgot password?</Link></div>
        {error && <Callout tone="danger">{error}</Callout>}
        <Button type="submit" size="lg" fullWidth loading={busy} icon={Login}>Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">New to Andinoh? <Link href={`/register${params.get("from") ? `?from=${encodeURIComponent(from)}` : ""}`} className="font-medium text-primary hover:underline">Create an account</Link></p>
      <p className="mt-2 text-center text-sm text-muted">Booked without an account? <Link href="/bookings/find" className="font-medium text-primary hover:underline">Find your booking</Link></p>
    </>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<Spinnerish />}><LoginForm /></Suspense>;
}
