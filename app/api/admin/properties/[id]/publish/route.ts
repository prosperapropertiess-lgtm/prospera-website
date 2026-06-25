import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function generateMarketplaceDescription(p: Record<string, unknown>): string {
  const lines: string[] = [];
  const listingUrl = `https://www.prosperaproperties.co/listings/${p.id}`;

  // Title
  lines.push(`🏠 ${p.title || `${p.bedrooms} Bedroom Rental — ${p.city}`}`);
  lines.push("");

  // Price & basics
  lines.push(`💰 $${Number(p.price).toLocaleString()}/month`);
  lines.push(`🛏 ${p.bedrooms} Bedroom${Number(p.bedrooms) > 1 ? "s" : ""} | 🚿 ${p.bathrooms} Bathroom${Number(p.bathrooms) > 1 ? "s" : ""}`);
  if (p.sqft) lines.push(`📐 ${p.sqft} sq ft`);
  if (p.property_type) lines.push(`🏢 ${String(p.property_type).charAt(0).toUpperCase() + String(p.property_type).slice(1)}`);
  lines.push(`📍 ${p.address}, ${p.city}, ON`);
  if (p.available_date) lines.push(`📅 Available: ${p.available_date}`);
  lines.push("");

  // Description (truncated)
  if (p.description) {
    const desc = String(p.description);
    lines.push(desc.length > 400 ? desc.slice(0, 400) + "..." : desc);
    lines.push("");
  }

  // Key features
  const features: string[] = [];
  if (p.parking_type && p.parking_type !== "none") features.push(`✅ Parking: ${p.parking_type}`);
  if (p.laundry_type && p.laundry_type !== "none") features.push(`✅ Laundry: ${p.laundry_type}`);
  if (p.ac) features.push("✅ Air Conditioning");
  if (p.pet_friendly) features.push("✅ Pet Friendly");
  if (p.utilities_included) features.push("✅ Utilities Included");
  if (p.furnished) features.push("✅ Furnished");
  if (p.elevator) features.push("✅ Elevator");
  if (p.wheelchair_accessible) features.push("✅ Wheelchair Accessible");

  if (features.length) {
    lines.push("FEATURES:");
    lines.push(...features);
    lines.push("");
  }

  // CTA
  lines.push("—————————————————");
  lines.push("📋 PRE-QUALIFY & BOOK A VIEWING:");
  lines.push(listingUrl);
  lines.push("");
  lines.push("Pre-qualify online in 2 minutes and book a viewing instantly.");
  lines.push("Managed by Prospera Properties — (519) 697-1227");

  return lines.join("\n");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // Fetch full property to generate marketplace description
  const { data: property } = await supabase.from("properties").select("*").eq("id", id).single();
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const marketplace_description = generateMarketplaceDescription(property);

  const { data, error } = await supabase
    .from("properties")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      marketplace_description,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Tenant Matching: email past waitlisted/disqualified tenants ──
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && data) {
    (async () => {
      try {
        // Find tenants from OTHER properties who were waitlisted or disqualified
        // and whose budget could fit this property
        const { data: candidates } = await supabase
          .from("prequalifications")
          .select("id, full_name, email, move_in_date, rent_ok, outcome")
          .neq("property_id", id)
          .in("outcome", ["waitlist", "disqualified"])
          .eq("rent_ok", true)
          .order("score", { ascending: false })
          .limit(50);

        if (!candidates?.length) return;

        // Deduplicate by email
        const seen = new Set<string>();
        const unique = candidates.filter((c) => {
          if (seen.has(c.email)) return false;
          seen.add(c.email);
          return true;
        });

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const listingUrl = `https://www.prosperaproperties.co/listings/${data.id}`;
        const propertyLine = `${data.title || data.address} — ${data.city}`;

        let sentCount = 0;
        for (const tenant of unique.slice(0, 30)) {
          // Check if already notified for this property
          const { data: existing } = await supabase
            .from("tenant_match_notifications")
            .select("id")
            .eq("property_id", id)
            .eq("tenant_email", tenant.email)
            .maybeSingle();

          if (existing) continue;

          const firstName = tenant.full_name.split(" ")[0];

          await resend.emails.send({
            from: "Prospera Properties <hello@prosperaproperties.co>",
            to: tenant.email,
            subject: `New listing in ${data.city} — ${data.bedrooms} bed, $${Number(data.price).toLocaleString()}/mo`,
            html: matchEmail(firstName, propertyLine, listingUrl, data),
          }).catch((err: unknown) => console.error(`[match] Failed for ${tenant.email}:`, err));

          // Track notification
          await supabase.from("tenant_match_notifications").insert({
            property_id: id,
            prequalification_id: tenant.id,
            tenant_email: tenant.email,
          });

          sentCount++;
        }

        if (sentCount > 0) {
          console.log(`[publish] Sent ${sentCount} tenant match emails for property ${id}`);
        }
      } catch (err) {
        console.error("[publish] Tenant matching failed:", err);
      }
    })();
  }

  return NextResponse.json(data);
}

function matchEmail(firstName: string, property: string, listingUrl: string, p: Record<string, unknown>): string {
  const features: string[] = [];
  if (p.parking_type && p.parking_type !== "none") features.push(`Parking: ${p.parking_type}`);
  if (p.laundry_type && p.laundry_type !== "none") features.push(`Laundry: ${p.laundry_type}`);
  if (p.pet_friendly) features.push("Pet friendly");
  if (p.ac) features.push("A/C included");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <div style="background:#1F2F3A;border-radius:12px;padding:32px 28px;margin-bottom:32px;">
      <h1 style="color:#FAF8F5;font-size:24px;font-weight:300;margin:0 0 8px;">New listing just dropped</h1>
      <p style="color:rgba(250,248,245,0.7);font-size:15px;margin:0;">${property}</p>
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">We just listed a new property that might be a great fit for you.</p>
    <div style="background:#f6f4f1;border-radius:12px;padding:24px;margin:0 0 28px;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1F2F3A;">$${Number(p.price).toLocaleString()}<span style="font-size:14px;font-weight:400;color:#5a6068;">/mo</span></p>
      <p style="margin:0 0 4px;font-size:15px;color:#1a1a1a;">${p.bedrooms} bed · ${p.bathrooms} bath${p.sqft ? ` · ${p.sqft} sq ft` : ""}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#5a6068;">${p.address}, ${p.city}, ON</p>
      ${features.length ? `<p style="margin:0;font-size:14px;color:#5a6068;">${features.join(" · ")}</p>` : ""}
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Since you've expressed interest before, we wanted you to see it first. Pre-qualify online in 2 minutes and book a viewing.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${listingUrl}" style="display:inline-block;background:#8B2030;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:1px;">VIEW LISTING & PRE-QUALIFY</a>
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 8px;">Talk soon,</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;font-weight:600;">Ebin — Prospera Properties</p>
    <div style="border-top:1px solid #e8e4df;padding-top:20px;margin-top:20px;">
      <p style="font-size:13px;color:#5a6068;margin:0;">Prospera Properties · (519) 697-1227</p>
    </div>
  </div>`;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("properties")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Unpublish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
