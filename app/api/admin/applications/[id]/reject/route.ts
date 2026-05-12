import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { applicationRejectedTenantEmail, applicationStatusAgentEmail } from "@/lib/emails";

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
    .select("id, tenant_name, tenant_email, status, property_id, agent_id")
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
      subject: `Application update — ${propertyAddress}`,
      html: applicationRejectedTenantEmail({ tenantName: application.tenant_name, propertyAddress }),
    }).catch((err: unknown) => console.error("[reject] Tenant email failed:", err));

    // Email agent
    if (agentResult.data) {
      resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: agentResult.data.email,
        subject: `Application update — ${application.tenant_name}`,
        html: applicationStatusAgentEmail({
          agentName: agentResult.data.name,
          tenantName: application.tenant_name,
          propertyAddress,
          status: "rejected",
          applicationId: id,
        }),
      }).catch((err: unknown) => console.error("[reject] Agent email failed:", err));
    }
  }

  return NextResponse.json({ success: true });
}
