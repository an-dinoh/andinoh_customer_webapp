"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLive, useLiveReload } from "@/contexts/LiveContext";
import { notificationsApi, platformNotificationsApi } from "@/services/api";
import { useMutation, useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Button, EmptyState, ErrorState, PageHeader, Pagination, Skeleton, Tabs } from "@/components/ui";
import { Bell, CheckCircle, Danger, Info, Shield, CheckSquare as TickCircle } from "@/components/icons";
import { timeAgo } from "@/utils/format";
import { notificationHref, notificationText, notificationTone, type NoticeTone } from "@/utils/notify";
import type { CustomerNotification } from "@/types/api";

const TONE: Record<NoticeTone, { icon: typeof Bell; cls: string }> = {
  info: { icon: Info, cls: "bg-info-50 text-info" },
  success: { icon: CheckCircle, cls: "bg-success-50 text-success" },
  warning: { icon: Danger, cls: "bg-warning-50 text-warning" },
  danger: { icon: Danger, cls: "bg-danger-50 text-danger" },
};

/** Booking news, payments, refunds and replies (guide 12.1); tapping one opens what it's about. */
export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshNotifications } = useLive();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  // The feed only sorts (no read filter), so "Unread" filters the page shown.
  const feed = useQuery(() => notificationsApi.list({ ordering: "-created_at", page: page > 1 ? page : undefined }), [page]);
  // Customers who applied to inspect also get platform notices (shared guide 6).
  const platform = useQuery(() => platformNotificationsApi.list(), [], { enabled: !!user?.inspector_status });
  useLiveReload(["in_app_notification"], feed.reload);

  const readAll = useMutation(async () => {
    await notificationsApi.markAllRead();
    if (user?.inspector_status) await platformNotificationsApi.markAllRead().catch(() => undefined);
  }, { success: "All caught up", onSuccess: () => { void feed.reload(); void refreshNotifications(); } });
  const open = async (n: CustomerNotification) => {
    if (!n.is_read) {
      feed.setData(d => (d ? { ...d, results: d.results.map(x => (x.id === n.id ? { ...x, is_read: true } : x)) } : d));
      void notificationsApi.markRead(n.id).then(refreshNotifications).catch(() => undefined);
    }
    const href = notificationHref(n);
    if (href !== "/notifications") router.push(href);
  };
  const items = (feed.data?.results ?? []).filter(n => tab === "all" || !n.is_read);

  return (
    <Container narrow>
      <PageHeader title="Notifications" description="Bookings, payments, refunds and messages from hotels."
        actions={<Button variant="outline" icon={TickCircle} loading={readAll.busy} onClick={() => readAll.run()}>Mark all read</Button>} />
      <Tabs className="mb-4" value={tab} onChange={v => { setTab(v); setPage(1); }} items={[{ value: "all", label: "All" }, { value: "unread", label: "Unread" }]} />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {feed.error ? <ErrorState error={feed.error} onRetry={feed.reload} />
          : feed.loading ? <div className="space-y-4 p-5">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            : items.length === 0 ? <EmptyState icon={Bell} title={tab === "unread" ? "You’re all caught up" : "No notifications yet"} description="Booking confirmations, payments and hotel replies show here." />
              : (
                <ul className="divide-y divide-line">
                  {items.map(n => {
                    const { title, message } = notificationText(n);
                    const t = TONE[notificationTone(n.notification_type)];
                    return (
                      <li key={n.id}>
                        <button type="button" onClick={() => open(n)} className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-surface-2 ${n.is_read ? "" : "bg-primary-50/40"}`}>
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.cls}`}><t.icon className="h-5 w-5" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-3">
                              <span className={`text-sm ${n.is_read ? "font-medium text-ink-2" : "font-semibold text-ink"}`}>{title}</span>
                              <span className="shrink-0 text-xs text-muted">{timeAgo(n.created_at)}</span>
                            </span>
                            {message && <span className="mt-0.5 block text-sm text-muted">{message}</span>}
                          </span>
                          {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
        <Pagination page={page} pageSize={20} count={feed.data?.count ?? 0} onPage={setPage} />
      </div>
      {(platform.data?.results.length ?? 0) > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">From Andinoh</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {platform.data!.results.map(n => (
              <li key={n.id} className="flex gap-3 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet"><Shield className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">{n.title}</span><span className="block text-sm text-muted">{n.message}</span></span>
                <span className="text-xs text-muted">{timeAgo(n.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
