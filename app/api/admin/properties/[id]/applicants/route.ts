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

  const { data: property } = await supabaseAdmin
    .from("properties")
    .select("address, city, price")
    .eq("id", id)
    .maybeSingle();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { data: applications, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id, tenant_name, tenant_email, tenant_phone,
      monthly_income, monthly_rent, employment_type,
      employer_name, employer_position,
      status, ai_score, ai_report, admin_notes, created_at,
      agents(name)
    `)
    .eq("property_id", id)
    .order("ai_score", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load applicants" }, { status: 500 });
  }

  return NextResponse.json({ property, applications: applications ?? [] });
}
