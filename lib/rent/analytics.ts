// Minimal gtag event firing, matching the raw-call pattern already used
// elsewhere on the site (e.g. app/lp/property-management/thank-you) rather
// than introducing a new analytics abstraction.
export function trackRentEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", event, params ?? {});
  }
}
