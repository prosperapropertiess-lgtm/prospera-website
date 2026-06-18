import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildEmailHTML, type ClaudeNarrative } from "@/lib/owner-report-email";
import type { OwnerBundle } from "@/lib/notion";

export const dynamic = "force-dynamic";

// Mock data matching Randy & Tina's demo setup
const mockBundle: OwnerBundle = {
  month: "June",
  year: 2026,
  owners: [
    { id: "1", name: "Tina Lahey", email: "homesbylah@gmail.com", phone: "519-555-0101", notes: "", propertyIds: ["p1"] },
    { id: "2", name: "Randy Lahey", email: "randy@gmail.com", phone: "519-555-0102", notes: "", propertyIds: ["p1"] },
  ],
  properties: [
    {
      property: {
        id: "p1", name: "27 Horton", address: "27 Horton Street",
        city: "St. Thomas", type: "Duplex", status: "Occupied",
        monthlyRent: 3100, bedrooms: 4, bathrooms: 2, notes: "",
      },
      tenants: [
        { id: "t1", name: "Mikayla Johnson", email: "mikayla@gmail.com", phone: "519-555-0201", propertyId: "p1", monthlyRent: 1650, securityDeposit: null, leaseStart: "2022-09-01", leaseEnd: "2027-08-31", status: "Active", notes: "" },
        { id: "t2", name: "Ben & Carol Martin", email: "ben@gmail.com", phone: "519-555-0202", propertyId: "p1", monthlyRent: 1450, securityDeposit: null, leaseStart: "2020-05-01", leaseEnd: "2026-11-30", status: "Active", notes: "" },
      ],
      rentCurrentMonth: [
        { id: "r1", entry: "Unit 1 — June 2026", propertyId: "p1", tenantId: "t1", month: "June", year: 2026, amountDue: 1650, amountPaid: 1650, datePaid: "2026-06-01", paymentStatus: "Paid", notes: "" },
        { id: "r2", entry: "Unit 2 — June 2026", propertyId: "p1", tenantId: "t2", month: "June", year: 2026, amountDue: 1450, amountPaid: 1450, datePaid: "2026-06-03", paymentStatus: "Paid", notes: "" },
      ],
      rentPreviousMonth: [],
      rentYTD: [
        { id: "y1", entry: "Unit 1 — Jan", propertyId: "p1", tenantId: "t1", month: "January", year: 2026, amountDue: 1650, amountPaid: 1650, datePaid: "2026-01-01", paymentStatus: "Paid", notes: "" },
        { id: "y2", entry: "Unit 2 — Jan", propertyId: "p1", tenantId: "t2", month: "January", year: 2026, amountDue: 1450, amountPaid: 1450, datePaid: "2026-01-03", paymentStatus: "Paid", notes: "" },
        { id: "y3", entry: "Unit 1 — Feb", propertyId: "p1", tenantId: "t1", month: "February", year: 2026, amountDue: 1650, amountPaid: 1650, datePaid: "2026-02-01", paymentStatus: "Paid", notes: "" },
        { id: "y4", entry: "Unit 2 — Feb", propertyId: "p1", tenantId: "t2", month: "February", year: 2026, amountDue: 1450, amountPaid: 1450, datePaid: "2026-02-03", paymentStatus: "Paid", notes: "" },
        { id: "y5", entry: "Unit 1 — Mar", propertyId: "p1", tenantId: "t1", month: "March", year: 2026, amountDue: 1650, amountPaid: 1650, datePaid: "2026-03-01", paymentStatus: "Paid", notes: "" },
        { id: "y6", entry: "Unit 2 — Mar", propertyId: "p1", tenantId: "t2", month: "March", year: 2026, amountDue: 1450, amountPaid: 1450, datePaid: "2026-03-03", paymentStatus: "Paid", notes: "" },
        { id: "y7", entry: "Unit 1 — Apr", propertyId: "p1", tenantId: "t1", month: "April", year: 2026, amountDue: 1650, amountPaid: 1650, datePaid: "2026-04-01", paymentStatus: "Paid", notes: "" },
        { id: "y8", entry: "Unit 2 — Apr", propertyId: "p1", tenantId: "t2", month: "April", year: 2026, amountDue: 1450, amountPaid: 1450, datePaid: "2026-04-03", paymentStatus: "Paid", notes: "" },
        { id: "y9", entry: "Unit 1 — May", propertyId: "p1", tenantId: "t1", month: "May", year: 2026, amountDue: 1650, amountPaid: 1650, datePaid: "2026-05-01", paymentStatus: "Paid", notes: "" },
        { id: "y10", entry: "Unit 2 — May", propertyId: "p1", tenantId: "t2", month: "May", year: 2026, amountDue: 1450, amountPaid: 1450, datePaid: "2026-05-03", paymentStatus: "Paid", notes: "" },
        { id: "r1", entry: "Unit 1 — June 2026", propertyId: "p1", tenantId: "t1", month: "June", year: 2026, amountDue: 1650, amountPaid: 1650, datePaid: "2026-06-01", paymentStatus: "Paid", notes: "" },
        { id: "r2", entry: "Unit 2 — June 2026", propertyId: "p1", tenantId: "t2", month: "June", year: 2026, amountDue: 1450, amountPaid: 1450, datePaid: "2026-06-03", paymentStatus: "Paid", notes: "" },
      ],
      maintenanceOpen: [],
      maintenanceCompletedRecent: [
        { id: "m1", issue: "Furnace filter replacement", propertyId: "p1", category: "HVAC", priority: "Low", status: "Done", reportedBy: "Ebin", dateReported: "2026-05-20", dateCompleted: "2026-05-22", cost: 45, notes: "", daysPending: null },
      ],
      expensesCurrentMonth: [
        { id: "e1", description: "Monthly management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2026-06-01" },
        { id: "e2", description: "Water bill", propertyId: "p1", amount: 112, category: "Utilities", date: "2026-06-05" },
      ],
      expensesPreviousMonth: [],
      expensesYTD: [
        { id: "e3", description: "Jan management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2026-01-01" },
        { id: "e4", description: "Feb management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2026-02-01" },
        { id: "e5", description: "Mar management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2026-03-01" },
        { id: "e6", description: "Apr management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2026-04-01" },
        { id: "e7", description: "May management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2026-05-01" },
        { id: "e8", description: "May water bill", propertyId: "p1", amount: 98, category: "Utilities", date: "2026-05-05" },
        { id: "e1", description: "Monthly management fee", propertyId: "p1", amount: 248, category: "Management Fee", date: "2026-06-01" },
        { id: "e2", description: "Water bill", propertyId: "p1", amount: 112, category: "Utilities", date: "2026-06-05" },
      ],
    },
  ],
};

const mockNarrative: ClaudeNarrative = {
  subject: "27 Horton Street — June 2026 Monthly Update from Prospera Properties",
  openingSentence: "June was another clean month — both units paid on time, maintenance is clear, and your portfolio is running exactly as it should.",
  lookingAhead: [
    { title: "Summer Check-In", description: "We'll be doing a routine walkthrough in July to check on the deck and HVAC before the heat picks up." },
    { title: "Lease Renewal — Unit 2", description: "Ben & Carol's lease expires November 30. We'll reach out in September to start the renewal conversation." },
  ],
  criticalAlert: null,
  closingNote: "As always, feel free to reply to this email or call me directly — happy to walk through anything.",
  joke: "Why did the property manager bring a ladder to the budget meeting? Because the returns were through the roof!",
};

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? "ebinjaison02@gmail.com";

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = buildEmailHTML(mockBundle, mockNarrative, "Randy & Tina Lahey", false, "demo-randy-tina");

  const { error } = await resend.emails.send({
    from: "Prospera Reports <hello@prosperaproperties.co>",
    to: [to],
    subject: `[TEST] ${mockNarrative.subject}`,
    html,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ sent: true, to });
}
