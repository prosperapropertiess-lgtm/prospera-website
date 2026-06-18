import { NextRequest, NextResponse } from "next/server";
import { getAgentFromRequest } from "@/lib/agent-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { agentFollowUpEmail } from "@/lib/emails";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const agent = await getAgentFromRequest(req);
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .select("id, tenant_name, tenant_email, agent_id, properties(address, city)")
    .eq("id", id)
    .eq("agent_id", agent.id) // ensure agent owns this application
    .maybeSingle();

  if (error || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const property = (application as unknown as { properties: { address: string; city: string } }).properties;
  const propertyAddress = property ? `${property.address}, ${property.city}` : "your property";

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const { error: emailErr } = await resend.emails.send({
    from: "Prospera Properties <hello@prosperaproperties.co>",
    replyTo: "prosperapropertiess@gmail.com",
    to: application.tenant_email,
    cc: ["prosperapropertiess@gmail.com"],
    subject: `Following up on your application — ${propertyAddress}`,
    html: agentFollowUpEmail({
      tenantName: application.tenant_name,
      propertyAddress,
      agentName: agent.name,
    }),
  });

  if (emailErr) {
    console.error("Follow-up email error:", emailErr);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
