/**
 * POST /api/admin/leasing/properties/[id]/closeout — compose & send the
 * placement-complete report to the owner, modeled on the real closeout
 * email Ebin sends today. Reads move_in_data (saved via the standard
 * PATCH on /properties/[id] beforehand) plus channels/showings/the
 * approved application, and marks the campaign CLOSED.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { ownerPlacementCloseoutEmail, type CloseoutTenant } from "@/lib/emails";

const resend = new Resend(process.env.RESEND_API_KEY);

const MOVE_IN_ITEM_LABELS: Record<string, string> = {
  lease_signed: "Lease agreement signed",
  move_in_inspection: "Move-in inspection completed",
  utilities_transferred: "Utilities account transferred to the tenant's name",
  first_month_rent_collected: "First month's rent collected",
  walkthrough_completed: "Walk-through completed with tenant",
  garbage_instructions_provided: "Garbage disposal instructions provided",
  rent_instructions_provided: "Rent and e-transfer instructions provided to the tenant",
  keys_handed_over: "Keys handed over",
  lockbox_removed: "Lock-box removed",
};

const DOCUMENT_LABELS: Record<string, string> = {
  doc_gov_id: "Government tenant ID verification",
  doc_emergency_contact: "Emergency contact details",
  doc_contact_info: "Full contact information",
  doc_screening_report: "Tenant screening / report",
  doc_signed_lease: "Signed lease agreement",
  doc_receipt: "Receipt showing all the numbers",
  doc_n_forms: "Applicable N forms",
  doc_utilities_screenshot: "Screenshot of the utilities transfer",
  doc_inspection_report: "Full inspection report",
  doc_move_in_photos: "Condition of the unit post move-in photos",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();

  const { data: lp, error } = await db
    .from("leasing_properties")
    .select(`
      *,
      property:properties(title, address),
      showings:leasing_showings(*),
      channels:leasing_channels(*)
    `)
    .eq("id", id)
    .single();

  if (error || !lp) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (!lp.owner_email) return NextResponse.json({ error: "Set the owner's email on the Overview tab first" }, { status: 400 });

  const { data: applications } = await db
    .from("leasing_applications")
    .select("*")
    .eq("campaign_id", id)
    .eq("stage", "APPROVED")
    .order("decision_at", { ascending: false })
    .limit(1);
  const approved = applications?.[0] ?? null;

  const md = (lp.move_in_data ?? {}) as Record<string, unknown>;
  type ShowingRow = {
    status: string; interested: boolean | null; main_objection: string | null;
    feedback_price: string | null; feedback_size: string | null; feedback_condition: string | null;
    feedback_laundry: boolean; feedback_parking: boolean; feedback_location: boolean;
    feedback_layout: boolean; feedback_utilities: boolean;
  };
  const showings = (lp.showings ?? []) as ShowingRow[];
  const channels = (lp.channels ?? []) as { views_total: number }[];

  // Aggregate unique market feedback across all showings
  const feedbackSet = new Set<string>();
  for (const s of showings) {
    if (s.main_objection) feedbackSet.add(s.main_objection);
    if (s.feedback_price === "too_high") feedbackSet.add("Price perceived as too high");
    if (s.feedback_size === "too_small") feedbackSet.add("Smaller room sizes compared to competing listings");
    if (s.feedback_condition) feedbackSet.add(`Condition: ${s.feedback_condition}`);
    if (s.feedback_laundry) feedbackSet.add("No in-unit laundry");
    if (s.feedback_parking) feedbackSet.add("Parking a concern");
    if (s.feedback_location) feedbackSet.add("Location a concern");
    if (s.feedback_layout) feedbackSet.add("Layout a concern");
    if (s.feedback_utilities) feedbackSet.add("Utilities a concern");
  }

  const finalizedItems = Object.entries(MOVE_IN_ITEM_LABELS)
    .filter(([key]) => md[key])
    .map(([, label]) => label);
  if (md.additional_finalized_note) finalizedItems.push(String(md.additional_finalized_note));

  const documentTypes = Object.entries(DOCUMENT_LABELS)
    .filter(([key]) => md[key])
    .map(([, label]) => label);

  const rentCollected = md.rent_collected ? Number(md.rent_collected) : null;
  const placementFee = md.placement_fee ? Number(md.placement_fee) : null;
  const financialLine = rentCollected !== null && placementFee !== null
    ? `$${rentCollected.toLocaleString()} - $${placementFee.toLocaleString()} = $${(rentCollected - placementFee).toLocaleString()} has been e-transferred to ${(md.rent_destination_email as string) || lp.owner_email}`
    : null;

  const tenants: CloseoutTenant[] = [];
  if (approved) {
    tenants.push({
      name: approved.legal_name || "Tenant",
      phone: approved.phone || undefined,
      email: approved.email || undefined,
      emergencyContactName: approved.emergency_contact_name || undefined,
      emergencyContactPhone: approved.emergency_contact_phone || undefined,
    });
    const coTenants = (approved.co_tenants ?? []) as CloseoutTenant[];
    for (const t of coTenants) {
      if (t.name) tenants.push(t);
    }
  }

  const propertyAddress = (lp.property as { title?: string; address?: string } | null)?.address
    ?? (lp.property as { title?: string; address?: string } | null)?.title
    ?? "your property";

  try {
    await resend.emails.send({
      from: "Ebin | Prospera Properties <hello@prosperaproperties.co>",
      to: lp.owner_email,
      cc: ["prosperapropertiess@gmail.com"],
      subject: `Tenant placement complete — ${propertyAddress}`,
      html: ownerPlacementCloseoutEmail({
        ownerName: lp.owner_name || "there",
        propertyAddress,
        totalViews: channels.reduce((s, c) => s + (c.views_total ?? 0), 0),
        showingsCount: showings.length,
        marketFeedback: Array.from(feedbackSet),
        initialPrice: lp.asking_rent,
        finalRent: lp.final_rent ?? lp.asking_rent,
        marketContextNote: (md.market_context_note as string) || undefined,
        finalizedItems,
        financialLine: financialLine ?? undefined,
        documentTypes,
        documentsUrl: (md.documents_url as string) || undefined,
        tenants,
        depositAmount: md.deposit_amount ? Number(md.deposit_amount) : undefined,
        depositSendDate: (md.deposit_send_date as string) || undefined,
        rentDestinationEmail: (md.rent_destination_email as string) || lp.owner_email,
        additionalNextSteps: (md.additional_next_steps as string) || undefined,
      }),
    });
  } catch (emailErr) {
    console.error("Closeout email failed:", emailErr);
    return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
  }

  const closedAt = new Date().toISOString();
  await db.from("leasing_properties").update({
    stage: "CLOSED",
    stage_closed_at: closedAt,
    outcome: "placed",
    final_rent: lp.final_rent ?? lp.asking_rent,
    move_in_data: { ...md, closeout_sent_at: closedAt },
  }).eq("id", id);

  await db.from("leasing_events").insert({
    campaign_id: id,
    event_type: "CLOSEOUT_SENT",
    actor: "Admin",
  });

  return NextResponse.json({ ok: true, sent_at: closedAt });
}
