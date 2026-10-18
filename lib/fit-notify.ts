import { Resend } from "resend";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Tell Ebin a landlord finished the fit form. Resend returns { error } instead of throwing,
// so the result is checked and logged; the caller never fails because of a notification.
export async function notifyFitSubmitted(callId: string, landlordName: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.EBIN_EMAIL ?? "prosperapropertiess@gmail.com";
    const { data, error } = await resend.emails.send({
      from: "Ebin at Prospera <hello@prosperaproperties.co>",
      to: [to],
      subject: `${landlordName} filled in the fit form`,
      html: `<p style="font-family:Arial,sans-serif;font-size:16px;">${esc(landlordName)} submitted their property details.</p>
             <p><a href="${BASE}/admin/discovery/review/${callId}" style="font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Review and decide →</a></p>`,
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
