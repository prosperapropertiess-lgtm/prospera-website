import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { applicationRejectedTenantEmail } from "@/lib/emails";

function isAuthenticated(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "authenticated";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: application, error: fetchErr } = await supabaseAdmin
    .from("applications")
    .select("id, tenant_name, tenant_email, status, property_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.status === "rejected") {
    return NextResponse.json({ error: "Already rejected" }, { status: 409 });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("applications")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

  // Email tenant
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const { data: property } = await supabaseAdmin
      .from("properties")
      .select("address, city")
      .eq("id", application.property_id)
      .maybeSingle();

    const propertyAddress = property
      ? `${property.address}, ${property.city}`
      : "the property";

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: application.tenant_email,
      subject: `Application update — ${propertyAddress}`,
      html: applicationRejectedTenantEmail({
        tenantName: application.tenant_name,
        propertyAddress,
      }),
    }).catch((err: unknown) => console.error("[applications/reject] Tenant email failed:", err));
  }

  return NextResponse.json({ success: true });
}
