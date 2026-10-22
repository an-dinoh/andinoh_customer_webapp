/**
 * Ads and promos carry links written for the phone app ("app://hotels/detail/<id>", "andinoh://…") or
 * the web. This maps them to a page here, or keeps a web address as it is.
 */
export function resolveLink(url: string | null | undefined): { href: string; external: boolean } | null {
  if (!url) return null;
  const app = /^(?:app|andinoh):\/\/(.+)$/i.exec(url.trim());
  if (app) {
    const path = app[1].replace(/^\/+/, '');
    const hotel = /^hotels?\/(?:detail\/)?([0-9a-f-]{36})/i.exec(path);
    if (hotel) return { href: `/hotels/${hotel[1]}`, external: false };
    const booking = /^bookings?\/(?:hotel\/)?([0-9a-f-]{36})/i.exec(path);
    if (booking) return { href: `/trips/${booking[1]}`, external: false };
    return { href: '/', external: false };
  }
  if (url.startsWith('/')) return { href: url, external: false };
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (typeof window !== 'undefined' && u.origin === window.location.origin) return { href: u.pathname + u.search, external: false };
    } catch { /* not a URL */ }
    return { href: url, external: true };
  }
  return null;
}
