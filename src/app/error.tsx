"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { Refresh, Home } from "@/components/icons";
import Logo from "@/components/Logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <Logo width={110} height={19} className="mb-10 h-5 w-auto" priority />
      <h1 className="text-2xl font-semibold text-ink">Something went wrong on this page</h1>
      <p className="mt-2 max-w-md text-sm text-muted">Your data is safe. Try again, or go back home.{error.digest && <span className="mt-2 block text-xs text-subtle">Reference {error.digest}</span>}</p>
      <div className="mt-8 flex gap-3">
        <Button icon={Refresh} onClick={reset}>Try again</Button>
        <Button variant="outline" icon={Home} href="/">Home</Button>
      </div>
    </div>
  );
}
