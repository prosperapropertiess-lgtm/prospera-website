import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    property_id, full_name, email, phone,
    move_in_date, num_occupants, rent_ok,
    docs_agreed, outcome, late_movein,
  } = body;

  if (!property_id || !full_name || !email || !phone) {
    return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch property details for emails
  const { data: property } = await supabase
    .from("properties")
    .select("id, title, address, city, price, bedrooms, bathrooms, available_date, max_occupants, inquiry_count, pet_friendly")
    .eq("id", property_id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Map outcome to status
  const status = outcome === "qualified" ? "approved"
    : outcome === "waitlist" ? "pending"
    : "rejected";

  // ── Scoring ───────────────────────────────────────────────
  const scoreBreakdown: Record<string, number> = {};
  let score = 0;

  // Move-in match: +20 if date matches or is before available date
  if (!late_movein && move_in_date) {
    scoreBreakdown.movein_match = 20;
    score += 20;
  } else if (late_movein) {
    scoreBreakdown.movein_match = 5; // still some points for being interested
    score += 5;
  }

  // Rent OK: +25
  if (rent_ok) {
    scoreBreakdown.rent_ok = 25;
    score += 25;
  }

  // Docs ready: +20
  if (docs_agreed) {
    scoreBreakdown.docs_ready = 20;
    score += 20;
  }

  // Occupants fit: +10 if within max_occupants (if set)
  const maxOcc = property.max_occupants as number | null;
  if (!maxOcc || (num_occupants && Number(num_occupants) <= maxOcc)) {
    scoreBreakdown.occupants_ok = 10;
    score += 10;
  }

  // Contact completeness: +10 (they provided all fields)
  if (full_name && email && phone) {
    scoreBreakdown.contact_complete = 10;
    score += 10;
  }

  // Early applicant bonus: +15 (first 5 prequalifications get a boost)
  const { count: existingCount } = await supabase
    .from("prequalifications")
    .select("id", { count: "exact", head: true })
    .eq("property_id", property_id);
  if ((existingCount || 0) < 5) {
    scoreBreakdown.early_applicant = 15;
    score += 15;
  }

  // Insert prequalification with score
  const { data, error } = await supabase.from("prequalifications").insert([{
    property_id,
    full_name,
    email,
    phone,
    move_in_date: move_in_date || null,
    num_occupants: num_occupants ? Number(num_occupants) : 1,
    status,
    rent_ok,
    docs_agreed,
    late_movein,
    outcome,
    score,
    score_breakdown: scoreBreakdown,
    source: "website",
  }]).select().single();

  if (error) {
    console.error("Prequalification insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment inquiry count on property
  await supabase
    .from("properties")
    .update({ inquiry_count: ((property.inquiry_count as number) || 0) + 1 })
    .eq("id", property_id);

  // Send emails (non-blocking)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && data) {
    (async () => {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const propertyLine = `${property.title || property.address} — ${property.city}`;
        const listingUrl = `https://www.prosperaproperties.co/listings/${property.id}`;
        const availStr = property.available_date
          ? new Date(property.available_date).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })
          : null;

        // 1. Email to tenant
        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: email,
          subject: outcome === "qualified"
            ? `You're pre-qualified — ${property.address}, ${property.city}`
            : outcome === "waitlist"
              ? `You're on our list — ${property.address}, ${property.city}`
              : `Thanks for your interest — Prospera Properties`,
          html: tenantEmail(full_name.split(" ")[0], propertyLine, listingUrl, outcome, availStr),
        }).catch((err: unknown) => console.error("[prequal] Tenant email failed:", err));

        // 2. Email to company + agents
        const { data: agents } = await supabase
          .from("agents")
          .select("email")
          .eq("is_active", true);

        const agentEmails = (agents || []).map((a: { email: string }) => a.email);

        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          cc: agentEmails,
          subject: `[${outcome?.toUpperCase()}] ${full_name} — ${property.address}`,
          html: adminEmail(full_name, email, phone, propertyLine, {
            move_in_date, num_occupants, rent_ok, docs_agreed, late_movein, outcome,
            available_date: availStr,
          }, listingUrl),
        }).catch((err: unknown) => console.error("[prequal] Admin email failed:", err));

      } catch (err) {
        console.error("[prequal] Email batch failed:", err);
      }
    })();
  }

  return NextResponse.json({ id: data.id, status, outcome }, { status: 201 });
}

// ── Tenant Email ────────────────────────────────────────────

function tenantEmail(firstName: string, property: string, listingUrl: string, outcome: string, availDate: string | null): string {
  let body = "";

  if (outcome === "qualified") {
    body = `
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Great news — you're pre-qualified to view <strong>${property}</strong>.</p>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Our team will reach out within <strong>24 hours</strong> to schedule a viewing at a time that works for you. You can also book directly by clicking below.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${listingUrl}" style="display:inline-block;background:#8B2030;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:1px;">VIEW LISTING & BOOK</a>
      </div>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">When you come for the viewing, please be ready to provide:</p>
      <ul style="margin:16px 0 28px;padding-left:24px;">
        <li style="margin:0 0 12px;font-size:17px;line-height:1.9;">6 months of bank statements</li>
        <li style="margin:0 0 12px;font-size:17px;line-height:1.9;">Employment verification (letter or pay stubs)</li>
        <li style="margin:0 0 12px;font-size:17px;line-height:1.9;">Previous landlord reference</li>
      </ul>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">We'll send a soft credit check link separately — it won't affect your score.</p>`;
  } else if (outcome === "waitlist") {
    body = `
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Thanks for your interest in <strong>${property}</strong>.</p>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">We're currently looking to fill this unit${availDate ? ` for <strong>${availDate}</strong>` : ""} and there's strong interest. Your preferred move-in date is a bit later, but if we don't find someone for the earlier date, <strong>you'll be first on our list</strong>.</p>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">We also add new properties regularly. We've saved your details and will reach out when something that fits comes up.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://www.prosperaproperties.co/listings" style="display:inline-block;background:#1F2F3A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;">Browse Other Listings</a>
      </div>`;
  } else {
    body = `
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Thanks for your interest in <strong>${property}</strong>.</p>
      <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">This particular listing may not be the right fit at the moment, but we add new properties regularly and keep a growing list of prospective tenants. We've saved your info and will reach out when something matches.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://www.prosperaproperties.co/listings" style="display:inline-block;background:#1F2F3A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;">Browse Other Listings</a>
      </div>`;
  }

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <div style="background:#1F2F3A;border-radius:12px;padding:32px 28px;margin-bottom:32px;">
      <h1 style="color:#FAF8F5;font-size:24px;font-weight:300;margin:0 0 8px;">
        ${outcome === "qualified" ? "You're pre-qualified" : outcome === "waitlist" ? "You're on our list" : "Thanks for your interest"}
      </h1>
      <p style="color:rgba(250,248,245,0.7);font-size:15px;margin:0;">${property}</p>
    </div>
    ${body}
    <p style="font-size:17px;line-height:2.0;margin:0 0 8px;">Talk soon,</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;font-weight:600;">Ebin — Prospera Properties</p>
    <div style="border-top:1px solid #e8e4df;padding-top:20px;margin-top:20px;">
      <p style="font-size:13px;color:#5a6068;margin:0;">Prospera Properties · (519) 697-1227 · hello@prosperaproperties.co</p>
    </div>
  </div>`;
}

// ── Admin Email ─────────────────────────────────────────────

function adminEmail(
  name: string, email: string, phone: string,
  property: string,
  details: Record<string, unknown>,
  listingUrl: string
): string {
  const outcomeColors: Record<string, string> = {
    qualified: "#22c55e",
    waitlist: "#f59e0b",
    disqualified: "#ef4444",
  };
  const outcomeColor = outcomeColors[details.outcome as string] || "#666";

  const rows = [
    ["Name", name],
    ["Email", `<a href="mailto:${email}" style="color:#8B2030;">${email}</a>`],
    ["Phone", `<a href="tel:${phone}" style="color:#8B2030;">${phone}</a>`],
    ["Move-in Date", details.move_in_date ? String(details.move_in_date) : "Not specified"],
    ["Property Available", details.available_date || "Not set"],
    ["Late Move-in?", details.late_movein ? "⚠️ Yes" : "No"],
    ["Occupants", String(details.num_occupants || 1)],
    ["Rent OK?", details.rent_ok ? "✅ Yes" : "❌ No"],
    ["Docs Agreed?", details.docs_agreed ? "✅ Yes" : "❌ No"],
    ["Outcome", `<strong style="color:${outcomeColor}">${String(details.outcome).toUpperCase()}</strong>`],
  ];

  const tableRows = rows.map(([k, v]) =>
    `<tr><td style="padding:10px 12px;font-size:14px;color:#5a6068;border-bottom:1px solid #e8e4df;width:150px;vertical-align:top;">${k}</td><td style="padding:10px 12px;font-size:14px;color:#1a1a1a;border-bottom:1px solid #e8e4df;">${v}</td></tr>`
  ).join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <div style="background:#1F2F3A;border-radius:12px;padding:32px 28px;margin-bottom:32px;">
      <h1 style="color:#FAF8F5;font-size:24px;font-weight:300;margin:0 0 8px;">New Pre-Qualification</h1>
      <p style="color:rgba(250,248,245,0.7);font-size:15px;margin:0;">${name} → ${property}</p>
      <p style="margin:12px 0 0;"><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;color:#fff;background:${outcomeColor};">${String(details.outcome).toUpperCase()}</span></p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${tableRows}</table>
    <a href="${listingUrl}" style="display:inline-block;background:#8B2030;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;margin-right:12px;">View Listing</a>
    <p style="font-size:13px;color:#5a6068;margin-top:24px;">Reply to this email or manage in the admin panel.</p>
  </div>`;
}
