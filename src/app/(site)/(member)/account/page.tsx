"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { ActionRow, Avatar, Button, Callout, FormGrid, Input, Panel, Select, StatTile } from "@/components/ui";
import {
  Calendar, Camera, Coin, Gift, Location, Logout, MessageQuestion, Receipt, Setting, Shield, Sms, Star, Verify, Warning,
} from "@/components/icons";
import { formatDate } from "@/utils/format";
import type { CustomerProfile, Gender } from "@/types/api";

function DetailsForm({ profile, onSaved }: { profile: CustomerProfile; onSaved: (p: CustomerProfile) => void }) {
  const [form, setForm] = useState({ full_name: profile.full_name ?? "", phone_number: profile.phone_number ?? "", date_of_birth: profile.date_of_birth ?? "", gender: (profile.gender ?? "") as Gender });
  const save = useMutation(() => profileApi.update({
    full_name: form.full_name.trim(), phone_number: form.phone_number.trim(),
    ...(form.date_of_birth ? { date_of_birth: form.date_of_birth } : {}), ...(form.gender ? { gender: form.gender } : {}),
  }), { success: "Profile saved", onSuccess: onSaved });
  return (
        <Panel title="Personal details" description="Hotels see your name and phone on your bookings.">
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); void save.run(); }}>
            <FormGrid>
              <Input label="Full name" required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} error={save.fieldErrors.full_name} />
              <Input label="Phone" type="tel" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} error={save.fieldErrors.phone_number} />
              <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} error={save.fieldErrors.date_of_birth} hint="For birthday rewards." />
              <Select label="Gender" placeholder="Prefer not to say" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))}
                options={[{ value: "F", label: "Female" }, { value: "M", label: "Male" }, { value: "O", label: "Other" }, { value: "N", label: "Prefer not to say" }]} />
              <Input label="Email" value={profile.email} disabled hint="Contact support to change your email." />
            </FormGrid>
            <div className="flex justify-end"><Button type="submit" loading={save.busy}>Save changes</Button></div>
          </form>
        </Panel>
  );
}

export default function AccountPage() {
  const { profile, setProfile, logout, user } = useAuth();
  const router = useRouter();
  const dash = useQuery(() => profileApi.dashboard(), []);
  const photo = useMutation((f: File) => profileApi.setPhoto(f), { success: "Photo updated", onSuccess: setProfile });
  const stats = dash.data?.stats;

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        <label className="group relative w-fit cursor-pointer" title="Change photo">
          <span className="block [&>*]:!h-20 [&>*]:!w-20 [&>*]:!text-2xl"><Avatar name={profile?.full_name} src={profile?.profile_picture_url} size="lg" /></span>
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-white"><Camera className="h-4 w-4" /></span>
          <input type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) void photo.run(f); e.target.value = ""; }} />
        </label>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-2xl">{profile?.full_name || user?.full_name}</h1>
          <p className="text-sm text-muted">{profile?.email} · Member since {formatDate(profile?.date_joined)}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2.5 py-1 font-semibold text-gold-text ring-1 ring-inset ring-gold-ring"><Gift className="h-3.5 w-3.5" />{profile?.membership_tier_display} · {profile?.available_points.toLocaleString()} points</span>
            {profile?.email_verified ? <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 font-medium text-success"><Verify className="h-3.5 w-3.5" />Email verified</span> : null}
            {profile?.is_vip && <span className="rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet">VIP</span>}
          </div>
        </div>
      </div>

      {profile && !profile.email_verified && (
        <div className="mb-6"><Callout tone="warning" icon={Sms} title="Verify your email" action={<Button size="sm" href="/account/verify-email">Verify now</Button>}>
          Some hotels need a verified email before you can book or pay.</Callout></div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Bookings" icon={Calendar} value={stats?.total_bookings ?? "—"} loading={dash.loading} onClick={() => router.push("/trips")} />
        <StatTile label="Active stays" icon={Location} tone="info" value={stats?.active_bookings ?? "—"} loading={dash.loading} />
        <StatTile label="Reviews written" icon={Star} tone="gold" value={stats?.total_reviews ?? "—"} loading={dash.loading} onClick={() => router.push("/account/reviews")} />
        <StatTile label="Open complaints" icon={Warning} tone={stats?.open_complaints ? "warning" : "neutral"} value={stats?.open_complaints ?? "—"} loading={dash.loading} onClick={() => router.push("/account/complaints")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {profile ? <DetailsForm key={profile.profile} profile={profile} onSaved={setProfile} /> : <Panel title="Personal details"><span /></Panel>}
        <Panel padded={false}>
          <div className="p-2">
            <ActionRow icon={Gift} tone="primary" title="Points and referrals" description="Your tier, points and invite codes" href="/account/rewards" />
            <ActionRow icon={Coin} title="Tips" description="Thank-yous you’ve sent" href="/account/tips" />
            <ActionRow icon={Star} title="My reviews" href="/account/reviews" />
            <ActionRow icon={Warning} title="Complaints" description="Problems you’ve reported" href="/account/complaints" />
            <ActionRow icon={Receipt} title="Statement of account" description="Every booking and payment as a PDF" href="/account/statement" />
            <ActionRow icon={Location} title="Saved addresses" href="/account/addresses" />
            <ActionRow icon={Setting} title="Settings" description="Notifications, appearance, password, devices" href="/account/settings" />
            <ActionRow icon={Shield} title="Inspect hotels for Andinoh" href="/account/inspector" />
            <ActionRow icon={MessageQuestion} title="Help and support" href="/help" />
            <ActionRow icon={Logout} tone="danger" title="Sign out" onClick={async () => { await logout(); router.push("/"); }} />
          </div>
        </Panel>
      </div>
    </Container>
  );
}
