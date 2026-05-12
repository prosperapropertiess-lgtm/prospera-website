import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { agentFollowUpEmail } from "@/lib/emails";

// Runs every 6 hours via Vercel cron
// Sends a follow-up email to tenants whose applications have been
// pending/processing for 48+ hours with no follow-up sent yet

export async function GET(req: NextRequest) {
  // Verify cron secret so this can't be triggered publicly
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Applications pending/processing for 48h+ with no follow-up sent
  const { data: applications, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id, tenant_name, tenant_email, agent_id,
      property_id, created_at, last_followup_at,
      agents(name, email),
      properties(address, city)
    `)
    .in("status", ["pending", "processing"])
    .lt("created_at", cutoff)
    .is("last_followup_at", null);

  if (error) {
    console.error("[cron/followup] Query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  if (!applications?.length) {
    return NextResponse.json({ sent: 0, message: "No applications need follow-up" });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  let sent = 0;

  for (const app of applications) {
    const agent = (app as unknown as { agents: { name: string; email: string } | null }).agents;
    const property = (app as unknown as { properties: { address: string; city: string } | null }).properties;
    if (!agent || !property) continue;

    const propertyAddress = `${property.address}, ${property.city}`;

    try {
      await resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: app.tenant_email,
        subject: `Following up on your application — ${propertyAddress}`,
        html: agentFollowUpEmail({
          tenantName: app.tenant_name,
          propertyAddress,
          agentName: agent.name,
        }),
      });

      await supabaseAdmin
        .from("applications")
        .update({ last_followup_at: new Date().toISOString() })
        .eq("id", app.id);

      sent++;
    } catch (err) {
      console.error(`[cron/followup] Failed for application ${app.id}:`, err);
    }
  }

  return NextResponse.json({ sent, total: applications.length });
}
