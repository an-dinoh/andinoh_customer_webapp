"use client";

import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/services/api";
import { useMutation } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, PageHeader, Panel, StatusPill } from "@/components/ui";
import { ClipboardTick, Location, Shield, Wallet } from "@/components/icons";

const INSPECTOR_APP = process.env.NEXT_PUBLIC_INSPECTOR_APP_URL ?? "https://inspectors.andinoh.com";

const STEPS = [
  { icon: ClipboardTick, title: "Apply here", text: "We open an application on your account. You stay a customer." },
  { icon: Shield, title: "Finish in the inspector app", text: "Add your ID, experience and the states you cover. Andinoh reviews it." },
  { icon: Location, title: "Visit hotels", text: "Accept nearby inspections and report what you find." },
  { icon: Wallet, title: "Get paid", text: "Every completed inspection is paid to your bank account." },
];

/** Applying to inspect hotels from a customer account (guide 16). */
export default function InspectorPage() {
  const { user, updateUser } = useAuth();
  const status = user?.inspector_status;
  const apply = useMutation(() => profileApi.applyToInspect(), {
    success: "Application started",
    // Sign-in carries inspector_status from now on; show it straight away.
    onSuccess: app => updateUser({ inspector_status: app.status }),
  });
  return (
    <Container narrow>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Inspect hotels" }]} title="Inspect hotels for Andinoh"
        description="Help travellers trust where they stay, and earn from each visit." meta={status ? <StatusPill status={status} label={`Application: ${status.replace(/_/g, " ")}`} /> : undefined} />
      <Panel>
        <ol className="grid gap-5 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary"><s.icon className="h-5 w-5" /></span>
              <span><span className="block text-sm font-semibold text-ink">{i + 1}. {s.title}</span><span className="block text-sm text-muted">{s.text}</span></span>
            </li>
          ))}
        </ol>
        <div className="mt-6 border-t border-line pt-5">
          {status ? (
            <Callout tone={status === "approved" ? "success" : status === "rejected" ? "danger" : "info"} title={status === "approved" ? "You’re an approved inspector" : "Your application is open"}
              action={<Button href={INSPECTOR_APP}>Open the inspector app</Button>}>
              Sign in to the inspector app with this same email and password to {status === "approved" ? "take inspections" : "finish your application"}.
            </Callout>
          ) : (
            <>
              {apply.error && <div className="mb-3"><Callout tone="danger">{apply.error.message}</Callout></div>}
              <Button size="lg" loading={apply.busy} onClick={() => apply.run()}>Start my application</Button>
            </>
          )}
        </div>
      </Panel>
    </Container>
  );
}
