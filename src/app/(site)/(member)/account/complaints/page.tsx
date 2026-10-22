"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { complaintsApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import { ComplaintSheet } from "@/components/bookings/StaySheets";
import { Container } from "@/components/shell/SiteShell";
import { Button, Cell, DataTable, PageHeader, Panel, StatTile, StatusPill, type Column } from "@/components/ui";
import { CheckCircle, Clock, Plus, Warning } from "@/components/icons";
import { formatDate } from "@/utils/format";
import type { Complaint } from "@/types/api";

/** Problems I've reported (guide 10.4). */
export default function ComplaintsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const list = useQuery(() => complaintsApi.list(), []);
  const stats = useQuery(() => complaintsApi.stats(), []);
  const cols: Column<Complaint>[] = [
    { key: "s", header: "Problem", render: c => <Cell primary={c.subject} secondary={`${c.complaint_type_display} · ${c.complaint_id}`} /> },
    { key: "d", header: "Reported", hideOnMobile: true, render: c => formatDate(c.created_at) },
    { key: "p", header: "Priority", hideOnMobile: true, render: c => c.priority_display },
    { key: "st", header: "Status", render: c => <StatusPill status={c.status} label={c.status_display} /> },
  ];
  return (
    <Container>
      <PageHeader crumbs={[{ label: "Account", href: "/account" }, { label: "Complaints" }]} title="Complaints" description="Tell us when something goes wrong; we follow it up with the hotel."
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Report a problem</Button>} />
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile label="Open" icon={Warning} tone="warning" value={stats.data ? stats.data.open + stats.data.in_progress : "—"} loading={stats.loading} />
        <StatTile label="Resolved" icon={CheckCircle} tone="success" value={stats.data?.resolved ?? "—"} loading={stats.loading} />
        <StatTile label="Closed" icon={Clock} tone="neutral" value={stats.data?.closed ?? "—"} loading={stats.loading} />
      </div>
      <Panel padded={false}>
        <DataTable columns={cols} rows={list.data?.results} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={c => c.id}
          onRowClick={c => router.push(`/account/complaints/${c.complaint_id}`)}
          empty={{ icon: Warning, title: "No complaints", description: "We hope it stays that way." }} />
      </Panel>
      <ComplaintSheet open={open} onClose={() => setOpen(false)} onDone={id => router.push(`/account/complaints/${id}`)} />
    </Container>
  );
}
