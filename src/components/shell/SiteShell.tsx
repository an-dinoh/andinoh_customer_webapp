"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLive } from "@/contexts/LiveContext";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/Logo";
import { Avatar, Button } from "@/components/ui";
import {
  Bell, Calendar, Car, ChevronDown, Discover, Gift, Hotel, Logout, Messages, MessageQuestion, Moon, Profile, Receipt,
  Setting, Star, Sun, Warning, type Icon,
} from "@/components/icons";

/**
 * The customer app's frame: a top bar with stays, pickups and help, trips,
 * inbox and the account menu; on phones a bottom tab bar instead. Content scrolls with the page, like a
 * site, rather than inside a back-office pane.
 */

const SECTIONS: { href: string; label: string; icon: Icon; match: (p: string) => boolean }[] = [
  { href: "/", label: "Stays", icon: Hotel, match: p => p === "/" || p.startsWith("/hotels") || p.startsWith("/checkout") },
  { href: "/pickups/new", label: "Airport pickups", icon: Car, match: p => p.startsWith("/pickups") },
  { href: "/help", label: "Help", icon: MessageQuestion, match: p => p.startsWith("/help") },
];

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); window.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger-solid px-1 text-[10px] font-semibold text-white ring-2 ring-surface tabular">
      {n > 99 ? "99+" : n}
    </span>
  );
}

const roundBtn = "relative flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-2";

function AccountMenu() {
  const { user, profile, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const name = profile?.full_name || user?.full_name || user?.email;
  const items: { href: string; label: string; icon: Icon }[] = [
    { href: "/account", label: "Profile", icon: Profile },
    { href: "/account/rewards", label: "Points and referrals", icon: Gift },
    { href: "/pickups", label: "Airport pickups", icon: Car },
    { href: "/account/reviews", label: "My reviews", icon: Star },
    { href: "/account/complaints", label: "Complaints", icon: Warning },
    { href: "/account/statement", label: "Statement", icon: Receipt },
    { href: "/account/settings", label: "Settings", icon: Setting },
    { href: "/help", label: "Help", icon: MessageQuestion },
  ];
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 transition-colors hover:bg-surface-2">
        <Avatar name={name} src={profile?.profile_picture_url} size="sm" />
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open && (
        <div role="menu" className="animate-pop absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <Avatar name={name} src={profile?.profile_picture_url} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
              {profile && (
                <p className="truncate text-xs text-muted">
                  {profile.membership_tier_display} · <span className="tabular">{profile.available_points.toLocaleString()}</span> points
                </p>
              )}
            </div>
          </div>
          <div className="p-1.5">
            {items.map(i => (
              <Link key={i.href} href={i.href} role="menuitem" onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-surface-2">
                <i.icon className="h-[18px] w-[18px] text-muted" />{i.label}
              </Link>
            ))}
            <button type="button" role="menuitem" onClick={toggle}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-2 hover:bg-surface-2">
              {theme === "dark" ? <Sun className="h-[18px] w-[18px] text-muted" /> : <Moon className="h-[18px] w-[18px] text-muted" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
          <div className="border-t border-line p-1.5">
            <button type="button" role="menuitem" onClick={async () => { setOpen(false); await logout(); router.push("/"); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-danger-50">
              <Logout className="h-[18px] w-[18px]" />Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { unreadNotifications, unreadChats } = useLive();
  const { theme, toggle } = useTheme();
  const from = encodeURIComponent(pathname);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur no-print">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Andinoh home" className="shrink-0"><Logo priority /></Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {SECTIONS.map(s => {
            const active = s.match(pathname);
            return (
              <Link key={s.href} href={s.href} aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${active ? "bg-primary-50 text-primary" : "text-ink-2 hover:bg-surface-2"}`}>
                <s.icon className="h-[18px] w-[18px]" />{s.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link href="/trips" className={`hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-medium sm:inline-flex ${pathname.startsWith("/trips") ? "bg-primary-50 text-primary" : "text-ink-2 hover:bg-surface-2"}`}>
                <Calendar className="h-[18px] w-[18px]" />Trips
              </Link>
              <Link href="/inbox" aria-label={`Messages${unreadChats ? `, ${unreadChats} unread` : ""}`} className={`${roundBtn} hidden sm:flex`}>
                <Messages className="h-5 w-5" /><Badge n={unreadChats} />
              </Link>
              <Link href="/notifications" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`} className={roundBtn}>
                <Bell className="h-5 w-5" /><Badge n={unreadNotifications} />
              </Link>
              <div className="hidden lg:block"><AccountMenu /></div>
            </>
          ) : (
            <>
              <Link href="/bookings/find" className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-ink-2 hover:bg-surface-2 md:inline-flex">Find a booking</Link>
              <button type="button" onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className={`${roundBtn} hidden sm:flex`}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Button variant="ghost" href={`/login?from=${from}`} className="hidden sm:inline-flex">Sign in</Button>
              <Button href={`/register?from=${from}`}>Create account</Button>
            </>
          )}
        </div>
      </div>
      {/* Phones and tablets: the sections as a scrolling row under the bar. */}
      <nav aria-label="Sections" className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 scrollbar-hide lg:hidden">
        {SECTIONS.map(s => {
          const active = s.match(pathname);
          return (
            <Link key={s.href} href={s.href} aria-current={active ? "page" : undefined}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium ${active ? "border-primary/30 bg-primary-50 text-primary" : "border-line text-ink-2"}`}>
              <s.icon className="h-4 w-4" />{s.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function TabBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { unreadChats } = useLive();
  const tabs: { href: string; label: string; icon: Icon; badge?: number; match: (p: string) => boolean }[] = isAuthenticated
    ? [
      { href: "/", label: "Explore", icon: Discover, match: p => p === "/" || p.startsWith("/hotels") },
      { href: "/trips", label: "Trips", icon: Calendar, match: p => p.startsWith("/trips") || p.startsWith("/bookings") },
      { href: "/inbox", label: "Inbox", icon: Messages, badge: unreadChats, match: p => p.startsWith("/inbox") },
      { href: "/account", label: "Account", icon: Profile, match: p => p.startsWith("/account") || p.startsWith("/pickups") },
    ]
    : [
      { href: "/", label: "Explore", icon: Discover, match: p => p === "/" || p.startsWith("/hotels") },
      { href: "/bookings", label: "Bookings", icon: Calendar, match: p => p.startsWith("/bookings") },
      { href: "/help", label: "Help", icon: MessageQuestion, match: p => p.startsWith("/help") },
      { href: `/login?from=${encodeURIComponent(pathname)}`, label: "Sign in", icon: Profile, match: p => p.startsWith("/login") },
    ];
  return (
    <nav aria-label="Tabs" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden no-print">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {tabs.map(t => {
          const active = t.match(pathname);
          return (
            <Link key={t.label} href={t.href} aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-primary" : "text-muted"}`}>
              <span className="relative">
                <t.icon className="h-[22px] w-[22px]" variant={active ? "bold" : "linear"} />
                {!!t.badge && <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-danger-solid ring-2 ring-surface" />}
              </span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Footer() {
  const cols = [
    { title: "Travel", links: [["Hotels", "/hotels"], ["Airport pickups", "/pickups/new"], ["Find a booking", "/bookings/find"]] },
    { title: "Help", links: [["Help centre", "/help"], ["Contact support", "/help/contact"], ["Refund policy", "/legal/refund-policy"]] },
    { title: "Andinoh", links: [["Terms of service", "/legal/terms-of-service"], ["Privacy policy", "/legal/privacy-policy"], ["Inspect hotels with us", "/account/inspector"]] },
  ];
  return (
    <footer className="mt-16 hidden border-t border-line bg-surface lg:block no-print">
      <div className="mx-auto grid max-w-[1240px] grid-cols-4 gap-8 px-8 py-12">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">Verified hotels across Nigeria, with every stay in one place.</p>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-ink-2 hover:text-primary">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-subtle">© {new Date().getFullYear()} Andinoh. All rights reserved.</p>
    </footer>
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <TopBar />
      <main className="pb-tabbar flex-1">{children}</main>
      <Footer />
      <TabBar />
    </div>
  );
}

/** Centred page content with the standard gutters. */
export function Container({ children, className = "", narrow = false }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return <div className={`mx-auto w-full ${narrow ? "max-w-3xl" : "max-w-[1240px]"} px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 ${className}`}>{children}</div>;
}
