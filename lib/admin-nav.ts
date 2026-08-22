export type AdminSection = "leasing" | "property-management";

export interface AdminDestination {
  href: string;
  name: string;
  icon: string;
}

export const LEASING_DESTINATIONS: AdminDestination[] = [
  { href: "/admin/discovery", name: "Discovery Calls", icon: "call" },
  { href: "/admin/onboard", name: "Add a Landlord", icon: "add_business" },
  { href: "/admin/leasing", name: "Rentals", icon: "home_work" },
  { href: "/admin/properties", name: "Properties", icon: "villa" },
  { href: "/admin/applications", name: "Applications", icon: "assignment" },
  { href: "/admin/agents", name: "Agents", icon: "support_agent" },
  { href: "/admin/invite", name: "Invite an Agent", icon: "person_add" },
  { href: "/admin/leads", name: "Leads", icon: "person_search" },
  { href: "/admin/dashboard", name: "Outreach", icon: "campaign" },
  { href: "/admin/intelligence", name: "Rent Prices", icon: "payments" },
  { href: "/admin/seo", name: "Search Rankings", icon: "query_stats" },
  { href: "/admin/qr-codes", name: "QR Codes", icon: "qr_code" },
];

export const PROPERTY_MGMT_DESTINATIONS: AdminDestination[] = [
  { href: "/admin/tenants", name: "Tenants", icon: "key" },
  { href: "/admin/maintenance", name: "Maintenance", icon: "handyman" },
  { href: "/admin/messages", name: "Messages", icon: "forum" },
  { href: "/admin/documents", name: "Documents", icon: "folder" },
  { href: "/admin/schedules", name: "Reminders", icon: "event" },
  { href: "/admin/ceo", name: "Business Numbers", icon: "monitoring" },
];

export const SECTION_META: Record<AdminSection, { label: string; href: string; icon: string; description: string }> = {
  leasing: {
    label: "Leasing",
    href: "/admin/hub/leasing",
    icon: "home_work",
    description: "Fill vacancies — leads, showings, applications, and new landlords",
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
  ];
  const match = all
    .filter((d) => pathname === d.href || pathname.startsWith(d.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.section ?? null;
}
