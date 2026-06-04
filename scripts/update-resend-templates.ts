/**
 * Updates all Resend templates with the new design from lib/emails.ts
 * and lib/owner-report-email.ts.
 * Run with: npx tsx scripts/update-resend-templates.ts
 */

import {
  landlordWelcomeEmail,
  tenantWelcomeEmail,
  resourceDownloadEmail,
} from "../lib/emails";
import {
  buildEmailHTML,
  type ClaudeNarrative,
} from "../lib/owner-report-email";
import type { OwnerBundle } from "../lib/notion";

const RESEND_API_KEY =
  process.env.RESEND_API_KEY ?? "re_D2njYrm1_8fh7gQGBStkpcGg4EKTG38e6";

const FILE_URLS: Record<string, string> = {
  "ontario-standard-lease": "https://www.ontario.ca/laws/statute/06r17",
  "lease-addendum": "https://www.prosperaproperties.co/forms/lease-addendum.pdf",
  "eviction-notices": "https://www.prosperaproperties.co/forms/N4-clean.pdf",
  "tenant-screening-checklist": null,
  "rent-increase-n1": null,
  "property-inspection-checklist": null,
  "landlord-tax-guide": null,
  "maintenance-request-form": null,
  "rental-application": null,
  "landlord-rights-guide": null,
} as unknown as Record<string, string>;

const RESOURCE_TITLES: Record<string, string> = {
  "ontario-standard-lease": "Ontario Standard Lease",
  "lease-addendum": "17-Point Lease Protection Addendum",
  "tenant-screening-checklist": "Tenant Screening Checklist",
  "rent-increase-n1": "Rent Increase N1 Guide",
  "eviction-notices": "Eviction Notices (N4, N5, N12)",
  "property-inspection-checklist": "Property Inspection Checklist",
  "landlord-tax-guide": "Ontario Landlord Tax Guide",
  "maintenance-request-form": "Maintenance Request Form",
  "rental-application": "Rental Application Template",
  "landlord-rights-guide": "Ontario Landlord Rights Guide",
};

// Use a real example name — templates are display-only (emails are sent via code, not templateId)
const EXAMPLE_NAME = "Sarah";

// ── Mock data for Monthly Owner Report template ────────────────────────────

const mockBundle: OwnerBundle = {
  month: "May",
  year: 2025,
  owners: [
    { id: "1", name: "Tina Lahey", email: "homesbylah@gmail.com", phone: "519-555-0101", notes: "", propertyIds: ["p1"] },
    { id: "2", name: "Randy Lahey", email: "randy@gmail.com", phone: "519-555-0102", notes: "", propertyIds: ["p1"] },
  ],
  properties: [
    {
      property: { id: "p1", name: "27 Horton", address: "27 Horton Street", city: "St. Thomas", type: "Duplex", status: "Occupied", monthlyRent: 3100, bedrooms: 4, bathrooms: 2, notes: "" },
      tenants: [
        { id: "t1", name: "Mikayla Johnson", email: "mikayla@gmail.com", phone: "519-555-0201", propertyId: "p1", monthlyRent: 1650, securityDeposit: null, leaseStart: "2022-09-01", leaseEnd: "2025-06-30", status: "Active", notes: "" },
        { id: "t2", name: "Ben & Carol Martin", email: "ben@gmail.com", phone: "519-555-0202", propertyId: "p1", monthlyRent: 1450, securityDeposit: null, leaseStart: "2020-05-01", leaseEnd: "2026-04-30", status: "Active", notes: "" },
      ],
      rentCurrentMonth: [
        { id: "r1", entry: "Unit 1 — May 2025", propertyId: "p1", tenantId: "t1", month: "May", year: 2025, amountDue: 1650, amountPaid: 1650, datePaid: "2025-05-01", paymentStatus: "Paid", notes: "" },
        { id: "r2", entry: "Unit 2 — May 2025", propertyId: "p1", tenantId: "t2", month: "May", year: 2025, amountDue: 1450, amountPaid: 1450, datePaid: "2025-05-03", paymentStatus: "Paid", notes: "" },
      ],
      rentPreviousMonth: [],
      rentYTD: [
        { id: "r3", entry: "Unit 1 — Jan", propertyId: "p1", tenantId: "t1", month: "January", year: 2025, amountDue: 1650, amountPaid: 1650, datePaid: "2025-01-01", paymentStatus: "Paid", notes: "" },
        { id: "r4", entry: "Unit 2 — Jan", propertyId: "p1", tenantId: "t2", month: "January", year: 2025, amountDue: 1450, amountPaid: 1450, datePaid: "2025-01-03", paymentStatus: "Paid", notes: "" },
        { id: "r5", entry: "Unit 1 — Feb", propertyId: "p1", tenantId: "t1", month: "February", year: 2025, amountDue: 1650, amountPaid: 1650, datePaid: "2025-02-01", paymentStatus: "Paid", notes: "" },
        { id: "r6", entry: "Unit 2 — Feb", propertyId: "p1", tenantId: "t2", month: "February", year: 2025, amountDue: 1450, amountPaid: 1450, datePaid: "2025-02-03", paymentStatus: "Paid", notes: "" },
        { id: "r7", entry: "Unit 1 — Mar", propertyId: "p1", tenantId: "t1", month: "March", year: 2025, amountDue: 1650, amountPaid: 1650, datePaid: "2025-03-01", paymentStatus: "Paid", notes: "" },
        { id: "r8", entry: "Unit 2 — Mar", propertyId: "p1", tenantId: "t2", month: "March", year: 2025, amountDue: 1450, amountPaid: 1450, datePaid: "2025-03-03", paymentStatus: "Paid", notes: "" },
        { id: "r9", entry: "Unit 1 — Apr", propertyId: "p1", tenantId: "t1", month: "April", year: 2025, amountDue: 1650, amountPaid: 1650, datePaid: "2025-04-01", paymentStatus: "Paid", notes: "" },
        { id: "r10", entry: "Unit 2 — Apr", propertyId: "p1", tenantId: "t2", month: "April", year: 2025, amountDue: 1450, amountPaid: 1450, datePaid: "2025-04-03", paymentStatus: "Paid", notes: "" },
        { id: "r1", entry: "Unit 1 — May 2025", propertyId: "p1", tenantId: "t1", month: "May", year: 2025, amountDue: 1650, amountPaid: 1650, datePaid: "2025-05-01", paymentStatus: "Paid", notes: "" },
        { id: "r2", entry: "Unit 2 — May 2025", propertyId: "p1", tenantId: "t2", month: "May", year: 2025, amountDue: 1450, amountPaid: 1450, datePaid: "2025-05-03", paymentStatus: "Paid", notes: "" },
      ],
      maintenanceOpen: [
        { id: "m1", issue: "Deck repair — boards warping", propertyId: "p1", category: "Structural", priority: "Medium", status: "In Progress", reportedBy: "Tenant", dateReported: "2025-04-15", dateCompleted: null, cost: 800, notes: "Contractor booked for June", daysPending: 46 },
      ],
      maintenanceCompletedRecent: [
        { id: "m2", issue: "Furnace filter replacement", propertyId: "p1", category: "HVAC", priority: "Low", status: "Done", reportedBy: "Ebin", dateReported: "2025-04-20", dateCompleted: "2025-04-22", cost: 45, notes: "", daysPending: null },
      ],
      expensesCurrentMonth: [
        { id: "e1", description: "Monthly management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2025-05-01" },
        { id: "e2", description: "Water bill", propertyId: "p1", amount: 112, category: "Utilities", date: "2025-05-05" },
        { id: "e3", description: "Deck repair deposit", propertyId: "p1", amount: 105, category: "Repairs & Maintenance", date: "2025-05-10" },
      ],
      expensesPreviousMonth: [],
      expensesYTD: [
        { id: "e4", description: "Jan management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2025-01-01" },
        { id: "e5", description: "Feb management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2025-02-01" },
        { id: "e6", description: "Mar management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2025-03-01" },
        { id: "e7", description: "Apr management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2025-04-01" },
        { id: "e1", description: "Monthly management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2025-05-01" },
        { id: "e2", description: "Water bill", propertyId: "p1", amount: 112, category: "Utilities", date: "2025-05-05" },
        { id: "e3", description: "Deck repair deposit", propertyId: "p1", amount: 105, category: "Repairs & Maintenance", date: "2025-05-10" },
      ],
    },
  ],
};

const mockNarrative: ClaudeNarrative = {
  subject: "27 Horton Street — May 2025 Monthly Update from Prospera Properties",
  openingSentence: "May was a smooth month — both units paid on time and the deck repair is actively moving forward.",
  lookingAhead: [
    { title: "Lease Renewal — Unit 1", description: "Mikayla's lease expires June 30. We recommend sending the renewal offer this week to lock in early." },
    { title: "Deck Repair", description: "Contractor confirmed for the week of June 10. Should be completed within 2 days weather permitting." },
  ],
  criticalAlert: {
    title: "Lease Renewal Pending",
    body: "Mikayla's lease for Unit 1 expires in 45 days. We recommend initiating the renewal offer by next Friday.",
    ctaLabel: "Reply to Confirm Renewal",
  },
  closingNote: "As always, feel free to reply to this email or call me directly — happy to walk through anything.",
  joke: "Why did the tenant bring a ladder to the lease signing? Because they heard the rent was going through the roof!",
};

// ── Static templates (PATCH by known ID) ──────────────────────────────────

const staticTemplates: Array<{ id: string; name: string; html: string }> = [
  {
    id: "92567770-8084-4ae2-ac05-d7cbc4b8ef3e",
    name: "Landlord Welcome",
    html: landlordWelcomeEmail(EXAMPLE_NAME),
  },
  {
    id: "baf60b41-f9c8-4ce5-9bed-14d1b1ca6d86",
    name: "Tenant Welcome",
    html: tenantWelcomeEmail(EXAMPLE_NAME),
  },
  {
    id: "8ec6e133-6799-4e94-8724-05fefec901d0",
    name: "Resource: Ontario Standard Lease",
    html: resourceDownloadEmail(EXAMPLE_NAME, "ontario-standard-lease", RESOURCE_TITLES["ontario-standard-lease"], FILE_URLS["ontario-standard-lease"]).html,
  },
  {
    id: "e1aac6f1-67f9-4b7c-875e-bf830c0542ed",
    name: "Resource: Tenant Screening Checklist",
    html: resourceDownloadEmail(EXAMPLE_NAME, "tenant-screening-checklist", RESOURCE_TITLES["tenant-screening-checklist"], FILE_URLS["tenant-screening-checklist"]).html,
  },
  {
    id: "ad97128b-2766-4523-8621-7d53e3eb0f45",
    name: "Resource: Eviction Notices (N4, N5, N12)",
    html: resourceDownloadEmail(EXAMPLE_NAME, "eviction-notices", RESOURCE_TITLES["eviction-notices"], FILE_URLS["eviction-notices"]).html,
  },
  {
    id: "c43acace-d06d-4ae3-a09d-8c1122bcf040",
    name: "Resource: Property Inspection Checklist",
    html: resourceDownloadEmail(EXAMPLE_NAME, "property-inspection-checklist", RESOURCE_TITLES["property-inspection-checklist"], FILE_URLS["property-inspection-checklist"]).html,
  },
  {
    id: "5e913a96-9e0d-4236-ad0b-b1ce0a188c19",
    name: "Resource: Ontario Landlord Tax Guide",
    html: resourceDownloadEmail(EXAMPLE_NAME, "landlord-tax-guide", RESOURCE_TITLES["landlord-tax-guide"], FILE_URLS["landlord-tax-guide"]).html,
  },
  {
    id: "46061268-801c-44df-b7b8-874bcaeb59f8",
    name: "Resource: Rental Application Template",
    html: resourceDownloadEmail(EXAMPLE_NAME, "rental-application", RESOURCE_TITLES["rental-application"], FILE_URLS["rental-application"]).html,
  },
  {
    id: "f0731de7-595e-4c1d-8d0a-b5db5afd6ead",
    name: "Resource: Landlord Rights Guide",
    html: resourceDownloadEmail(EXAMPLE_NAME, "landlord-rights-guide", RESOURCE_TITLES["landlord-rights-guide"], FILE_URLS["landlord-rights-guide"]).html,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

async function patchTemplate(id: string, name: string, html: string): Promise<void> {
  const res = await fetch(`https://api.resend.com/templates/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ html }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✓ ${name}`);
  } else {
    console.error(`✗ ${name}:`, data);
  }
}

async function findTemplateByName(name: string): Promise<string | null> {
  const res = await fetch("https://api.resend.com/templates", {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  });
  if (!res.ok) return null;
  const data = await res.json() as { data?: Array<{ id: string; name: string }> };
  const found = (data.data ?? []).find(t => t.name === name);
  return found?.id ?? null;
}

async function upsertMonthlyOwnerReport(html: string): Promise<void> {
  const name = "Monthly Owner Report";
  const existingId = await findTemplateByName(name);

  if (existingId) {
    await patchTemplate(existingId, name, html);
    return;
  }

  // Template not found — create it
  const res = await fetch("https://api.resend.com/templates", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, html }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✓ ${name} (created)`);
  } else {
    console.error(`✗ ${name} (create failed):`, data);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const monthlyReportHtml = buildEmailHTML(mockBundle, mockNarrative, "Tina & Randy", false);

  console.log(`Updating ${staticTemplates.length} static Resend templates + Monthly Owner Report...\n`);

  for (const t of staticTemplates) {
    await patchTemplate(t.id, t.name, t.html);
    await sleep(300); // stay under 5 req/sec rate limit
  }

  await sleep(300);
  await upsertMonthlyOwnerReport(monthlyReportHtml);

  console.log("\nDone.");
}

main().catch(console.error);
