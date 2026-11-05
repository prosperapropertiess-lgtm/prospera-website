import { getSupabaseAdmin } from "@/lib/supabase";
import type { Answers, PublicHome } from "@/lib/viewing-requests";

export const RENTMATCH_CONSENT_TEXT =
  "Yes, send me other homes that fit what I told you. I can ask to be removed any time.";

/**
 * Adds the person behind a viewing request to the RentMatch pool (rental_profiles).
 * Only call this after they said yes themselves. Safe to call twice.
 */
export async function joinRentMatch(requestId: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { data: r } = await sb.from("viewing_requests")
    .select("id, full_name, phone, email, move_in_date, occupants, answers, property_snapshot")
    .eq("id", requestId).maybeSingle();
  if (!r) return false;

  const sessionId = `view-${r.id}`;
  const { data: existing } = await sb.from("rental_profiles").select("id").eq("session_id", sessionId).maybeSingle();
  if (!existing) {
    const a = (r.answers ?? {}) as Answers;
    const h = r.property_snapshot as PublicHome;
    const [first, ...rest] = String(r.full_name).split(/\s+/);
    const { error } = await sb.from("rental_profiles").insert({
      source: "/view",
      first_name: first,
      last_name: rest.join(" ") || null,
      email: r.email,
      phone: r.phone,
      move_timing: `Move-in ${r.move_in_date}`,
      household_size: r.occupants,
      current_situation: a.living ?? null,
      pets_note: a.pet_details ?? null,
      notes: `From a viewing request for ${h.address} ($${h.price}/mo, ${h.bedrooms ?? "?"} bed). Agreed: "${RENTMATCH_CONSENT_TEXT}"`,
      marketing_consent: true,
      completed: true,
      completed_at: new Date().toISOString(),
      session_id: sessionId,
      last_step: "complete",
    });
    if (error) { console.error("[rentmatch] insert failed", error); return false; }
  }
  await sb.from("viewing_requests").update({ rentmatch_opt_in: true, updated_at: new Date().toISOString() }).eq("id", r.id);
  return true;
}
