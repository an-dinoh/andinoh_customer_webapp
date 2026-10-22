"use client";

import { useRouter } from "next/navigation";
import { pickupsApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, Cell, DataTable, PageHeader, Panel, StatTile, StatusPill, type Column } from "@/components/ui";
import { Calendar, Car, Coin, Plus } from "@/components/icons";
import { formatDate, money } from "@/utils/format";
import type { PickupBrief } from "@/types/api";

/** Airport and city pickups (guide 10.3). */
export default function PickupsPage() {
  const router = useRouter();
  const list = useQuery(() => pickupsApi.list(), []);
  const summary = useQuery(() => pickupsApi.summary(), []);
  const s = summary.data?.statistics;
  const cols: Column<PickupBrief>[] = [
    { key: "r", header: "Ride", render: p => <Cell primary={`${p.pickup_location_name || "Pickup"} → ${p.destination_address}`} secondary={<span className="font-mono">{p.confirmation_code}</span>} /> },
    { key: "w", header: "When", render: p => `${formatDate(p.pickup_date, { year: undefined })}, ${p.pickup_time.slice(0, 5)}` },
    { key: "s", header: "Status", render: p => <StatusPill status={p.status} label={p.status_display} /> },
    { key: "f", header: "Fare", align: "right", hideOnMobile: true, render: p => <span className="tabular">{money(p.total_fare)}</span> },
  ];
  return (
    <Container>
      <PageHeader title="Airport pickups" description="A driver waiting when you land, straight to your hotel." actions={<Button icon={Plus} href="/pickups/new">Book a pickup</Button>} />
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile label="Rides" icon={Car} value={s?.total_requests ?? "—"} loading={summary.loading} />
        <StatTile label="Upcoming" icon={Calendar} tone="info" value={summary.data?.upcoming_pickups.length ?? "—"} loading={summary.loading} />
        <StatTile label="Spent" icon={Coin} tone="success" value={s ? money(s.total_spent, "NGN", { decimals: false }) : "—"} loading={summary.loading} />
      </div>
      <Panel padded={false}>
        <DataTable columns={cols} rows={list.data?.results} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={p => p.id}
          onRowClick={p => router.push(`/pickups/${p.confirmation_code}`)}
          empty={{ icon: Car, title: "No pickups yet", description: "Book one from a confirmed stay, or right here.", action: <Button href="/pickups/new">Book a pickup</Button> }} />
      </Panel>
    </Container>
  );
}
