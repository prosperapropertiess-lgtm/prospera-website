/**
 * Hardcoded demo data for the public prospect demo portal.
 * No real tenants, no real properties — entirely fictional.
 */

export const DEMO_OWNER = {
  name: "James & Sarah Mitchell",
  firstName: "James",
  initials: "JM",
  email: "james.mitchell@example.com",
  phone: "(519) 555-0142",
};

export const DEMO_TENANT = {
  name: "Emily Chen",
  firstName: "Emily",
  initials: "EC",
  unit: "Unit 2",
  email: "emily.chen@example.com",
  phone: "(519) 555-0198",
};

export const DEMO_PROPERTY = {
  address: "482 Ridout Street North",
  city: "London, ON  N6A 2P2",
  type: "Upper-unit duplex",
  bedrooms: 2,
  bathrooms: 1,
  sqft: 920,
  yearBuilt: 1962,
  purchaseYear: 2021,
  marketValue: 485000,
};

// ── 12-month financial history ─────────────────────────────────────────────

export interface MonthSnapshot {
  month: string;
  year: number;
  rentDue: number;
  rentCollected: number;
  expenses: number;
  net: number;
  expenseBreakdown: Record<string, number>;
  paymentStatus: "Paid" | "On Time" | "Late" | "Partial";
  paymentDate: string;
}

export const HISTORY: MonthSnapshot[] = [
  {
    month: "July", year: 2025,
    rentDue: 1950, rentCollected: 1950, expenses: 0, net: 1950,
    expenseBreakdown: {},
    paymentStatus: "On Time", paymentDate: "Jul 1, 2025",
  },
  {
    month: "August", year: 2025,
    rentDue: 1950, rentCollected: 1950, expenses: 142, net: 1808,
    expenseBreakdown: { "Repairs": 142 },
    paymentStatus: "On Time", paymentDate: "Aug 1, 2025",
  },
  {
    month: "September", year: 2025,
    rentDue: 1950, rentCollected: 1950, expenses: 248, net: 1702,
    expenseBreakdown: { "Management Fee": 195, "Supplies": 53 },
    paymentStatus: "Paid", paymentDate: "Sep 1, 2025",
  },
  {
    month: "October", year: 2025,
    rentDue: 1950, rentCollected: 1950, expenses: 195, net: 1755,
    expenseBreakdown: { "Management Fee": 195 },
    paymentStatus: "On Time", paymentDate: "Oct 1, 2025",
  },
  {
    month: "November", year: 2025,
    rentDue: 1950, rentCollected: 1950, expenses: 387, net: 1563,
    expenseBreakdown: { "Management Fee": 195, "Plumbing": 192 },
    paymentStatus: "On Time", paymentDate: "Nov 1, 2025",
  },
  {
    month: "December", year: 2025,
    rentDue: 1950, rentCollected: 1950, expenses: 310, net: 1640,
    expenseBreakdown: { "Management Fee": 195, "Snow Removal": 115 },
    paymentStatus: "Late", paymentDate: "Dec 8, 2025",
  },
  {
    month: "January", year: 2026,
    rentDue: 1950, rentCollected: 1950, expenses: 545, net: 1405,
    expenseBreakdown: { "Management Fee": 195, "HVAC Service": 350 },
    paymentStatus: "On Time", paymentDate: "Jan 1, 2026",
  },
  {
    month: "February", year: 2026,
    rentDue: 1950, rentCollected: 1950, expenses: 195, net: 1755,
    expenseBreakdown: { "Management Fee": 195 },
    paymentStatus: "On Time", paymentDate: "Feb 1, 2026",
  },
  {
    month: "March", year: 2026,
    rentDue: 1950, rentCollected: 1950, expenses: 195, net: 1755,
    expenseBreakdown: { "Management Fee": 195 },
    paymentStatus: "Paid", paymentDate: "Mar 1, 2026",
  },
  {
    month: "April", year: 2026,
    rentDue: 1950, rentCollected: 1950, expenses: 427, net: 1523,
    expenseBreakdown: { "Management Fee": 195, "Appliance Repair": 232 },
    paymentStatus: "On Time", paymentDate: "Apr 1, 2026",
  },
  {
    month: "May", year: 2026,
    rentDue: 1950, rentCollected: 1950, expenses: 195, net: 1755,
    expenseBreakdown: { "Management Fee": 195 },
    paymentStatus: "On Time", paymentDate: "May 1, 2026",
  },
  {
    month: "June", year: 2026,
    rentDue: 1950, rentCollected: 1950, expenses: 195, net: 1755,
    expenseBreakdown: { "Management Fee": 195 },
    paymentStatus: "On Time", paymentDate: "Jun 1, 2026",
  },
];

// YTD = Jan–Jun 2026 (current year)
export const YTD = HISTORY.filter(h => h.year === 2026);
export const YTD_COLLECTED = YTD.reduce((s, h) => s + h.rentCollected, 0);
export const YTD_EXPENSES  = YTD.reduce((s, h) => s + h.expenses, 0);
export const YTD_NET       = YTD_COLLECTED - YTD_EXPENSES;
export const CURRENT_MONTH = HISTORY[HISTORY.length - 1];

// ── Maintenance tickets ────────────────────────────────────────────────────

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Done";
  dateReported: string;
  dateCompleted?: string;
  vendor?: string;
  cost?: number;
  notes?: string;
}

export const MAINTENANCE: MaintenanceTicket[] = [
  {
    id: "m1",
    title: "Kitchen faucet dripping",
    description: "The hot-water handle has been dripping for about a week. Not urgent but getting worse.",
    category: "Plumbing",
    priority: "Medium",
    status: "In Progress",
    dateReported: "Jun 28, 2026",
    vendor: "A&R Plumbing",
    notes: "Vendor contacted Jun 29 — scheduled for Jul 3.",
  },
  {
    id: "m2",
    title: "Bedroom window latch broken",
    description: "The latch on the north bedroom window is stuck and won't lock properly.",
    category: "Windows & Doors",
    priority: "Low",
    status: "Open",
    dateReported: "Jul 2, 2026",
  },
  {
    id: "m3",
    title: "Bathroom exhaust fan replaced",
    description: "Fan was noisy and not venting properly. Full replacement done.",
    category: "Electrical",
    priority: "Medium",
    status: "Done",
    dateReported: "May 12, 2026",
    dateCompleted: "May 18, 2026",
    vendor: "London Electric",
    cost: 232,
    notes: "Unit replaced with quiet Broan model. Tenant confirmed working.",
  },
  {
    id: "m4",
    title: "Furnace annual service",
    description: "Routine annual furnace inspection and filter replacement.",
    category: "HVAC",
    priority: "Low",
    status: "Done",
    dateReported: "Jan 5, 2026",
    dateCompleted: "Jan 14, 2026",
    vendor: "CleanAir HVAC",
    cost: 350,
    notes: "All clear. Recommended next service Jan 2027.",
  },
  {
    id: "m5",
    title: "Oven element not working",
    description: "Bottom oven element burned out. Tenant has been using stovetop only.",
    category: "Appliances",
    priority: "Medium",
    status: "Done",
    dateReported: "Apr 2, 2026",
    dateCompleted: "Apr 11, 2026",
    vendor: "Appliance Masters",
    cost: 232,
    notes: "Element replaced. Warranty: 90 days parts & labour.",
  },
  {
    id: "m6",
    title: "Exterior drain clearing",
    description: "Downspout at back of property blocked with leaves — noticed during inspection.",
    category: "Exterior",
    priority: "Low",
    status: "Done",
    dateReported: "Nov 4, 2025",
    dateCompleted: "Nov 9, 2025",
    vendor: "Prospera (in-house)",
    cost: 0,
    notes: "Cleared during routine inspection visit. No charge.",
  },
];

// ── Documents ──────────────────────────────────────────────────────────────

export const OWNER_DOCUMENTS = [
  { id: "d1", name: "Lease Agreement — Emily Chen", date: "Jul 1, 2025", type: "Lease", size: "284 KB" },
  { id: "d2", name: "Move-In Inspection Report", date: "Jul 1, 2025", type: "Inspection", size: "1.2 MB" },
  { id: "d3", name: "Statement — June 2026", date: "Jul 10, 2026", type: "Statement", size: "96 KB" },
  { id: "d4", name: "Statement — May 2026", date: "Jun 10, 2026", type: "Statement", size: "94 KB" },
  { id: "d5", name: "Statement — April 2026", date: "May 10, 2026", type: "Statement", size: "98 KB" },
  { id: "d6", name: "Year-End Summary 2025", date: "Jan 15, 2026", type: "Tax", size: "212 KB" },
  { id: "d7", name: "N13 Notice — HVAC Upgrade", date: "Jan 5, 2026", type: "Legal", size: "88 KB" },
];

export const TENANT_DOCUMENTS = [
  { id: "t1", name: "Your Lease Agreement", date: "Jul 1, 2025", type: "Lease" },
  { id: "t2", name: "Move-In Checklist", date: "Jul 1, 2025", type: "Checklist" },
  { id: "t3", name: "Welcome Guide — 482 Ridout N", date: "Jul 1, 2025", type: "Guide" },
  { id: "t4", name: "Parking & Waste Schedule", date: "Jul 1, 2025", type: "Info" },
];

// ── Messages ───────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  from: "owner" | "tenant" | "prospera";
  senderName: string;
  body: string;
  date: string;
  read: boolean;
}

export const OWNER_MESSAGES: Message[] = [
  {
    id: "msg1",
    from: "prospera",
    senderName: "Prospera Team",
    body: "Hi James — quick update on the kitchen faucet. We've scheduled A&R Plumbing for Thursday July 3. They'll call Emily directly to confirm the time. We'll send you the invoice once the work is done.",
    date: "Jun 29, 2026",
    read: false,
  },
  {
    id: "msg2",
    from: "prospera",
    senderName: "Prospera Team",
    body: "Your June 2026 statement has been posted to the Documents section. Net income this month: $1,755. No surprises.",
    date: "Jul 10, 2026",
    read: false,
  },
  {
    id: "msg3",
    from: "prospera",
    senderName: "Prospera Team",
    body: "Emily's lease is up for renewal on June 30, 2027. We'll reach out to her 90 days in advance (April) to discuss renewal terms and allowable rent increase. No action needed from you right now.",
    date: "Jun 15, 2026",
    read: true,
  },
  {
    id: "msg4",
    from: "prospera",
    senderName: "Prospera Team",
    body: "Move-in inspection done. Property in excellent condition — Emily noted one small scuff on the living room wall, documented in the report. Report is now in your Documents section.",
    date: "Jul 1, 2025",
    read: true,
  },
];

export const TENANT_MESSAGES: Message[] = [
  {
    id: "tm1",
    from: "prospera",
    senderName: "Prospera Properties",
    body: "Hi Emily — we've got a plumber booked for Thursday July 3 to fix the kitchen faucet. They'll call you at (519) 555-0198 to confirm the arrival time. Should take about an hour.",
    date: "Jun 29, 2026",
    read: false,
  },
  {
    id: "tm2",
    from: "prospera",
    senderName: "Prospera Properties",
    body: "Your rent of $1,950 was received on June 1 — thank you! A receipt has been added to your Documents section.",
    date: "Jun 1, 2026",
    read: true,
  },
  {
    id: "tm3",
    from: "prospera",
    senderName: "Prospera Properties",
    body: "Welcome to 482 Ridout Street North! We're glad you're settled in. Your home guide and parking schedule are in the Documents section. Reach out anytime through this portal — we typically respond within a few hours.",
    date: "Jul 1, 2025",
    read: true,
  },
];

// ── Payment history (tenant view) ─────────────────────────────────────────

export const PAYMENT_HISTORY = HISTORY.map(h => ({
  month: `${h.month} ${h.year}`,
  amount: h.rentCollected,
  status: h.paymentStatus,
  date: h.paymentDate,
}));
