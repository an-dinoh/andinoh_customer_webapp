"use client";

import { tipsApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Cell, DataTable, PageHeader, Panel, StatTile, StatusPill, type Column } from "@/components/ui";
import { Coin, Heart } from "@/components/icons";
import { formatDate, money } from "@/utils/format";
import type { Tip } from "@/types/api";

/** Tips I've given (guide 10.2). Give one from a checked-in stay. */
export default function TipsPage() {
  const list = useQuery(() => tipsApi.list(), []);
  const stats = useQuery(() => tipsApi.stats(), []);
  const cols: Column<Tip>[] = [
    { key: "w", header: "To", render: t => <Cell primary={t.staff_name} secondary={`${t.staff_role} · ${t.hotel_name}`} /> },
    { key: "d", header: "Date", hideOnMobile: true, render: t => formatDate(t.created_at) },
    { key: "h", header: "How", hideOnMobile: true, render: t => (t.charged_to_room ? "On my room bill" : "Paid online") },
    { key: "s", header: "Status", render: t => <StatusPill status={t.payment_status} /> },
    { key: "a", header: "Amount", align: "right", render: t => <span className="font-semibold tabular">{money(t.amount, t.currency)}</span> },
  ];
  return (
    <Container>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Tips" }]} title="Tips" description="Thank the people who looked after you. Tip from a stay while you’re checked in." />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <StatTile label="Tips sent" icon={Heart} tone="danger" value={stats.data?.total_tips ?? "—"} loading={stats.loading} />
        <StatTile label="Total given" icon={Coin} tone="success" value={stats.data ? money(stats.data.total_amount, stats.data.currency, { decimals: false }) : "—"} loading={stats.loading} />
      </div>
      <Panel padded={false}>
        <DataTable columns={cols} rows={list.data?.results} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={t => t.id}
          empty={{ icon: Heart, title: "No tips yet", description: "During a stay, open the booking and tap “Tip staff”." }} />
      </Panel>
    </Container>
  );
}
