import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { applicationApprovedTenantEmail, applicationStatusAgentEmail } from "@/lib/emails";
import { isAdminAuthenticated } from "@/lib/admin-auth";



async function isAuthenticated(req: NextRequest) {
  return isAdminAuthenticated(req);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: application, error: fetchErr } = await supabaseAdmin
    .from("applications")
    .select("id, tenant_name, tenant_email, status, property_id, agent_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.status === "approved") {
    return NextResponse.json({ error: "Already approved" }, { status: 409 });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("applications")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const [propertyResult, agentResult] = await Promise.all([
      supabaseAdmin.from("properties").select("address, city").eq("id", application.property_id).maybeSingle(),
      supabaseAdmin.from("agents").select("name, email").eq("id", application.agent_id).maybeSingle(),
    ]);

    const propertyAddress = propertyResult.data
      ? `${propertyResult.data.address}, ${propertyResult.data.city}`
      : "the property";

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    // Email tenant
    resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: application.tenant_email,
      cc: ["prosperapropertiess@gmail.com"],
      subject: `Your application has been approved — ${propertyAddress}`,
      html: applicationApprovedTenantEmail({ tenantName: application.tenant_name, propertyAddress }),
    }).catch((err: unknown) => console.error("[approve] Tenant email failed:", err));

    // Email agent
    if (agentResult.data) {
      resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: agentResult.data.email,
        subject: `Application approved — ${application.tenant_name}`,
        html: applicationStatusAgentEmail({
          agentName: agentResult.data.name,
          tenantName: application.tenant_name,
          propertyAddress,
          status: "approved",
          applicationId: id,
        }),
      }).catch((err: unknown) => console.error("[approve] Agent email failed:", err));
    }
  }

  return NextResponse.json({ success: true });
}
