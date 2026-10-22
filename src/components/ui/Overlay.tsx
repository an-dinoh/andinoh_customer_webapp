"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, Danger, type Icon } from "@/components/icons";
import Button from "./Button";
import { Input, Textarea } from "./Field";

export function useOverlay(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);
}

const noop = () => () => {};

export function Portal({ children }: { children: React.ReactNode }) {
  // True only in the browser, so the portal never renders during server rendering.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? createPortal(children, document.body) : null;
}

/**
 * Mounts a sheet's body only while it's open, so its form starts from props on every open
 * (no reset effect needed). Use as `export const XSheet = whenOpen(XSheetBody)`.
 */
export function whenOpen<P extends { open: boolean }>(Body: React.ComponentType<P>) {
  function WhenOpen(props: P) {
    return props.open ? <Body {...props} /> : null;
  }
  WhenOpen.displayName = `WhenOpen(${Body.displayName ?? Body.name})`;
  return WhenOpen;
}

/**
 * A panel that slides in from the right: the app's way to create and edit things without leaving
 * the list. Put the form's submit button in `footer` (form="…").
 */
export function Sheet({ open, onClose, title, description, children, footer, width = "md" }: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg" | "xl";
}) {
  useOverlay(open, onClose);
  const titleId = useId();
  if (!open) return null;
  const w = width === "xl" ? "sm:max-w-3xl" : width === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg";
  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-scrim" onClick={onClose} aria-hidden />
        <div role="dialog" aria-modal="true" aria-labelledby={titleId}
          className={`animate-sheet relative flex h-full w-full ${w} flex-col bg-surface shadow-2xl`}>
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-ink">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer>}
        </div>
      </div>
    </Portal>
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useOverlay(open, onClose);
  const titleId = useId();
  if (!open) return null;
  const w = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";
  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div className="absolute inset-0 bg-scrim" onClick={onClose} aria-hidden />
        <div role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}
          className={`animate-pop relative w-full ${w} rounded-2xl bg-surface shadow-2xl`}>
          {title && (
            <header className="flex items-start justify-between gap-4 px-6 pt-5">
              <div>
                <h2 id={titleId} className="text-base font-semibold text-ink">{title}</h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-2" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </header>
          )}
          <div className="px-6 py-5">{children}</div>
          {footer && <footer className="flex items-center justify-end gap-2 rounded-b-2xl border-t border-line bg-surface-2 px-6 py-4">{footer}</footer>}
        </div>
      </div>
    </Portal>
  );
}

/**
 * Asks before doing something that can't be undone. Can collect a reason (voids, refunds) or the
 * account password (bank-account changes); `onConfirm` receives what was typed.
 */
interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: string) => unknown;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  ask?: { kind: "reason" | "password" | "text"; label: string; placeholder?: string; required?: boolean };
  icon?: Icon;
}

export const ConfirmDialog = whenOpen(ConfirmBody);

function ConfirmBody({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", tone = "danger", busy, ask, icon: IconCmp = Danger }: ConfirmProps) {
  const [value, setValue] = useState("");
  const blocked = !!ask?.required && !value.trim();
  return (
    <Modal open={open} onClose={onClose} size="sm"
      footer={<>
        <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} loading={busy} disabled={blocked} onClick={() => onConfirm(value.trim())}>{confirmLabel}</Button>
      </>}>
      <div className="flex flex-col items-start gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-full ${tone === "danger" ? "bg-danger-50 text-danger" : "bg-primary-50 text-primary"}`}>
          <IconCmp className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description && <div className="mt-1 text-sm text-muted">{description}</div>}
        </div>
        {ask && (
          <div className="w-full">
            {ask.kind === "reason" ? (
              <Textarea label={ask.label} placeholder={ask.placeholder} value={value} onChange={e => setValue(e.target.value)} rows={3} required={ask.required} />
            ) : (
              <Input label={ask.label} type={ask.kind === "password" ? "password" : "text"} placeholder={ask.placeholder} value={value}
                onChange={e => setValue(e.target.value)} required={ask.required} autoComplete={ask.kind === "password" ? "current-password" : undefined} />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
