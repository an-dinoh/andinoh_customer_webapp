import { AlertTriangle, Refresh, TrendDown, TrendUp, Lock, type Icon } from "@/components/icons";
import { apiAsset, initials } from "@/utils/format";
import Button from "./Button";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "violet" | "gold";

const TILE: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  primary: "bg-primary-50 text-primary",
  success: "bg-success-50 text-success",
  warning: "bg-warning-50 text-warning",
  danger: "bg-danger-50 text-danger",
  info: "bg-info-50 text-info",
  violet: "bg-violet-50 text-violet",
  gold: "bg-secondary-50 text-gold-text",
};

/** A metric: tinted icon tile, label, value and an optional note or trend (Velarius-like). */
export function StatTile({ label, value, icon: IconCmp, tone = "primary", note, trend, onClick, loading }: {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: Icon;
  tone?: Tone;
  note?: React.ReactNode;
  trend?: number | null;
  onClick?: () => void;
  loading?: boolean;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper onClick={onClick} className={`flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4 text-left ${onClick ? "transition-colors hover:border-primary/30" : ""}`}>
      <div className="flex items-center gap-3">
        {IconCmp && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TILE[tone]}`}>
            <IconCmp className="w-[18px] h-[18px]" />
          </span>
        )}
        <span className="line-clamp-2 text-[13px] leading-snug text-muted">{label}</span>
      </div>
      {loading ? <Skeleton className="h-7 w-28" /> : <div className="tabular truncate text-[22px] font-semibold tracking-tight text-ink">{value}</div>}
      {(note || (trend !== undefined && trend !== null)) && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          {trend !== undefined && trend !== null && (
            <span className={`inline-flex items-center gap-0.5 font-medium ${trend >= 0 ? "text-success" : "text-danger"}`}>
              {trend >= 0 ? <TrendUp className="w-3.5 h-3.5" /> : <TrendDown className="w-3.5 h-3.5" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {note}
        </div>
      )}
    </Wrapper>
  );
}

const PILL: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2 ring-line",
  primary: "bg-primary-50 text-primary ring-primary-100",
  success: "bg-success-50 text-success ring-success-ring",
  warning: "bg-warning-50 text-warning ring-warning-ring",
  danger: "bg-danger-50 text-danger ring-danger-ring",
  info: "bg-info-50 text-info ring-info-ring",
  violet: "bg-violet-50 text-violet ring-violet-ring",
  gold: "bg-secondary-50 text-gold-text ring-gold-ring",
};
const DOT: Record<Tone, string> = {
  neutral: "bg-subtle", primary: "bg-primary", success: "bg-success", warning: "bg-warning-dot",
  danger: "bg-danger", info: "bg-info", violet: "bg-violet", gold: "bg-secondary",
};

export function Pill({ tone = "neutral", children, dot = true, className = "" }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PILL[tone]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />}
      {children}
    </span>
  );
}

/** Status → tone for every status the API sends. Unknown values fall back to neutral. */
const STATUS_TONES: Record<string, Tone> = {
  // bookings
  pending: "warning", hold: "warning", confirmed: "primary", checked_in: "success", checked_out: "neutral",
  cancelled: "danger", no_show: "danger",
  paid: "success", partial: "warning",
  // units
  available: "success", occupied: "primary", maintenance: "warning",
  clean: "success", dirty: "warning", cleaning: "info", out_of_order: "danger",
  // staff
  active: "success", registered: "info", suspended: "warning", terminated: "danger",
  // wallet / payouts
  pending_review: "warning", processing: "info", paid_out: "success", rejected: "danger", completed: "success", failed: "danger",
  // accounting
  recorded: "success", void: "neutral", open: "warning", part_paid: "info",
  // attendance
  on_duty: "success", missed_clock_out: "danger", scheduled: "primary", upcoming: "neutral", not_clocked_in: "warning",
  attended: "success", absent: "danger",
  // events
  draft: "neutral",
  // discounts / ads
  running: "success", expired: "neutral", ended: "neutral", live: "success", approved: "success",
  pending_payment: "warning", taken_down: "danger", unpaid: "warning", refunded: "neutral", partially_refunded: "info",
  refund_pending: "warning", refund_failed: "danger",
  // chat / tickets / complaints
  closed: "neutral", archived: "neutral", in_progress: "info", resolved: "success", escalated: "danger", pending_customer: "warning",
  // pickups (statuses can still arrive in notifications)
  driver_assigned: "info", en_route: "info", arrived: "primary", picked_up: "info",
  // flights, referrals
  cancellation_requested: "violet", withdrawn: "neutral",
  // inspections / KYC
  passed: "success", verified: "success", overdue: "danger", submitted: "info", appeal_pending: "violet",
};

export function StatusPill({ status, label }: { status: string | null | undefined; label?: string }) {
  if (!status) return <Pill tone="neutral">—</Pill>;
  const text = label ?? status.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase());
  return <Pill tone={STATUS_TONES[status.toLowerCase()] ?? "neutral"}>{label ? text : text.charAt(0) + text.slice(1).toLowerCase()}</Pill>;
}

export function Avatar({ name, src, size = "md" }: { name?: string | null; src?: string | null; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "h-7 w-7 text-[11px]" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={apiAsset(src)} alt={name ?? ""} className={`${s} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span aria-hidden className={`${s} inline-flex shrink-0 items-center justify-center rounded-full bg-primary-50 font-semibold text-primary`}>
      {initials(name)}
    </span>
  );
}

/** Nothing here yet: a grey icon tile, a title, a line of help and an optional action. */
export function EmptyState({ icon: IconCmp, title, description, action, compact = false }: {
  icon?: Icon; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-14"} px-6`}>
      {IconCmp && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-subtle ring-1 ring-line">
          <IconCmp className="w-7 h-7" />
        </span>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** A failed load, with the server's message and a retry. */
export function ErrorState({ error, onRetry, compact }: { error: Error | null; onRetry?: () => void; compact?: boolean }) {
  const requestId = (error as { requestId?: string } | null)?.requestId;
  const status = (error as { status?: number } | null)?.status;
  if (status === 403) return <NoAccess />;
  return (
    <EmptyState
      compact={compact}
      icon={AlertTriangle}
      title="We couldn’t load this"
      description={<>{error?.message ?? "Something went wrong."}{requestId && <span className="mt-1 block text-xs text-subtle">Reference {requestId}</span>}</>}
      action={onRetry && <Button variant="outline" icon={Refresh} onClick={onRetry}>Try again</Button>}
    />
  );
}

export function NoAccess({ what = "this" }: { what?: string }) {
  return (
    <EmptyState
      icon={Lock}
      title="You can’t open this"
      description={`It looks like ${what} belongs to another account. Check you’re signed in with the right one.`}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block rounded-md animate-shimmer ${className}`} />;
}

export function Spinnerish({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      {label}
    </div>
  );
}

/** A coloured callout for notices (pending approval, closed period, negative balance…). */
export function Callout({ tone = "info", title, children, icon: IconCmp, action }: {
  tone?: "info" | "warning" | "danger" | "success" | "gold"; title?: React.ReactNode; children?: React.ReactNode; icon?: Icon; action?: React.ReactNode;
}) {
  const styles = {
    info: "bg-info-50 border-info-ring text-info-fg",
    warning: "bg-warning-50 border-warning-ring text-warning-fg",
    danger: "bg-danger-50 border-danger-ring text-danger-fg",
    success: "bg-success-50 border-success-ring text-success-fg",
    gold: "bg-secondary-50 border-gold-ring text-gold-fg",
  };
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center ${styles[tone]}`} role={tone === "danger" ? "alert" : "status"}>
      <div className="flex flex-1 items-start gap-3">
        {IconCmp && <IconCmp className="mt-0.5 w-5 h-5 shrink-0" />}
        <div className="text-sm">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
