import Link from "next/link";
import { ChevronRight, type Icon } from "@/components/icons";

/** Page title row: breadcrumb, title, one-line description and the page's actions on the right. */
export function PageHeader({ title, description, crumbs, actions, meta }: {
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {c.href ? <Link href={c.href} className="-mx-1 -my-1.5 inline-block min-w-8 px-1 py-1.5 text-center hover:text-primary">{c.label}</Link> : <span className="text-ink-2">{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}

/** A white panel. With a title it gets a header row (title, description, actions). */
export function Panel({ title, description, actions, icon: IconCmp, children, className = "", padded = true, footer }: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: Icon;
  children?: React.ReactNode;
  className?: string;
  padded?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-surface ${className}`}>
      {(title || actions) && (
        <header className={`flex justify-between gap-3 border-b border-line px-5 py-4 ${description ? "items-start" : "items-center"}`}>
          <div className={`flex min-w-0 gap-3 ${description ? "items-start" : "items-center"}`}>
            {IconCmp && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <IconCmp className="w-[18px] h-[18px]" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
              {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
      {footer && <footer className="border-t border-line px-5 py-3">{footer}</footer>}
    </section>
  );
}

/** Label / value pairs in a two-column definition list. */
export function DetailList({ items, cols = 2 }: { items: { label: React.ReactNode; value: React.ReactNode; hidden?: boolean }[]; cols?: 1 | 2 | 3 }) {
  const c = cols === 1 ? "" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${c}`}>
      {items.filter(i => !i.hidden).map((item, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-xs text-muted">{item.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-ink">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A settings-style row: icon tile, title, description and an action or chevron (FIIXCONN-like). */
export function ActionRow({ icon: IconCmp, title, description, href, onClick, right, tone = "neutral" }: {
  icon?: Icon;
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  right?: React.ReactNode;
  tone?: "neutral" | "primary" | "danger" | "success";
}) {
  const tones = {
    neutral: "bg-surface-2 text-ink-2",
    primary: "bg-primary-50 text-primary",
    danger: "bg-danger-50 text-danger",
    success: "bg-success-50 text-success",
  };
  const inner = (
    <>
      {IconCmp && (
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <IconCmp className="w-5 h-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${tone === "danger" ? "text-danger" : "text-ink"}`}>{title}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      {right ?? ((href || onClick) && <ChevronRight className="w-4 h-4 text-subtle" />)}
    </>
  );
  const cls = "flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors hover:bg-surface-2";
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls.replace("hover:bg-surface-2", "")}>{inner}</div>;
}

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-line ${className}`} />;
}
