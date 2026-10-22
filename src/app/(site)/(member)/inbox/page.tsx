"use client";

import Link from "next/link";
import { useLive, useLiveReload } from "@/contexts/LiveContext";
import { chatApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import { Container } from "@/components/shell/SiteShell";
import { Avatar, Button, EmptyState, ErrorState, PageHeader, Pill, Skeleton } from "@/components/ui";
import { Messages } from "@/components/icons";
import { timeAgo } from "@/utils/format";
import { MEDIA_LABELS } from "@/utils/chatUpload";

/** Conversations with hotels (guide 10.1): open while you're checked in, closed at check-out. */
export default function InboxPage() {
  const chats = useQuery(() => chatApi.list({ page_size: 50 }), []);
  const { refreshChats } = useLive();
  useLiveReload(["new_chat_message"], () => { void chats.reload(); void refreshChats(); });
  const list = [...(chats.data?.results ?? [])].sort((a, b) => (b.last_message_at ?? b.created_at).localeCompare(a.last_message_at ?? a.created_at));
  return (
    <Container narrow>
      <PageHeader title="Messages" description="Chat with the front desk while you’re staying. Conversations close at check-out." />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {chats.error ? <ErrorState error={chats.error} onRetry={chats.reload} />
          : chats.loading ? <div className="space-y-4 p-5">{[0, 1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            : list.length === 0 ? (
              <EmptyState icon={Messages} title="No conversations yet" description="Once you’ve checked in, message the hotel from your booking."
                action={<Button variant="secondary" href="/trips">My trips</Button>} />
            ) : (
              <ul className="divide-y divide-line">
                {list.map(c => {
                  const last = c.messages?.[c.messages.length - 1];
                  const preview = last ? (last.is_deleted ? "This message was deleted" : last.message || MEDIA_LABELS[last.message_type] || "") : "";
                  return (
                    <li key={c.id}>
                      <Link href={`/inbox/${c.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                        <Avatar name={c.hotel_name} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className={`truncate text-sm ${c.unread_count ? "font-semibold text-ink" : "font-medium text-ink"}`}>{c.hotel_name}</span>
                            <span className="shrink-0 text-xs text-muted">{timeAgo(c.last_message_at ?? c.created_at)}</span>
                          </span>
                          <span className="mt-0.5 flex items-center justify-between gap-2">
                            <span className={`truncate text-sm ${c.unread_count ? "text-ink-2" : "text-muted"}`}>{c.subject ? `${c.subject} · ` : ""}{last?.sender_type === "customer" ? "You: " : ""}{preview}</span>
                            {c.unread_count > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white tabular">{c.unread_count}</span>
                              : c.status !== "active" ? <Pill>Closed</Pill> : null}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
      </div>
    </Container>
  );
}
