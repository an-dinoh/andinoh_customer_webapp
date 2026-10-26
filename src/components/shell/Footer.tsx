"use client";

import Image from "next/image";
import Link from "next/link";
import { appApi } from "@/services/api";
import { useQuery } from "@/hooks/useApi";
import { Call, Location, Mail } from "@/components/icons";

/**
 * The Andinoh website's footer (andinoh_website app/components/Footer.tsx), so the two read as one
 * product. Its links go to the website's pages; the contact details come from the API's app config.
 */

const WEBSITE = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://andinoh.com").replace(/\/$/, "");

const COLUMNS = [
  {
    title: "Andinoh",
    links: [
      { href: `${WEBSITE}/#why`, label: "Why Andinoh" },
      { href: `${WEBSITE}/#vetting`, label: "How we vet hotels" },
      { href: `${WEBSITE}/about`, label: "About us" },
      { href: `${WEBSITE}/contact`, label: "Contact" },
    ],
  },
  {
    title: "For hotels",
    links: [
      { href: `${WEBSITE}/hotels`, label: "Hotel software" },
      { href: `${WEBSITE}/hotels#verification`, label: "Getting verified" },
      { href: `${WEBSITE}/waitlist?type=hotel`, label: "Become a partner" },
    ],
  },
];

const SOCIALS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/company/109459638/", icon: "/icons/linkedin.svg" },
  { name: "Instagram", href: "https://www.instagram.com/andinoh_/", icon: "/icons/instagram.svg" },
  { name: "TikTok", href: "https://www.tiktok.com/@andinoh0", icon: "/icons/tiktok.svg" },
];

const digits = (phone: string) => phone.replace(/[^\d+]/g, "");

export default function Footer() {
  const config = useQuery(() => appApi.config(), []);
  const c = config.data;
  return (
    <footer className="bg-gradient-to-b from-[#0A3F66] to-[#071F33] text-white no-print">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="flex flex-col gap-4">
            <Image src="/logos/ANDINOH WHITE.svg" alt="Andinoh" width={120} height={40} className="h-8 w-auto self-start" />
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              Trusted hotel stays, and the software hotels run on. Every hotel is checked in person before guests can book it.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold">{col.title}</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                {col.links.map(l => (
                  <li key={l.href}><a href={l.href} className="-my-1 inline-block py-1 transition-colors hover:text-white">{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-semibold">Get in touch</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              {c?.support_email && (
                <li>
                  <a href={`mailto:${c.support_email}`} className="-my-1 inline-flex items-center gap-2 break-all py-1 transition-colors hover:text-white">
                    <Mail className="h-4 w-4 shrink-0" /> {c.support_email}
                  </a>
                </li>
              )}
              {c?.support_whatsapp && (
                <li>
                  <a href={`https://wa.me/${c.support_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="-my-1 inline-flex items-center gap-2 py-1 transition-colors hover:text-white">
                    <Call className="h-4 w-4 shrink-0" /> <span className="tabular">{c.support_whatsapp}</span> (WhatsApp)
                  </a>
                </li>
              )}
              {c?.support_phone && (
                <li>
                  <a href={`tel:${digits(c.support_phone)}`} className="-my-1 inline-flex items-center gap-2 py-1 transition-colors hover:text-white">
                    <Call className="h-4 w-4 shrink-0" /> <span className="tabular">{c.support_phone}</span>
                  </a>
                </li>
              )}
              <li className="inline-flex items-center gap-2">
                <Location className="h-4 w-4 shrink-0" /> Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/60">
            <p>© {new Date().getFullYear()} Andinoh. All rights reserved.</p>
            <Link href="/legal/terms-of-service" className="-my-1.5 py-1.5 hover:text-white">Terms</Link>
            <Link href="/legal/privacy-policy" className="-my-1.5 py-1.5 hover:text-white">Privacy</Link>
            <Link href="/help" className="-my-1.5 py-1.5 hover:text-white">Help centre</Link>
          </div>
          <ul className="flex items-center gap-2">
            {SOCIALS.map(s => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Andinoh on ${s.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                  <Image src={s.icon} alt="" width={16} height={16} className="h-4 w-4 brightness-0 invert" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
