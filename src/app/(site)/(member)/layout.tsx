import { Suspense } from "react";
import RequireAccount from "@/components/RequireAccount";
import { Spinnerish } from "@/components/ui";

/** Pages that need an account (the proxy redirects first; this covers a session ending mid-visit). */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinnerish />}><RequireAccount>{children}</RequireAccount></Suspense>;
}
