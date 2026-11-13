import { viewingFormAnswers } from "@/lib/application-screening";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";



async function isAuthenticated(req: NextRequest) {
  return isAdminAuthenticated(req);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id,
      stage, doc_option, viewing_request_id, owner_name, owner_email, owner_sent_at, owner_decided_at, owner_note,
      rent_amount_due, rent_reference, rent_etransfer_to, rent_requested_at, rent_received_at, singlekey_done_at, move_in_started_at,
      tenant_name,
      tenant_email,
      tenant_phone,
      tenant_dob,
      current_address,
      employer_name,
      employer_position,
      monthly_income,
      employment_start,
      employment_type,
      landlord_ref_name,
      landlord_ref_phone,
      landlord_ref_email,
      employer_ref_name,
      employer_ref_phone,
      employer_ref_email,
      monthly_rent,
      status,
      ai_score,
      ai_report,
      ai_summary,
      ai_error,
      ai_completed_at,
      ocr_data,
      admin_notes,
      property_id,
      income_source,
      income_notes,
      move_in_date,
      occupants,
      co_applicants,
      pets,
      smokes,
      vehicles,
      time_at_address,
      current_rent,
      reason_for_moving,
      consent_at,
      created_at,
      updated_at,
      properties(address, city, price),
      agents(name, email)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Fetch documents and generate fresh 1-hour signed URLs
  const { data: docs } = await supabaseAdmin
    .from("application_documents")
    .select("id, doc_type, storage_path, created_at")
    .eq("application_id", id);

  const docsWithUrls = await Promise.all(
    (docs ?? []).map(async (doc) => {
      const { data } = await supabaseAdmin.storage
        .from("applications")
        .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour
      return { ...doc, signed_url: data?.signedUrl ?? null };
    })
  );

  // Everyone else who applied for the same unit, so Ebin can compare.
  const { data: others } = await supabaseAdmin
    .from("applications")
    .select("id, tenant_name, ai_score, status, created_at")
    .eq("property_id", application.property_id)
    .neq("id", id)
    .order("ai_score", { ascending: false, nullsFirst: false });

  const viewing_form = await viewingFormAnswers((application as { viewing_request_id?: string | null }).viewing_request_id ?? null);
  return NextResponse.json({ ...application, documents: docsWithUrls, other_applicants: others ?? [], viewing_form });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { admin_notes: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("applications")
    .update({ admin_notes: body.admin_notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
