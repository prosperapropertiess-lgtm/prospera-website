import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAuthenticated(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "authenticated";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id,
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
      ocr_data,
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

  return NextResponse.json({ ...application, documents: docsWithUrls });
}
