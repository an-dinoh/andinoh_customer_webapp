"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLive } from "@/contexts/LiveContext";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/Logo";
import Footer from "./Footer";
import { Avatar, Button } from "@/components/ui";
import {
  Bell, Calendar, ChevronDown, Gift, Home, Hotel, Logout, Messages, MessageQuestion, Moon, Profile, Receipt,
  Search, SearchStatus, Setting, Star, Sun, Warning, type Icon,
} from "@/components/icons";

/**
 * The customer app's frame: a top bar with stays, finding a booking and help, trips,
 * inbox and the account menu; on phones a bottom tab bar instead. Content scrolls with the page, like a
 * site, rather than inside a back-office pane.
 */

const SECTIONS: { href: string; label: string; icon: Icon; match: (p: string) => boolean; guestOnly?: boolean }[] = [
  { href: "/", label: "Stays", icon: Hotel, match: p => p === "/" || p.startsWith("/hotels") || p.startsWith("/checkout") },
  // Signed in, bookings are in Trips (on the right of the bar).
  { href: "/bookings/find", label: "Find a booking", icon: SearchStatus, match: p => p.startsWith("/bookings"), guestOnly: true },
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

// No display class here: each use says flex or hidden sm:flex (two display classes in one list clash).
const roundBtn = "relative h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-2";

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
        <Link href="/" aria-label="Andinoh home" className="-my-2 shrink-0 py-2"><Logo priority /></Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {SECTIONS.filter(s => !(s.guestOnly && isAuthenticated)).map(s => {
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
              <Link href="/inbox" aria-label={`Messages${unreadChats ? `, ${unreadChats} unread` : ""}`} className={`${roundBtn} flex`}>
                <Messages className="h-5 w-5" /><Badge n={unreadChats} />
              </Link>
              <Link href="/notifications" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`} className={`${roundBtn} flex`}>
                <Bell className="h-5 w-5" /><Badge n={unreadNotifications} />
              </Link>
              <div className="hidden lg:block"><AccountMenu /></div>
            </>
          ) : (
            <>
              <button type="button" onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className={`${roundBtn} hidden sm:flex`}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {/* Hidden by a wrapper: Button's own inline-flex would beat a "hidden" class on it. */}
              <span className="hidden items-center gap-1.5 sm:flex">
                <Button variant="ghost" href={`/login?from=${from}`}>Sign in</Button>
                <Button href={`/register?from=${from}`}>Create account</Button>
              </span>
              <span className="sm:hidden"><Button href={`/login?from=${from}`} size="sm">Sign in</Button></span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function TabBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  // The mobile app's four tabs (andinoh_mobile main_screen.dart). Signed out, Bookings shows guest
  // bookings and Profile asks to sign in, as there.
  const tabs: { href: string; label: string; icon: Icon; match: (p: string) => boolean }[] = [
    { href: "/", label: "Home", icon: Home, match: p => p === "/" },
    { href: "/hotels", label: "Search", icon: Search, match: p => p.startsWith("/hotels") || p.startsWith("/checkout") },
    { href: isAuthenticated ? "/trips" : "/bookings/find", label: "Bookings", icon: Calendar, match: p => p.startsWith("/trips") || p.startsWith("/bookings") || p.startsWith("/inbox") },
    { href: isAuthenticated ? "/account" : `/login?from=${encodeURIComponent(pathname)}`, label: "Profile", icon: Profile, match: p => p.startsWith("/account") || p.startsWith("/login") || p.startsWith("/register") },
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
              </span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Pages laid out as a fixed-height workspace on desktop (each column scrolls on its own); no footer. */
const FOCUSED = ["/checkout"];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const focused = FOCUSED.some(p => pathname.startsWith(p));
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <TopBar />
      {focused ? (
        <main className="pb-tabbar flex-1 lg:h-[calc(100dvh-4rem)] lg:flex-none lg:overflow-hidden lg:pb-0">{children}</main>
      ) : (
        <>
          <main className="flex-1 pb-12">{children}</main>
          {/* Room for the phone tab bar under the footer. */}
          <div className="bg-[#071F33] pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0"><Footer /></div>
        </>
      )}
      <TabBar />
    </div>
  );
}

/** Centred page content with the standard gutters. */
export function Container({ children, className = "", narrow = false }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return <div className={`mx-auto w-full ${narrow ? "max-w-3xl" : "max-w-[1240px]"} px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 ${className}`}>{children}</div>;
}
