import Image from "next/image";
import Link from "next/link";
import { Gift, Messages, Verify } from "@/components/icons";
import Logo from "@/components/Logo";

const POINTS = [
  { icon: Verify, title: "Hotels you can trust", text: "Every hotel is checked by Andinoh, and inspected in person." },
  { icon: Gift, title: "Points on every stay", text: "Earn a point for every naira and spend them on your next trip." },
  { icon: Messages, title: "The front desk in your pocket", text: "Chat with the hotel, tip staff and get receipts in one place." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full bg-background">
      <aside className="relative hidden w-[46%] max-w-[640px] overflow-hidden lg:block">
        <Image src="/hero.jpg" alt="" fill priority className="object-cover" sizes="46vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A3F66]/85 via-[#0A3F66]/80 to-[#071F33]/95" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link href="/" className="self-start rounded-xl bg-white px-3.5 py-2.5">
            <Image src="/logos/ANDINOH.svg" alt="Andinoh" width={110} height={19} className="h-[19px] w-auto" />
          </Link>
          <div>
            <h2 className="max-w-md text-[32px] font-semibold leading-tight">Every trip, from booking to check-out, in one place.</h2>
            <ul className="mt-8 space-y-5">
              {POINTS.map(p => (
                <li key={p.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20"><p.icon className="h-5 w-5 text-secondary" /></span>
                  <span><span className="block font-medium">{p.title}</span><span className="block text-sm text-white/70">{p.text}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Andinoh. All rights reserved.</p>
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <Link href="/" aria-label="Andinoh home" className="mb-6 inline-block py-2 lg:hidden"><Logo width={120} height={20} className="h-5 w-auto" /></Link>
          {children}
        </div>
      </main>
    </div>
  );
}
