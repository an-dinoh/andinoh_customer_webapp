"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinnerish } from "@/components/ui";

/**
 * Renders its children only for a signed-in customer. The proxy already redirects on first load; this
 * covers a session that ends while the page is open.
 */
export default function RequireAccount({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const q = params.toString();
      router.replace(`/login?from=${encodeURIComponent(pathname + (q ? `?${q}` : ""))}`);
    }
  }, [isLoading, isAuthenticated, router, pathname, params]);
  if (isLoading || !isAuthenticated) return <Spinnerish />;
  return <>{children}</>;
}

/** Safe "go back to where you were" target from ?from= (same-site paths only). */
export function safeFrom(from: string | null | undefined, fallback = "/"): string {
  return from && from.startsWith("/") && !from.startsWith("//") ? from : fallback;
}
