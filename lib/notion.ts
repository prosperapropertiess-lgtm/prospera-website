/**
 * Notion API client for Prospera Properties
 * Pulls comprehensive data for the monthly owner report.
 */

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

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

// ── Property helpers ───────────────────────────────────────────────────────

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

function dateStart(page: any, name: string): string | null {
  return prop(page, name)?.date?.start ?? null;
}

function relations(page: any, name: string): string[] {
  return (prop(page, name)?.relation ?? []).map((r: any) => r.id.replace(/-/g, ""));
}

function pageId(page: any): string {
  return page.id.replace(/-/g, "");
}

async function getPage(pageId: string): Promise<any> {
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion getPage failed: ${await res.text()}`);
  return res.json();
}

export interface NotionFile {
  name: string;
  url: string;
  /** "notion" = expires ~1hr, "external" = permanent */
  source: "notion" | "external";
}

/** Returns all files attached to any "files" property on a Notion page. */
export async function fetchTenantFiles(notionTenantId: string): Promise<NotionFile[]> {
  // Notion page IDs use hyphens; strip them if needed
  const id = notionTenantId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  const page = await getPage(id);

  const results: NotionFile[] = [];
  for (const [, value] of Object.entries<any>(page.properties ?? {})) {
    if (value?.type !== "files") continue;
    for (const f of value.files ?? []) {
      if (f.type === "file" && f.file?.url) {
        results.push({ name: f.name, url: f.file.url, source: "notion" });
      } else if (f.type === "external" && f.external?.url) {
        results.push({ name: f.name, url: f.external.url, source: "external" });
      }
    }
  }
  return results;
}

export function daysSince(dateStr: string): number {
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
  notes: string;
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
  marketRate: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  notes: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  monthlyRent: number | null;
  securityDeposit: number | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  status: string;
  notes: string;
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
  notes: string;
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

export interface PropertyReport {
  property: Property;
  tenants: Tenant[];
  rentCurrentMonth: RentEntry[];
  rentPreviousMonth: RentEntry[];
  rentYTD: RentEntry[];
  maintenanceOpen: MaintenanceItem[];
  maintenanceCompletedRecent: MaintenanceItem[];
  expensesCurrentMonth: Expense[];
  expensesPreviousMonth: Expense[];
  expensesYTD: Expense[];
}

export interface OwnerBundle {
  owners: Owner[];                 // all co-owners (e.g. Tina AND Randy)
  properties: PropertyReport[];    // all properties owned (grouped)
  month: string;
  year: number;
}

// ── Fetchers ───────────────────────────────────────────────────────────────

export async function fetchAllOwners(): Promise<Owner[]> {
  const pages = await queryDatabase(DB.owners);
  return pages.map(p => ({
    id: pageId(p),
    name: text(p, "Owner Name"),
    email: text(p, "Email"),
    phone: text(p, "Phone"),
    notes: text(p, "Notes"),
    propertyIds: relations(p, "Properties"),
  }));
}

export async function fetchAllProperties(): Promise<Property[]> {
  const pages = await queryDatabase(DB.properties);
  return pages.map(p => ({
    id: pageId(p),
    name: text(p, "Property Name"),
    address: text(p, "Address"),
    city: text(p, "City"),
    type: text(p, "Type"),
    status: text(p, "Status"),
    monthlyRent: num(p, "Monthly Rent"),
    marketRate: num(p, "Market Rate"),
    bedrooms: num(p, "Bedrooms"),
    bathrooms: num(p, "Bathrooms"),
    notes: text(p, "Notes"),
  }));
}

export async function fetchAllTenants(): Promise<Tenant[]> {
  const pages = await queryDatabase(DB.tenants);
  return pages.map(p => ({
    id: pageId(p),
    name: text(p, "Tenant Name"),
    email: text(p, "Email"),
    phone: text(p, "Phone"),
    propertyId: relations(p, "Property")[0] ?? "",
    monthlyRent: num(p, "Monthly Rent"),
    securityDeposit: num(p, "Security Deposit"),
    leaseStart: dateStart(p, "Lease Start"),
    leaseEnd: dateStart(p, "Lease End"),
    status: text(p, "Status"),
    notes: text(p, "Notes"),
  }));
}

export async function fetchRentForTenant(notionTenantId: string): Promise<RentEntry[]> {
  const pages = await queryDatabase(DB.rentTracker, {
    property: "Tenant",
    relation: { contains: notionTenantId },
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
    datePaid: dateStart(p, "Date Paid"),
    paymentStatus: text(p, "Payment Status"),
    notes: text(p, "Notes"),
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
    datePaid: dateStart(p, "Date Paid"),
    paymentStatus: text(p, "Payment Status"),
    notes: text(p, "Notes"),
  }));
}

export async function fetchRentForYear(year: number): Promise<RentEntry[]> {
  const pages = await queryDatabase(DB.rentTracker, {
    property: "Year",
    number: { equals: year },
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
    datePaid: dateStart(p, "Date Paid"),
    paymentStatus: text(p, "Payment Status"),
    notes: text(p, "Notes"),
  }));
}

export async function fetchMaintenanceForProperties(propertyIds: string[]): Promise<MaintenanceItem[]> {
  const pages = await queryDatabase(DB.maintenance);
  return pages
    .filter(p => {
      const ids = relations(p, "Property");
      return ids.some(id => propertyIds.includes(id));
    })
    .map(p => {
      const dr = dateStart(p, "Date Reported");
      const dc = dateStart(p, "Date Completed");
      return {
        id: pageId(p),
        issue: text(p, "Issue"),
        propertyId: relations(p, "Property")[0] ?? "",
        category: text(p, "Category"),
        priority: text(p, "Priority"),
        status: text(p, "Status"),
        reportedBy: text(p, "Reported By"),
        dateReported: dr,
        dateCompleted: dc,
        cost: num(p, "Cost"),
        notes: text(p, "Notes"),
        daysPending: dr && text(p, "Status") !== "Done" ? daysSince(dr) : null,
      };
    });
}

export async function fetchExpensesForDateRange(
  propertyIds: string[],
  startDate: string,
  endDate: string
): Promise<Expense[]> {
  const pages = await queryDatabase(DB.expenses, {
    and: [
      { property: "Date", date: { on_or_after: startDate } },
      { property: "Date", date: { on_or_before: endDate } },
    ],
  });
  return pages
    .filter(p => {
      const ids = relations(p, "Property");
      return ids.some(id => propertyIds.includes(id));
    })
    .map(p => ({
      id: pageId(p),
      description: text(p, "Description") || text(p, "Name") || text(p, "Expense") || "(no description)",
      propertyId: relations(p, "Property")[0] ?? "",
      amount: num(p, "Amount"),
      category: text(p, "Category"),
      date: dateStart(p, "Date"),
    }));
}

// ── Main builder ───────────────────────────────────────────────────────────

/**
 * Groups owners into bundles (co-owners share one bundle).
 * Pulls all data needed for the monthly report.
 */
export async function buildOwnerBundles(month: string, year: number): Promise<OwnerBundle[]> {
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthIndex = MONTHS.indexOf(month);

  // Previous month
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const prevMonth = MONTHS[prevMonthIndex];

  // Date ranges
  const currentStart = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const currentEnd   = new Date(year, monthIndex + 1, 0).toISOString().split("T")[0];
  const prevStart    = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, "0")}-01`;
  const prevEnd      = new Date(prevYear, prevMonthIndex + 1, 0).toISOString().split("T")[0];
  const ytdStart     = `${year}-01-01`;

  // Fetch everything in parallel (maintenance needs property IDs, so split into two waves)
  const [allOwners, allProperties, allTenants, rentCurrent, rentPrev, rentYTD] = await Promise.all([
    fetchAllOwners(),
    fetchAllProperties(),
    fetchAllTenants(),
    fetchRentForMonth(month, year),
    fetchRentForMonth(prevMonth, prevYear),
    fetchRentForYear(year),
  ]);

  const allPropertyIds = allProperties.map((p: Property) => p.id);
  const allMaintenance = await fetchMaintenanceForProperties(allPropertyIds);

  const [expensesCurrent, expensesPrev, expensesYTD] = await Promise.all([
    fetchExpensesForDateRange(allPropertyIds, currentStart, currentEnd),
    fetchExpensesForDateRange(allPropertyIds, prevStart, prevEnd),
    fetchExpensesForDateRange(allPropertyIds, ytdStart, currentEnd),
  ]);

  // Group co-owners: owners who share all the same properties go in one bundle
  const processed = new Set<string>();
  const bundles: OwnerBundle[] = [];

  for (const owner of allOwners) {
    if (processed.has(owner.id)) continue;

    // Find co-owners — others who own any of the same properties
    const myPropSet = new Set(owner.propertyIds);
    const coOwners = allOwners.filter(o =>
      o.id !== owner.id && o.propertyIds.some(pid => myPropSet.has(pid))
    );

    const bundleOwners = [owner, ...coOwners];
    bundleOwners.forEach(o => processed.add(o.id));

    const allBundlePropertyIds = [...new Set(bundleOwners.flatMap(o => o.propertyIds))];
    const bundleProperties = allProperties.filter(p => allBundlePropertyIds.includes(p.id));

    const propertyReports: PropertyReport[] = bundleProperties.map(property => {
      const pid = property.id;
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - 60); // last 60 days

      const maintenance = allMaintenance.filter(m => m.propertyId === pid);
      const maintenanceOpen = maintenance.filter(m => m.status !== "Done");
      const maintenanceCompletedRecent = maintenance.filter(m =>
        m.status === "Done" &&
        m.dateCompleted &&
        new Date(m.dateCompleted) >= recentCutoff
      );

      return {
        property,
        tenants: allTenants.filter(t => t.propertyId === pid),
        rentCurrentMonth: rentCurrent.filter(r => r.propertyId === pid),
        rentPreviousMonth: rentPrev.filter(r => r.propertyId === pid),
        rentYTD: rentYTD.filter(r => r.propertyId === pid),
        maintenanceOpen,
        maintenanceCompletedRecent,
        expensesCurrentMonth: expensesCurrent.filter(e => e.propertyId === pid),
        expensesPreviousMonth: expensesPrev.filter(e => e.propertyId === pid),
        expensesYTD: expensesYTD.filter(e => e.propertyId === pid),
      };
    });

    if (propertyReports.length > 0) {
      bundles.push({ owners: bundleOwners, properties: propertyReports, month, year });
    }
  }

  return bundles;
}

// ── Write functions ────────────────────────────────────────────────────────
// Used by the landlord onboarding pipeline.

async function createPage(databaseId: string, properties: object): Promise<string> {
  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion createPage failed (${databaseId}): ${err}`);
  }
  const data = await res.json();
  return data.id.replace(/-/g, "");
}

export async function updateNotionPage(pageId: string, properties: object): Promise<void> {
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion updatePage failed (${pageId}): ${err}`);
  }
}

export async function createOwnerInNotion(data: {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}): Promise<string> {
  return createPage(DB.owners, {
    "Owner Name": { title: [{ text: { content: data.name } }] },
    "Email":      { email: data.email },
    "Phone":      { phone_number: data.phone ?? "" },
    "Notes":      { rich_text: [{ text: { content: data.notes ?? "" } }] },
    "Status":     { select: { name: "Onboarding In Progress" } },
  });
}

export async function createPropertyInNotion(data: {
  address: string;
  city?: string;
  type?: string;
  units?: number;
  monthlyRent?: number;
  ownerId: string;
  notes?: string;
}): Promise<string> {
  return createPage(DB.properties, {
    "Property Name": { title: [{ text: { content: data.address } }] },
    "Address":       { rich_text: [{ text: { content: data.address } }] },
    "City":          { select: { name: data.city ?? "London" } },
    "Type":          { select: { name: data.type ?? "Single Family" } },
    "Monthly Rent":  { number: data.monthlyRent ?? 0 },
    "Status":        { select: { name: "Onboarding" } },
    "Notes":         { rich_text: [{ text: { content: data.notes ?? "" } }] },
    "Owner":         { relation: [{ id: data.ownerId }] },
  });
}

export async function createTenantInNotion(data: {
  name: string;
  email?: string;
  phone?: string;
  unit?: string;
  monthlyRent?: number;
  leaseStart?: string;
  leaseEnd?: string;
  securityDeposit?: number;
  propertyId: string;
}): Promise<string> {
  return createPage(DB.tenants, {
    "Tenant Name":      { title: [{ text: { content: data.name } }] },
    "Email":            { email: data.email ?? "" },
    "Phone":            { phone_number: data.phone ?? "" },
    "Monthly Rent":     { number: data.monthlyRent ?? 0 },
    "Security Deposit": { number: data.securityDeposit ?? 0 },
    "Lease Start":      data.leaseStart ? { date: { start: data.leaseStart } } : { date: null },
    "Lease End":        data.leaseEnd   ? { date: { start: data.leaseEnd   } } : { date: null },
    "Status":           { select: { name: "Active" } },
    "Notes":            { rich_text: [{ text: { content: data.unit ? `Unit: ${data.unit}` : "" } }] },
    "Property":         { relation: [{ id: data.propertyId }] },
  });
}

const MONTHS_LIST = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export async function createRentTrackerEntry(data: {
  tenantId: string;
  propertyId: string;
  month: string;
  year: number;
  amountDue: number;
  tenantName?: string;
}): Promise<string> {
  const entryTitle = `${data.tenantName ?? "Tenant"} — ${data.month} ${data.year}`;
  return createPage(DB.rentTracker, {
    "Entry":          { title: [{ text: { content: entryTitle } }] },
    "Month":          { select: { name: data.month } },
    "Year":           { number: data.year },
    "Amount Due":     { number: data.amountDue },
    "Payment Status": { select: { name: "Unpaid" } },
    "Property":       { relation: [{ id: data.propertyId }] },
    "Tenant":         { relation: [{ id: data.tenantId }] },
  });
}

/** Create rent tracker entries for a tenant from startMonth through lease end (max 24 months). */
export async function createRentTrackerSeries(data: {
  tenantId: string;
  propertyId: string;
  amountDue: number;
  leaseStart: string;
  leaseEnd?: string;
  tenantName?: string;
}): Promise<void> {
  const start = new Date(data.leaseStart);
  const end = data.leaseEnd ? new Date(data.leaseEnd) : new Date(start.getFullYear() + 1, start.getMonth(), 1);
  const cap = new Date(start);
  cap.setMonth(cap.getMonth() + 24);
  const cutoff = end < cap ? end : cap;

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= cutoff) {
    await createRentTrackerEntry({
      tenantId:   data.tenantId,
      propertyId: data.propertyId,
      month:      MONTHS_LIST[cursor.getMonth()],
      year:       cursor.getFullYear(),
      amountDue:  data.amountDue,
      tenantName: data.tenantName,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
}
