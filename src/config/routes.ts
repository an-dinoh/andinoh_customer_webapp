/**
 * Which pages need an account (Customer guide 3: browsing, quotes and hotel booking work signed out).
 * Used by the proxy (redirects before the page loads) and by the API client (where to go when a session
 * can't be refreshed).
 */

/** Pages that need a signed-in customer. Everything else is open. */
export const SIGNED_IN_ONLY = [
  "/trips",
  "/inbox",
  "/notifications",
  "/account",
  "/pickups",
];

/** Sign-in pages a signed-in customer doesn't need. */
export const AUTH_ONLY = ["/login", "/register", "/forgot-password"];

export const matches = (pathname: string, routes: string[]) =>
  routes.some(r => pathname === r || pathname.startsWith(`${r}/`));

export const needsAccount = (pathname: string) => matches(pathname, SIGNED_IN_ONLY);
