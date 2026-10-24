import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ONLY, GUEST_ONLY, matches, needsAccount } from "@/config/routes";

/**
 * Sends signed-out visitors to /login from pages that need an account, and signed-in ones away from the
 * sign-in pages. Browsing, guest checkout and guest booking links stay open (Customer guide 3). The
 * cookie only says a session exists (tokens live in the browser); the API still checks every request.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("auth_token")?.value);

  if (needsAccount(pathname) && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname + search);
    return NextResponse.redirect(login);
  }

  if (matches(pathname, GUEST_ONLY) && hasSession) {
    return NextResponse.redirect(new URL("/trips", request.url));
  }

  if (matches(pathname, AUTH_ONLY) && hasSession && !request.nextUrl.searchParams.has("expired")) {
    const from = request.nextUrl.searchParams.get("from");
    return NextResponse.redirect(new URL(from && from.startsWith("/") && !from.startsWith("//") ? from : "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logos|icons|font|sw.js|workbox|manifest.json|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|js)$).*)"],
};