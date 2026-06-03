/**
 * Notion API client for Prospera Properties
 * Pulls owner, property, rent, maintenance, and expense data
 * for the monthly owner report email.
 */

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// Database IDs
export const DB = {
  owners:      "0bcd6043067b4f18b089950994a600fb",
  properties:  "19d44116874346b3981f527950b85817",
  rentTracker: "860016f26d594cb4a0e25823ead03e3d",
  maintenance: "c08108457c77484a9bb2b60c8f85b486",
  expenses:    "eee5c2d657d84a489709d24eaffb0409",
  tenants:     "6b02fb56874b45538925cae39bbcb4e2",
};

function headers() {
  return {
    "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function queryDatabase(databaseId: string, filter?: object): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const body: any = { page_size: 100 };
    if (filter) body.filter = filter;
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Notion query failed (${databaseId}): ${err}`);
    }

    const data = await res.json();
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return results;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function prop(page: any, name: string): any {
  return page.properties?.[name];
}

function text(page: any, name: string): string {
  const p = prop(page, name);
  if (!p) return "";
  if (p.type === "title") return p.title?.[0]?.plain_text ?? "";
  if (p.type === "rich_text") return p.rich_text?.[0]?.plain_text ?? "";
  if (p.type === "email") return p.email ?? "";
  if (p.type === "phone_number") return p.phone_number ?? "";
  if (p.type === "select") return p.select?.name ?? "";
  if (p.type === "status") return p.status?.name ?? "";
  return "";
}

function num(page: any, name: string): number | null {
  return prop(page, name)?.number ?? null;
}

function date(page: any, name: string): string | null {
  return prop(page, name)?.date?.start ?? null;
}

function relations(page: any, name: string): string[] {
  return (prop(page, name)?.relation ?? []).map((r: any) => r.id);
}

function pageId(page: any): string {
  return page.id.replace(/-/g, "");
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyIds: string[];
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: string;
  status: string;
  monthlyRent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
}

export interface RentEntry {
  id: string;
  entry: string;
  propertyId: string;
  tenantId: string | null;
  month: string;
  year: number | null;
  amountDue: number | null;
  amountPaid: number | null;
  datePaid: string | null;
  paymentStatus: string;
}

export interface MaintenanceItem {
  id: string;
  issue: string;
  propertyId: string;
  category: string;
  priority: string;
  status: string;
  reportedBy: string;
  dateReported: string | null;
  dateCompleted: string | null;
  cost: number | null;
  notes: string;
  daysPending: number | null;
}

export interface Expense {
  id: string;
  description: string;
  propertyId: string;
  amount: number | null;
  category: string;
  date: string | null;
}

export interface OwnerReport {
  owner: Owner;
  properties: Array<{
    property: Property;
    rent: RentEntry[];
    maintenance: MaintenanceItem[];
    expenses: Expense[];
  }>;
  month: string;
  year: number;
}

// ── Fetchers ───────────────────────────────────────────────────────────────

export async function fetchOwners(): Promise<Owner[]> {
  const pages = await queryDatabase(DB.owners);
  return pages
    .filter(p => text(p, "Email"))
    .map(p => ({
      id: pageId(p),
      name: text(p, "Owner Name"),
      email: text(p, "Email"),
      phone: text(p, "Phone"),
      propertyIds: relations(p, "Properties"),
    }));
}

export async function fetchProperties(ids?: string[]): Promise<Property[]> {
  const pages = await queryDatabase(DB.properties);
  return pages
    .filter(p => !ids || ids.includes(pageId(p)))
    .map(p => ({
      id: pageId(p),
      name: text(p, "Property Name"),
      address: text(p, "Address"),
      city: text(p, "City"),
      type: text(p, "Type"),
      status: text(p, "Status"),
      monthlyRent: num(p, "Monthly Rent"),
      bedrooms: num(p, "Bedrooms"),
      bathrooms: num(p, "Bathrooms"),
    }));
}

export async function fetchRentForMonth(month: string, year: number): Promise<RentEntry[]> {
  const pages = await queryDatabase(DB.rentTracker, {
    and: [
      { property: "Month", select: { equals: month } },
      { property: "Year", number: { equals: year } },
    ],
  });

  return pages.map(p => ({
    id: pageId(p),
    entry: text(p, "Entry"),
    propertyId: relations(p, "Property")[0] ?? "",
    tenantId: relations(p, "Tenant")[0] ?? null,
    month: text(p, "Month"),
    year: num(p, "Year"),
    amountDue: num(p, "Amount Due"),
    amountPaid: num(p, "Amount Paid"),
    datePaid: date(p, "Date Paid"),
    paymentStatus: text(p, "Payment Status"),
  }));
}

export async function fetchMaintenanceForProperties(propertyIds: string[]): Promise<MaintenanceItem[]> {
  // Fetch all non-done maintenance items
  const pages = await queryDatabase(DB.maintenance, {
    property: "Status",
    select: { does_not_equal: "Done" },
  });

  return pages
    .filter(p => {
      const propIds = relations(p, "Property");
      return propIds.some(id => propertyIds.includes(id));
    })
    .map(p => {
      const dateReported = date(p, "Date Reported");
      return {
        id: pageId(p),
        issue: text(p, "Issue"),
        propertyId: relations(p, "Property")[0] ?? "",
        category: text(p, "Category"),
        priority: text(p, "Priority"),
        status: text(p, "Status"),
        reportedBy: text(p, "Reported By"),
        dateReported,
        dateCompleted: date(p, "Date Completed"),
        cost: num(p, "Cost"),
        notes: text(p, "Notes"),
        daysPending: dateReported ? daysSince(dateReported) : null,
      };
    });
}

export async function fetchExpensesForMonth(propertyIds: string[], month: string, year: number): Promise<Expense[]> {
  // Expenses don't have a month filter in schema — filter by date range
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const startDate = new Date(year, monthIndex, 1).toISOString().split("T")[0];
  const endDate = new Date(year, monthIndex + 1, 0).toISOString().split("T")[0];

  const pages = await queryDatabase(DB.expenses, {
    property: "Date",
    date: { on_or_after: startDate, on_or_before: endDate },
  });

  return pages
    .filter(p => {
      const propIds = relations(p, "Property");
      return propIds.some(id => propertyIds.includes(id));
    })
    .map(p => ({
      id: pageId(p),
      description: text(p, "Description") || text(p, "Name") || text(p, "Expense"),
      propertyId: relations(p, "Property")[0] ?? "",
      amount: num(p, "Amount"),
      category: text(p, "Category"),
      date: date(p, "Date"),
    }));
}

// ── Main: build full report data for all owners ────────────────────────────

export async function buildOwnerReports(month: string, year: number): Promise<OwnerReport[]> {
  const [owners, allProperties] = await Promise.all([
    fetchOwners(),
    fetchProperties(),
  ]);

  const allPropertyIds = owners.flatMap(o => o.propertyIds);

  const [rentEntries, maintenanceItems, expenses] = await Promise.all([
    fetchRentForMonth(month, year),
    fetchMaintenanceForProperties(allPropertyIds),
    fetchExpensesForMonth(allPropertyIds, month, year),
  ]);

  return owners.map(owner => {
    const ownerProperties = allProperties.filter(p => owner.propertyIds.includes(p.id));

    return {
      owner,
      month,
      year,
      properties: ownerProperties.map(property => ({
        property,
        rent: rentEntries.filter(r => r.propertyId === property.id),
        maintenance: maintenanceItems.filter(m => m.propertyId === property.id),
        expenses: expenses.filter(e => e.propertyId === property.id),
      })),
    };
  });
}
