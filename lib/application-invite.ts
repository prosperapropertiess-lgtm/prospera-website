import { getSupabaseAdmin } from "@/lib/supabase";
import { signId, verifyId } from "@/lib/fieldops/engine";
import { thankYouApplyEmail } from "@/lib/application-emails";

const SITE = "https://www.prosperaproperties.co";

export interface SendInviteResult {
  applyUrl: string;
  agentId: string;
  propertyAddress: string;
  inviteId: string;
}

export interface InviteOptions {
  phone?: string | null;
  viewingRequestId?: string | null;
  appointmentId?: string | null;
  sentBy?: string;          // "admin" or an agent id
  senderName?: string;      // who signs the thank-you
}

export const applyLink = (inviteId: string) => `${SITE}/apply/i/${signId("apply", inviteId)}`;
export const inviteIdFromToken = (token: string) => verifyId("apply", token);

/** The application owner (agent) applications are filed under: the active non-specialist agent. */
export async function applicationAgentId(): Promise<string> {
  const { data } = await getSupabaseAdmin().from("agents").select("id, role").eq("is_active", true);
  const agent = (data ?? []).find((a) => a.role !== "specialist") ?? data?.[0];
  if (!agent) throw new Error("No active agent found to attach this application to");
  return agent.id;
}

/**
 * Sends the branded after-viewing thank-you with a personal application link.
 * One place for every way in: the viewings manager, a showing specialist's
 * button, FieldOps after a completed showing, and the API for assistants.
 * The link knows who it's for, so the form skips what the viewing form already asked.
 */
export async function sendApplicationInvite(
  propertyId: string,
  tenantName: string,
  tenantEmail: string,
  opts: InviteOptions = {},
): Promise<SendInviteResult> {
  const db = getSupabaseAdmin();
  const email = tenantEmail.trim().toLowerCase();

  const { data: property, error: propErr } = await db
    .from("properties")
    .select("id, slug, address, city, price, images, is_managed, available, status")
    .eq("id", propertyId)
    .maybeSingle();
  if (propErr) throw new Error(`Property lookup failed: ${propErr.message}`);
  if (!property) throw new Error("Property not found");
  if (!property.is_managed || !property.available) {
    throw new Error("This home isn't open for applications right now (it must be managed and available).");
  }

  // Use their viewing request if we know it, or the latest one with this email.
  let viewingRequestId = opts.viewingRequestId ?? null;
  if (!viewingRequestId) {
    const { data: vr } = await db.from("viewing_requests").select("id").ilike("email", email).order("created_at", { ascending: false }).limit(1).maybeSingle();
    viewingRequestId = vr?.id ?? null;
  }

  const agentId = await applicationAgentId();
  const { data: invite, error: invErr } = await db.from("application_invites").insert({
    property_id: property.id, viewing_request_id: viewingRequestId, appointment_id: opts.appointmentId ?? null,
    name: tenantName.trim(), email, phone: opts.phone ?? null, sent_by: opts.sentBy ?? "admin", sender_name: opts.senderName ?? "Ebin",
  }).select("id").single();
  if (invErr || !invite) throw new Error(`Couldn't create the application link: ${invErr?.message}`);

  const applyUrl = applyLink(invite.id);
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY not configured");

  const { subject, html } = thankYouApplyEmail({
    first: tenantName.trim().split(/\s+/)[0] || "there",
    address: property.address, city: property.city, price: Number(property.price),
    image: (property.images as string[] | null)?.[0] ?? null,
    applyUrl,
    briefUrl: property.status === "published" ? `${SITE}/brief/${property.slug ?? property.id}` : null,
    senderName: opts.senderName ?? "Ebin",
    known: !!viewingRequestId,
  });

  const { Resend } = await import("resend");
  const { error: sendErr } = await new Resend(resendKey).emails.send({
    from: "Prospera Properties <hello@prosperaproperties.co>",
    replyTo: "prosperapropertiess@gmail.com",
    to: email,
    subject,
    html,
  });
  if (sendErr) {
    console.error("[sendApplicationInvite] Resend error:", JSON.stringify(sendErr));
    throw new Error(`Email failed to send: ${sendErr.message}`);
  }

  return { applyUrl, agentId, propertyAddress: property.address, inviteId: invite.id };
}

/** What the personalized form needs: the invite, the home, and what the viewing form already told us. */
export async function loadInvite(token: string) {
  const id = inviteIdFromToken(token);
  if (!id) return null;
  const db = getSupabaseAdmin();
  const { data: invite } = await db.from("application_invites").select("*").eq("id", id).maybeSingle();
  if (!invite) return null;
  const [{ data: property }, { data: vr }] = await Promise.all([
    db.from("properties").select("id, address, city, price, bedrooms, bathrooms, utilities_included, available_date, images, available, is_managed").eq("id", invite.property_id).maybeSingle(),
    invite.viewing_request_id
      ? db.from("viewing_requests").select("full_name, phone, email, move_in_date, occupants, income_range, credit_range, answers").eq("id", invite.viewing_request_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (!invite.opened_at) await db.from("application_invites").update({ opened_at: new Date().toISOString() }).eq("id", id);
  return { invite, property, viewing: vr as null | { full_name: string; phone: string; email: string | null; move_in_date: string | null; occupants: number | null; income_range: string | null; credit_range: string | null; answers: Record<string, string> } };
}
