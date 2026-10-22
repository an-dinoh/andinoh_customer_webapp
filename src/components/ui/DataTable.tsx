"use client";

import { ChevronLeft, ChevronRight, type Icon } from "@/components/icons";
import { EmptyState, ErrorState, Skeleton } from "./Display";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  /** Hidden below the md breakpoint. */
  hideOnMobile?: boolean;
  className?: string;
}

/**
 * The app's table: quiet uppercase header, roomy rows, skeleton while loading, an empty state,
 * the server's error with retry, and optional row click.
 */
export function DataTable<T>({ columns, rows, rowKey, loading, error, onRetry, onRowClick, empty, footer, dense = false }: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  empty?: { icon?: Icon; title: string; description?: string; action?: React.ReactNode };
  footer?: React.ReactNode;
  dense?: boolean;
}) {
  const align = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");
  const hide = (c: Column<T>) => (c.hideOnMobile ? "hidden md:table-cell" : "");

  if (error && !rows?.length) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2">
              {columns.map(c => (
                <th key={c.key} scope="col" style={{ width: c.width }}
                  className={`whitespace-nowrap px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-muted ${align(c.align)} ${hide(c)}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && !rows?.length
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {columns.map(c => (
                    <td key={c.key} className={`px-4 ${dense ? "py-2.5" : "py-4"} ${hide(c)}`}><Skeleton className="h-4 w-3/4" /></td>
                  ))}
                </tr>
              ))
              : rows?.map(row => (
                <tr key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(row); } : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={`border-b border-line last:border-0 ${onRowClick ? "cursor-pointer hover:bg-surface-2 focus:bg-surface-2 focus:outline-none" : ""}`}>
                  {columns.map(c => (
                    <td key={c.key} className={`px-4 ${dense ? "py-2.5" : "py-3.5"} align-middle text-ink-2 ${align(c.align)} ${hide(c)} ${c.className ?? ""}`}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && rows && rows.length === 0 && empty && (
        <EmptyState icon={empty.icon} title={empty.title} description={empty.description} action={empty.action} compact />
      )}
      {footer}
    </div>
  );
}

/** "Showing 21–40 of 132" with numbered pages; works with the API's page / page_size. */
export function Pagination({ page, pageSize, count, onPage }: { page: number; pageSize: number; count: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (count <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(count, page * pageSize);
  const nums: (number | "…")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const btn = "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium";
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted">Showing <span className="font-medium text-ink-2 tabular">{from}–{to}</span> of <span className="font-medium text-ink-2 tabular">{count.toLocaleString()}</span></p>
      <div className="flex items-center gap-1">
        <button type="button" className={`${btn} text-muted hover:bg-surface-2 disabled:opacity-40`} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {nums.map((n, i) => n === "…" ? (
          <span key={`e${i}`} className="px-1 text-xs text-subtle">…</span>
        ) : (
          <button key={n} type="button" onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined}
            className={`${btn} ${n === page ? "bg-primary-50 text-primary" : "text-ink-2 hover:bg-surface-2"}`}>{n}</button>
        ))}
        <button type="button" className={`${btn} text-muted hover:bg-surface-2 disabled:opacity-40`} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** Two-line cell: a strong first line and a muted second. */
export function Cell({ primary, secondary, mono }: { primary: React.ReactNode; secondary?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={`truncate font-medium text-ink ${mono ? "font-mono text-[13px]" : ""}`}>{primary}</div>
      {secondary && <div className="truncate text-xs text-muted">{secondary}</div>}
    </div>
  );
}
