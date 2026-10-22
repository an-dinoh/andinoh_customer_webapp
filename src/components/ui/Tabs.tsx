"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface TabItem<V extends string = string> {
  value: V;
  label: React.ReactNode;
  count?: number;
  href?: string;
  hidden?: boolean;
}

/** Underlined tabs (Velarius-like). Controlled with value/onChange, or as links with href. */
export function Tabs<V extends string>({ items, value, onChange, className = "" }: {
  items: TabItem<V>[];
  value?: V;
  onChange?: (value: V) => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <div className={`-mx-1 overflow-x-auto scrollbar-hide ${className}`}>
      <div role="tablist" className="flex min-w-max gap-1 border-b border-line px-1">
        {items.filter(t => !t.hidden).map(t => {
          const active = t.href ? pathname === t.href || (t.href !== "/" && pathname.startsWith(`${t.href}/`)) : t.value === value;
          const cls = `relative -mb-px inline-flex items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors ${active ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink"}`;
          const content = (
            <>
              {t.label}
              {t.count !== undefined && (
                <span className={`rounded-full px-1.5 text-[11px] tabular ${active ? "bg-primary-50 text-primary" : "bg-surface-2 text-muted"}`}>{t.count}</span>
              )}
            </>
          );
          return t.href ? (
            <Link key={t.value} href={t.href} role="tab" aria-selected={active} className={cls}>{content}</Link>
          ) : (
            <button key={t.value} type="button" role="tab" aria-selected={active} className={cls} onClick={() => onChange?.(t.value)}>{content}</button>
          );
        })}
      </div>
    </div>
  );
}
