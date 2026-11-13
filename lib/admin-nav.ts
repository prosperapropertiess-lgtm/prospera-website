export type AdminSection = "leasing" | "property-management" | "operations";

export interface AdminDestination {
  href: string;
  name: string;
  icon: string;
}

export const LEASING_DESTINATIONS: AdminDestination[] = [
  { href: "/admin/properties", name: "Properties", icon: "villa" },
  { href: "/admin/viewing-requests", name: "Viewing Requests", icon: "event_available" },
  { href: "/admin/fieldops", name: "Showings (FieldOps)", icon: "calendar_month" },
  { href: "/admin/applications", name: "Applications", icon: "assignment" },
  { href: "/admin/onboard", name: "Add a Landlord", icon: "add_business" },
];

export const OPERATIONS_DESTINATIONS: AdminDestination[] = [
  { href: "/admin/placements", name: "Client Dashboards", icon: "dashboard" },
  { href: "/admin/move-in-coordinator", name: "Move-In Coordinator", icon: "inventory_2" },
  { href: "/admin/leads", name: "Leads", icon: "person_search" },
  { href: "/admin/market", name: "Rental Market", icon: "query_stats" },
  { href: "/admin/scorecard", name: "Sales Scorecard", icon: "scoreboard" },
  { href: "/admin/qr-codes", name: "QR Codes", icon: "qr_code" },
];

export const PROPERTY_MGMT_DESTINATIONS: AdminDestination[] = [
  { href: "/admin/tenants", name: "Tenants", icon: "key" },
  { href: "/admin/statements", name: "Owner Statements", icon: "receipt_long" },
  { href: "/admin/maintenance", name: "Maintenance", icon: "handyman" },
  { href: "/admin/messages", name: "Messages", icon: "forum" },
  { href: "/admin/documents", name: "Documents", icon: "folder" },
  { href: "/admin/schedules", name: "Reminders", icon: "event" },
  { href: "/admin/ceo", name: "Business Numbers", icon: "monitoring" },
  { href: "/admin/ops", name: "Automations", icon: "bolt" },
];

export const SECTION_META: Record<AdminSection, { label: string; href: string; icon: string; description: string }> = {
  leasing: {
    label: "Leasing",
    href: "/admin/hub/leasing",
    icon: "home_work",
    description: "Listings, viewings, showings, applications and new landlords",
  },
  operations: {
    label: "Operations",
    href: "/admin/hub/operations",
    icon: "hub",
    description: "Client dashboards, move-ins, leads, market and sales",
  },
  "property-management": {
    label: "Property Management",
    href: "/admin/hub/property-management",
    icon: "apartment",
    description: "Tenants, maintenance, and the money",
  },
};

// Which section a given admin path belongs to, for the top bar's back-link. Longest-prefix match.
export function sectionForPath(pathname: string): AdminSection | null {
  const all = [
    ...LEASING_DESTINATIONS.map((d) => ({ ...d, section: "leasing" as AdminSection })),
    ...PROPERTY_MGMT_DESTINATIONS.map((d) => ({ ...d, section: "property-management" as AdminSection })),
    ...OPERATIONS_DESTINATIONS.map((d) => ({ ...d, section: "operations" as AdminSection })),
  ];
  const match = all
    .filter((d) => pathname === d.href || pathname.startsWith(d.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.section ?? null;
}
