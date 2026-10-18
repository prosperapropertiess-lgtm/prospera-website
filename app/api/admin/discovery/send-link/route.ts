import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fitLinkEmail } from "@/lib/landlord-kit-email";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";

// POST /api/admin/discovery/send-link { name, email, phone?, sendEmail? }
// Creates a discovery row waiting on the landlord's answers and returns the fit link.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const sendEmail = body.sendEmail !== false;

  if (!name) return NextResponse.json({ error: "Landlord name is required" }, { status: 400 });
  if (sendEmail && !email) return NextResponse.json({ error: "Email is required to send the link" }, { status: 400 });

  const token = `fit-${randomBytes(9).toString("hex")}`;
  const url = `${BASE}/fit/${token}`;
  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("discovery_calls")
    .insert({
      landlord_name: name,
      landlord_email: email || null,
      landlord_phone: phone || null,
      source: "link",
      fit_token: token,
      fit_sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (sendEmail) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const sent = await resend.emails.send({
        from: "Ebin at Prospera <hello@prosperaproperties.co>",
        to: [email],
        cc: [process.env.EBIN_EMAIL ?? "prosperapropertiess@gmail.com"],
        subject: "A few quick questions about your property",
        html: fitLinkEmail(name, url),
      });
      if (sent.error) throw new Error(sent.error.message);
    } catch (err) {
      console.error("[discovery/send-link] email failed:", err);
      return NextResponse.json({ id: data.id, url, emailed: false, error: "Saved, but the email didn't send. Copy the link instead." }, { status: 207 });
    }
  }

  return NextResponse.json({ id: data.id, url, emailed: sendEmail });
}
