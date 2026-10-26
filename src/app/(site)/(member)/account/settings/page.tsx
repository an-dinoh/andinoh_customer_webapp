"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { authApi, currencyApi, devicesApi, profileApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import PasswordRules from "@/components/auth/PasswordRules";
import { Container } from "@/components/shell/SiteShell";
import { Button, Callout, ConfirmDialog, Input, PageHeader, Panel, Segmented, Select, Skeleton, Toggle } from "@/components/ui";
import { Bell, Key, Mobile, Monitor, Moon, Trash } from "@/components/icons";
import { CURRENCY_KEY, displayCurrency, session } from "@/utils/api";
import { queryCache } from "@/utils/queryCache";
import { formatDateTime, timeAgo } from "@/utils/format";
import { passwordOk } from "@/utils/stay";
import type { NotificationPreferences } from "@/types/api";

const GROUPS: { title: string; items: [keyof NotificationPreferences, string][] }[] = [
  { title: "Email", items: [["email_booking_confirmations", "Booking confirmations"], ["email_reminders", "Reminders before your stay"], ["email_reviews", "Review requests"], ["email_points", "Points and rewards"], ["email_complaints", "Complaint updates"], ["email_promotions", "Offers and deals"]] },
  { title: "On this device and your phone", items: [["push_booking_confirmations", "Booking confirmations"], ["push_reminders", "Reminders"], ["push_reviews", "Review requests"], ["push_points", "Points and rewards"], ["push_promotions", "Offers and deals"]] },
  { title: "SMS", items: [["sms_booking_confirmations", "Booking confirmations"], ["sms_reminders", "Reminders"], ["sms_urgent_only", "Only urgent messages"]] },
];

function NotificationSettings() {
  const prefs = useQuery(() => profileApi.notificationPreferences(), []);
  const save = useMutation((patch: Partial<NotificationPreferences>) => profileApi.updateNotificationPreferences(patch), { onSuccess: p => prefs.setData(p) });
  const p = prefs.data;
  const set = (patch: Partial<NotificationPreferences>) => { prefs.setData(d => (d ? { ...d, ...patch } : d)); void save.run(patch); };
  return (
    <Panel title="Notifications" icon={Bell} description="Choose what we send and where. Important booking and payment messages are always sent.">
      {!p ? <Skeleton className="h-40 w-full" /> : (
        <div className="space-y-6">
          <Toggle label="In-app notifications" description="The bell in the top bar." checked={p.app_all_notifications} onChange={v => set({ app_all_notifications: v })} />
          {GROUPS.map(g => (
            <div key={g.title}>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">{g.title}</p>
              <div className="divide-y divide-line">{g.items.map(([k, label]) => <Toggle key={k} label={label} checked={Boolean(p[k])} onChange={v => set({ [k]: v })} />)}</div>
            </div>
          ))}
          <Select label="Email digest" value={p.digest_frequency} onChange={e => set({ digest_frequency: e.target.value as NotificationPreferences["digest_frequency"] })}
            options={[{ value: "NEVER", label: "Never" }, { value: "DAILY", label: "Daily" }, { value: "WEEKLY", label: "Weekly" }, { value: "MONTHLY", label: "Monthly" }]} />
          <div>
            <Toggle label="Quiet hours" description="No push notifications during these hours." checked={p.quiet_hours_enabled} onChange={v => set({ quiet_hours_enabled: v, ...(v && !p.quiet_hours_start ? { quiet_hours_start: "22:00:00", quiet_hours_end: "07:00:00", quiet_hours_timezone: "Africa/Lagos" } : {}) })} />
            {p.quiet_hours_enabled && (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Input label="From" type="time" value={(p.quiet_hours_start ?? "").slice(0, 5)} onChange={e => set({ quiet_hours_start: `${e.target.value}:00` })} />
                <Input label="Until" type="time" value={(p.quiet_hours_end ?? "").slice(0, 5)} onChange={e => set({ quiet_hours_end: `${e.target.value}:00` })} />
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

function Appearance() {
  const { preference, setPreference } = useTheme();
  const currencies = useQuery(() => currencyApi.list(), []);
  const [currency, setCurrency] = useState(() => displayCurrency() ?? "NGN");
  const pick = (c: string) => {
    setCurrency(c);
    try { if (c === "NGN") localStorage.removeItem(CURRENCY_KEY); else localStorage.setItem(CURRENCY_KEY, c); } catch { /* private mode */ }
    queryCache.clear();
  };
  const options = (currencies.data?.results ?? []).filter(c => c.is_active).map(c => ({ value: c.code, label: `${c.code} · ${c.name}` }));
  return (
    <Panel title="Appearance and currency" icon={Moon}>
      <Segmented label="Theme" value={preference} onChange={setPreference} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "Match device" }]} />
      <div className="mt-5">
        <Select label="Show room prices also in" value={currency} onChange={e => pick(e.target.value)} options={options.length ? options : [{ value: "NGN", label: "NGN · Nigerian Naira" }]}
          hint="For reference only: you always pay in naira." />
      </div>
    </Panel>
  );
}

function Security() {
  const { adoptSession } = useAuth();
  const [pw, setPw] = useState({ current: "", next: "" });
  const sessions = useQuery(() => authApi.sessions(), []);
  const [allSessions, setAllSessions] = useState(false);
  // Most recently active first; long lists are folded.
  const sorted = [...(sessions.data ?? [])].sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));
  const shown = allSessions ? sorted : sorted.slice(0, 5);
  const devices = useQuery(() => devicesApi.list(), []);
  const change = useMutation(() => authApi.changePassword(pw.current, pw.next), {
    success: "Password changed. Other devices were signed out.",
    onSuccess: async r => { setPw({ current: "", next: "" }); await adoptSession(r); void sessions.reload(); },
  });
  const others = useMutation(() => authApi.signOutOthers(session.refresh() ?? ""), { success: r => r.message, onSuccess: () => void sessions.reload() });
  const forget = useMutation((id: number) => devicesApi.unregister(id), { success: "Device removed", onSuccess: () => void devices.reload() });
  return (
    <>
      <Panel title="Password" icon={Key} description="Changing it signs you out everywhere else.">
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); void change.run(); }}>
          <Input label="Current password" type="password" autoComplete="current-password" required value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} error={change.fieldErrors.current_password} />
          <Input label="New password" type="password" autoComplete="new-password" required value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} error={change.fieldErrors.new_password} />
          <PasswordRules password={pw.next} />
          <div className="flex justify-end"><Button type="submit" loading={change.busy} disabled={!pw.current || !passwordOk(pw.next)}>Change password</Button></div>
        </form>
      </Panel>
      <Panel title="Signed-in devices" icon={Monitor} actions={(sessions.data?.length ?? 0) > 1 && <Button size="sm" variant="outline" loading={others.busy} onClick={() => others.run()}>Sign out others</Button>}>
        {!sessions.data ? <Skeleton className="h-16 w-full" /> : (
          <ul className="divide-y divide-line">{shown.map(s => (
            <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-ink-2">{s.platform === "web" ? <Monitor className="h-[18px] w-[18px]" /> : <Mobile className="h-[18px] w-[18px]" />}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink">{s.device_name || "Unknown device"}</span>
                <span className="block text-xs text-muted">{[s.os_version, s.ip_address, `active ${timeAgo(s.last_seen_at)}`].filter(Boolean).join(" · ")}</span></span>
            </li>
          ))}</ul>
        )}
        {sorted.length > 5 && (
          <button type="button" onClick={() => setAllSessions(v => !v)} className="mt-2 py-1.5 text-sm font-medium text-primary hover:underline">
            {allSessions ? "Show fewer" : `Show all ${sorted.length}`}
          </button>
        )}
      </Panel>
      {(devices.data?.results.length ?? 0) > 0 && (
        <Panel title="Phones getting notifications" icon={Mobile}>
          <ul className="divide-y divide-line">{devices.data!.results.map(d => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 text-sm">
              <span><span className="block font-medium text-ink">{d.device_name}</span><span className="block text-xs text-muted">{[d.os_version, d.app_version, `last used ${formatDateTime(d.last_used_at)}`].filter(Boolean).join(" · ")}</span></span>
              <Button size="sm" variant="danger-ghost" onClick={() => forget.run(d.id)}>Remove</Button>
            </li>
          ))}</ul>
        </Panel>
      )}
    </>
  );
}

function DeleteAccount() {
  const router = useRouter();
  const { logout } = useAuth();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const remove = useMutation((password: string) => profileApi.deleteAccount(password), {
    success: r => `${r.message}. ${r.note}.`,
    onSuccess: async () => { setStep(0); await logout(); router.replace("/"); },
  });
  return (
    <Panel title="Delete account" icon={Trash}>
      <p className="text-sm text-muted">This removes your profile, points and history. You can’t delete it while you have upcoming or in-progress bookings.</p>
      {remove.error && <div className="mt-3"><Callout tone="danger">{remove.error.message}</Callout></div>}
      <Button variant="danger-ghost" className="mt-4" icon={Trash} onClick={() => setStep(1)}>Delete my account</Button>
      <ConfirmDialog open={step === 1} onClose={() => setStep(0)} title="Delete your account?" confirmLabel="Yes, continue" onConfirm={() => setStep(2)}
        description="Your points will be lost and you’ll be signed out. Your data is kept for 30 days, then deleted for good." />
      <ConfirmDialog open={step === 2} onClose={() => setStep(0)} title="Confirm with your password" confirmLabel="Delete account" busy={remove.busy}
        ask={{ kind: "password", label: "Password", required: true }} onConfirm={pw => remove.run(pw)} />
    </Panel>
  );
}

export default function SettingsPage() {
  return (
    <Container>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Settings" }]} title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6"><NotificationSettings /><Appearance /></div>
        <div className="space-y-6"><Security /><DeleteAccount /></div>
      </div>
    </Container>
  );
}
