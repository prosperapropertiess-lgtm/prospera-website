import { getSupabaseAdmin } from "@/lib/supabase";
import { applicationInviteEmail } from "@/lib/emails";

export interface SendInviteResult {
  applyUrl: string;
  agentId: string;
  propertyAddress: string;
}

/**
 * Sends a branded "start your application" email to a prospective tenant,
 * linking straight into the existing /apply/[agentId]/[propertyId] flow.
 * Shared by the admin "send application link" button and the agent-facing
 * API (so Muse/ChatGPT can trigger the same thing on request) — one place
 * for the actual logic, two ways in.
 */
export async function sendApplicationInvite(
  propertyId: string,
  tenantName: string,
  tenantEmail: string
): Promise<SendInviteResult> {
  const supabase = getSupabaseAdmin();

  const { data: property } = await supabase
    .from("properties")
    .select("id, address, city, price, is_managed, available")
    .eq("id", propertyId)
    .maybeSingle();
  if (!property) throw new Error("Property not found");
  if (!property.is_managed || !property.available) {
    throw new Error("This property isn't set up to accept applications right now (is_managed/available must both be true)");
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id, name")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (!agent) throw new Error("No active agent found to attach this application link to");

  const applyUrl = `https://www.prosperaproperties.co/apply/${agent.id}/${property.id}`;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY not configured");

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);
  const { error: sendErr } = await resend.emails.send({
    from: "Prospera Properties <hello@prosperaproperties.co>",
    to: tenantEmail,
    subject: `Your application for ${property.address} is ready`,
    html: applicationInviteEmail({
      tenantName,
      propertyAddress: property.address,
      propertyCity: property.city,
      price: property.price,
      applyUrl,
    }),
  });
  if (sendErr) throw new Error(`Email failed to send: ${sendErr.message}`);

  return { applyUrl, agentId: agent.id, propertyAddress: property.address };
}
