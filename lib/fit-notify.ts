import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SKIP = new Set(["id", "fit_token", "fit_sent_at", "fit_submitted_at", "created_at", "updated_at", "outcome", "source", "onboarding_token"]);
const label = (k: string) => k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// Tell Ebin a landlord finished the fit form, with every answer in the email so
// it can be read and decided on from Gmail. Resend returns { error } instead of
// throwing, so the result is checked and logged; the caller never fails because of it.
export async function notifyFitSubmitted(callId: string, landlordName: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: call } = await getSupabaseAdmin().from("discovery_calls").select("*").eq("id", callId).single();
    const rows = Object.entries(call ?? {})
      .filter(([k, v]) => !SKIP.has(k) && v !== null && v !== "" && !(Array.isArray(v) && !v.length))
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;">${esc(label(k))}</td><td style="padding:4px 0;">${esc(typeof v === "object" ? JSON.stringify(v) : String(v))}</td></tr>`)
      .join("");

    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.EBIN_EMAIL ?? "prosperapropertiess@gmail.com";
    const { data, error } = await resend.emails.send({
      from: "Ebin at Prospera <hello@prosperaproperties.co>",
      to: [to],
      subject: `${landlordName} filled in the fit form`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;">
             <p>${esc(landlordName)} submitted their property details.</p>
             <table style="border-collapse:collapse;font-size:14px;">${rows}</table>
             <p style="margin-top:20px;">Good fit? <a href="${BASE}/admin/onboard/new" style="font-weight:bold;">Add them as a landlord →</a></p></div>`,
    });
    if (error) {
      console.error("[fit] notify email rejected by Resend:", JSON.stringify(error), "to:", to);
      return { ok: false, error: error.message };
    }
    console.log("[fit] notify email sent", data?.id, "to:", to);
    return { ok: true };
  } catch (err) {
    console.error("[fit] notify email threw:", err);
    return { ok: false, error: String(err) };
  }
}
