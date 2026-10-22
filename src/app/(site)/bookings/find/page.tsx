"use client";

import { useState } from "react";
import { guestBookingsApi } from "@/services/api";
import { useMutation } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, Input, Panel } from "@/components/ui";
import { Sms } from "@/components/icons";

/** "Find my booking" (guide 7.4): a new link is emailed; the old one stops working. */
export default function FindBookingPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const lookup = useMutation(() => guestBookingsApi.lookup(code.trim().toUpperCase(), email.trim()), { silentError: true, onSuccess: r => setSent(r.message) });
  return (
    <Container narrow>
      <div className="mx-auto max-w-md">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-2xl">Find your booking</h1>
        <p className="mt-1 text-sm text-muted">Booked without an account? Enter your confirmation code and the email you booked with, and we’ll send you a new link.</p>
        <Panel className="mt-6">
          {sent ? (
            <Callout tone="success" icon={Sms} title="Check your email">
              {sent} The new link replaces any older one.
            </Callout>
          ) : (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); void lookup.run(); }}>
              <Input label="Confirmation code" required value={code} onChange={e => setCode(e.target.value)} placeholder="LER6C0M15R" className="[&_input]:font-mono [&_input]:uppercase" />
              <Input label="Email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
              {lookup.error && <Callout tone="danger">{lookup.error.message}</Callout>}
              <Button type="submit" fullWidth size="lg" loading={lookup.busy}>Email me the link</Button>
            </form>
          )}
        </Panel>
      </div>
    </Container>
  );
}
