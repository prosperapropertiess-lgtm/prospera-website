import { supabaseAdmin } from "@/lib/supabase";
import { applicationApprovedTenantEmail, applicationRejectedTenantEmail, applicationStatusAgentEmail } from "@/lib/emails";

export type DecisionResult =
  | { ok: true; alreadyDone?: boolean }
  | { ok: false; error: string; status: number };

/**
 * Approves or rejects an application — the actual DB update + notification
 * emails. Shared by the admin-session-gated POST routes (the admin UI
 * buttons) and the token-authenticated quick-action GET route (one-tap from
 * the review email) so there's exactly one place this logic lives.
 */
export async function decideApplication(id: string, decision: "approved" | "rejected"): Promise<DecisionResult> {
  const { data: application, error: fetchErr } = await supabaseAdmin
    .from("applications")
    .select("id, tenant_name, tenant_email, status, property_id, agent_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !application) {
    return { ok: false, error: "Application not found", status: 404 };
  }

  if (application.status === decision) {
    return { ok: true, alreadyDone: true };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("applications")
    .update({ status: decision, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateErr) {
    return { ok: false, error: "Failed to update status", status: 500 };
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

    resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: application.tenant_email,
      cc: ["prosperapropertiess@gmail.com"],
      subject: decision === "approved"
        ? `Your application has been approved — ${propertyAddress}`
        : `Application update — ${propertyAddress}`,
      html: decision === "approved"
        ? applicationApprovedTenantEmail({ tenantName: application.tenant_name, propertyAddress })
        : applicationRejectedTenantEmail({ tenantName: application.tenant_name, propertyAddress }),
    }).catch((err: unknown) => console.error(`[decideApplication:${decision}] Tenant email failed:`, err));

    if (agentResult.data) {
      resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: agentResult.data.email,
        subject: decision === "approved" ? `Application approved — ${application.tenant_name}` : `Application update — ${application.tenant_name}`,
        html: applicationStatusAgentEmail({
          agentName: agentResult.data.name,
          tenantName: application.tenant_name,
          propertyAddress,
          status: decision,
          applicationId: id,
        }),
      }).catch((err: unknown) => console.error(`[decideApplication:${decision}] Agent email failed:`, err));
    }
  }

  return { ok: true };
}
