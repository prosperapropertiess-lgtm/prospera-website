/**
 * Single source of truth for "is this blog post written for landlords or
 * tenants?" — used to gate the Almost Passive newsletter CTA (landlord-only)
 * and the tenant lead-capture CTA.
 *
 * Category alone isn't reliable: "Ontario Law" (40 posts) mixes landlord
 * guides ("N4 Notice Ontario: How to Properly Serve...") with tenant-facing
 * content ("Can a Landlord Evict a Tenant in Ontario in 2026?" was written
 * to target tenant search intent). Slugs below are the known exceptions —
 * add to this list when a new tenant-facing post ships under a landlord-ish
 * category.
 */

const TENANT_FACING_CATEGORIES = new Set(["Renter Guides", "Tenant Tips", "Renter Resources"]);

const TENANT_FACING_SLUGS = new Set([
  "can-landlord-evict-tenant-ontario-2026", // tenant search-intent piece, despite the "Ontario Law" tag
  "moving-to-london-ontario-newcomer-rental-guide", // renter's guide to moving to the area
  "best-neighbourhoods-london-ontario-renters", // "Neighbourhood Guides", written for renters
]);

export function isLandlordPost(category: string | undefined, slug: string): boolean {
  if (TENANT_FACING_SLUGS.has(slug)) return false;
  if (category && TENANT_FACING_CATEGORIES.has(category)) return false;
  return true;
}
