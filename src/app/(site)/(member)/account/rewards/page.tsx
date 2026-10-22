"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { referralsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Cell, DataTable, Input, PageHeader, Panel, StatTile, StatusPill, type Column } from "@/components/ui";
import { Copy, Crown, Gift, Share, UserAdd, Users } from "@/components/icons";
import { formatDate, money } from "@/utils/format";
import type { Referral } from "@/types/api";

/** Loyalty points and tier (guide 11.2) and referrals (11.3). */
export default function RewardsPage() {
  const { profile } = useAuth();
  const [email, setEmail] = useState("");
  const stats = useQuery(() => referralsApi.stats(), []);
  const list = useQuery(() => referralsApi.list(), []);
  const invite = useMutation(() => referralsApi.invite(email.trim()), {
    success: "Invite created. Share the code with your friend.",
    onSuccess: () => { setEmail(""); void list.reload(); void stats.reload(); },
  });
  const share = async (code: string) => {
    const url = `${window.location.origin}/register?ref=${encodeURIComponent(code)}`;
    const text = `Join me on Andinoh with my code ${code} and we both get points after your first stay.`;
    if (navigator.share) { try { await navigator.share({ title: "Andinoh", text, url }); return; } catch { /* closed */ } }
    await navigator.clipboard?.writeText(`${text} ${url}`);
    toast.success("Invite link copied");
  };
  const cols: Column<Referral>[] = [
    { key: "e", header: "Friend", render: r => <Cell primary={r.referral_email} secondary={`Invited ${formatDate(r.created_at)}`} /> },
    { key: "c", header: "Code", render: r => <button type="button" onClick={() => share(r.referral_code)} className="inline-flex items-center gap-1 font-mono text-sm text-primary">{r.referral_code}<Copy className="h-3.5 w-3.5" /></button> },
    { key: "s", header: "Status", render: r => <StatusPill status={r.status === "COMPLETED" ? "completed" : r.status === "EXPIRED" ? "expired" : "pending"} label={r.reward_awarded ? "Rewarded" : undefined} /> },
  ];
  const points = profile?.available_points ?? 0;
  return (
    <Container>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Points and referrals" }]} title="Points and referrals" description="Earn 1 point for every naira you spend on stays. 100 points take ₦1 off a booking." />
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark to-[#071F33] p-6 text-white sm:p-8">
        <p className="inline-flex items-center gap-1.5 text-sm text-white/70"><Crown className="h-4 w-4 text-secondary" />{profile?.membership_tier_display} member</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight tabular">{points.toLocaleString()} <span className="text-lg font-normal text-white/70">points</span></p>
        <p className="mt-1 text-sm text-white/70">Worth {money(points / 100)} off your next booking · {(profile?.total_points ?? 0).toLocaleString()} earned in total</p>
        <Button variant="gold" className="mt-5" href="/hotels" icon={Gift}>Use them on a stay</Button>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile label="Invited" icon={Users} value={stats.data?.total_referrals ?? "—"} loading={stats.loading} />
        <StatTile label="Joined and stayed" icon={UserAdd} tone="success" value={stats.data?.completed_referrals ?? "—"} loading={stats.loading} />
        <StatTile label="Waiting" icon={Share} tone="warning" value={stats.data?.pending_referrals ?? "—"} loading={stats.loading} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel title="Invite a friend" description="When they complete their first stay, you get 200 points and they get 100.">
          <form className="space-y-3" onSubmit={e => { e.preventDefault(); void invite.run(); }}>
            <Input label="Their email" type="email" required value={email} onChange={e => setEmail(e.target.value)} error={invite.fieldErrors.referral_email} />
            <Button type="submit" fullWidth loading={invite.busy} icon={UserAdd}>Create invite</Button>
          </form>
        </Panel>
        <Panel title="Your invites" padded={false}>
          <DataTable columns={cols} rows={list.data?.results} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={r => r.id}
            empty={{ icon: Users, title: "No invites yet", description: "Invite friends and you’ll both earn points." }} />
        </Panel>
      </div>
    </Container>
  );
}
