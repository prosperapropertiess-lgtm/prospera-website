// The admin sidebar, grouped by the five parts of the business.

export interface AdminLink {
  href: string;
  name: string;
  icon: string;
}

export interface AdminGroup {
  label: string;
  links: AdminLink[];
}

export const ADMIN_NAV: AdminGroup[] = [
  {
    label: "Vacancies",
    links: [
      { href: "/admin/properties", name: "Listings", icon: "villa" },
      { href: "/admin/applications", name: "Applications", icon: "assignment" },
      { href: "/admin/leads", name: "Leads", icon: "person_search" },
      { href: "/admin/qr-codes", name: "QR codes", icon: "qr_code" },
    ],
  },
  {
    label: "Owners",
    links: [
      { href: "/admin/onboard", name: "Landlords", icon: "add_business" },
      { href: "/admin/messages", name: "Post an update", icon: "forum" },
      { href: "/admin/documents", name: "Share a document", icon: "folder" },
    ],
  },
  {
    label: "Tenants",
    links: [
      { href: "/admin/tenants", name: "Tenant portals", icon: "key" },
    ],
  },
  {
    label: "Maintenance",
    links: [
      { href: "/admin/maintenance", name: "Repairs", icon: "handyman" },
    ],
  },
  {
    label: "Move-in and out",
    links: [
      { href: "/admin/move-in-coordinator", name: "Move-ins", icon: "inventory_2" },
      { href: "/admin/schedules", name: "Reminders", icon: "event" },
    ],
  },
  {
    label: "Money",
    links: [
      { href: "/admin/ceo", name: "Business numbers", icon: "monitoring" },
    ],
  },
  {
    label: "Behind the scenes",
    links: [
      { href: "/admin/ops", name: "Automations", icon: "bolt" },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
