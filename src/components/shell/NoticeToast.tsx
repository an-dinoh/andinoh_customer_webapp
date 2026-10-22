"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { Bell, CheckCircle, Danger, Info, X } from "@/components/icons";
import type { Notice, NoticeTone } from "@/utils/notify";

const ICON: Record<NoticeTone, { icon: typeof Bell; cls: string }> = {
  info: { icon: Info, cls: "bg-info-50 text-info" },
  success: { icon: CheckCircle, cls: "bg-success-50 text-success" },
  warning: { icon: Danger, cls: "bg-warning-50 text-warning" },
  danger: { icon: Danger, cls: "bg-danger-50 text-danger" },
};

/** A live alert: icon, a plain title, one line of detail, and a link to what it's about. */
export function showNotice(notice: Notice, opts: { id?: string; duration?: number } = {}) {
  const { icon: IconCmp, cls } = ICON[notice.tone];
  toast.custom(t => {
    const inner = (
      <>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}><IconCmp className="h-[18px] w-[18px]" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{notice.title}</span>
          {notice.body && <span className="mt-0.5 block text-sm text-muted">{notice.body}</span>}
          {notice.href && <span className="mt-1 block text-xs font-medium text-primary">Open</span>}
        </span>
      </>
    );
    return (
      <div role="status" className={`pointer-events-auto flex w-[360px] max-w-[calc(100vw-32px)] items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-xl ${t.visible ? "animate-pop" : "opacity-0"}`}>
        {notice.href
          ? <Link href={notice.href} onClick={() => toast.dismiss(t.id)} className="flex min-w-0 flex-1 items-start gap-3">{inner}</Link>
          : <div className="flex min-w-0 flex-1 items-start gap-3">{inner}</div>}
        <button type="button" onClick={() => toast.dismiss(t.id)} aria-label="Dismiss" className="rounded-lg p-1 text-subtle hover:bg-surface-2 hover:text-ink"><X className="h-4 w-4" /></button>
      </div>
    );
  }, { id: opts.id, duration: opts.duration ?? 6000 });
}
