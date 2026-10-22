"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, Input, PageHeader, Panel, Select, Textarea } from "@/components/ui";
import { Call, CheckCircle, Mail, Send } from "@/components/icons";

const TOPICS = [
  { value: "bookings", label: "A booking" }, { value: "payments", label: "Payments and refunds" }, { value: "account", label: "My account" },
  { value: "pickups", label: "Pickups" }, { value: "other", label: "Something else" },
];

/** Contact support (guide 4): a ticket when signed in, otherwise email and phone. */
export default function ContactPage() {
  const { isAuthenticated } = useAuth();
  const config = useQuery(() => appApi.config(), []);
  const [form, setForm] = useState({ category: "bookings", subject: "", message: "" });
  const [ticket, setTicket] = useState<string | null>(null);
  const send = useMutation(() => appApi.contactSupport({ subject: form.subject.trim(), message: form.message.trim(), category: form.category }), { onSuccess: r => setTicket(r.ticket_id) });
  const c = config.data;
  return (
    <Container narrow>
      <PageHeader crumbs={[{ label: "Help", href: "/help" }, { label: "Contact" }]} title="Contact support" description="We usually reply within a working day." />
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <Panel>
          {ticket ? (
            <Callout tone="success" icon={CheckCircle} title={`Message sent · ${ticket}`}>We’ll reply by email. Quote {ticket} if you contact us about it.</Callout>
          ) : !isAuthenticated ? (
            <Callout tone="info" action={<Button size="sm" href="/login?from=%2Fhelp%2Fcontact">Sign in</Button>}>Sign in to send us a message here, or email or call us.</Callout>
          ) : (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); void send.run(); }}>
              <Select label="What’s it about?" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={TOPICS} />
              <Input label="Subject" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} error={send.fieldErrors.subject} />
              <Textarea label="Message" required rows={6} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} error={send.fieldErrors.message}
                hint="Include your booking code if it’s about a booking." />
              <Button type="submit" icon={Send} loading={send.busy} disabled={!form.subject.trim() || !form.message.trim()}>Send message</Button>
            </form>
          )}
        </Panel>
        <Panel title="Other ways">
          <ul className="space-y-3 text-sm">
            {c?.support_email && <li><a href={`mailto:${c.support_email}`} className="flex items-center gap-2 text-primary hover:underline"><Mail className="h-4 w-4" />{c.support_email}</a></li>}
            {c?.support_phone && <li><a href={`tel:${c.support_phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-primary hover:underline"><Call className="h-4 w-4" />{c.support_phone}</a></li>}
          </ul>
        </Panel>
      </div>
    </Container>
  );
}
