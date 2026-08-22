import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/listings/viewing?property_id=xxx&date=YYYY-MM-DD — already-booked times for that property/day
export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get("property_id");
  const date = req.nextUrl.searchParams.get("date");
  if (!propertyId || !date) {
    return NextResponse.json({ error: "property_id and date are required" }, { status: 400 });
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("viewings")
    .select("viewing_date")
    .eq("property_id", propertyId)
    .neq("status", "cancelled")
    .gte("viewing_date", dayStart.toISOString())
    .lte("viewing_date", dayEnd.toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ booked: (data ?? []).map((v) => v.viewing_date) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { property_id, prequalification_id, tenant_name, tenant_email, tenant_phone, viewing_date, viewing_notes } = body;

  if (!property_id || !tenant_name || !tenant_email || !viewing_date) {
    return NextResponse.json({ error: "Property, name, email, and viewing date are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch property for email
  const { data: property } = await supabase
    .from("properties")
    .select("id, title, address, city, price, bedrooms, bathrooms")
    .eq("id", property_id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Guard against double-booking the same property/slot (race condition on a stale picker)
  const { data: conflict } = await supabase
    .from("viewings")
    .select("id")
    .eq("property_id", property_id)
    .eq("viewing_date", viewing_date)
    .neq("status", "cancelled")
    .maybeSingle();

  if (conflict) {
    return NextResponse.json({ error: "That time was just booked by someone else — pick another slot." }, { status: 409 });
  }

  // Create viewing
  const { data, error } = await supabase.from("viewings").insert([{
    property_id,
    prequalification_id: prequalification_id || null,
    tenant_name,
    tenant_email,
    tenant_phone: tenant_phone || null,
    viewing_date,
    viewing_notes: viewing_notes || null,
    status: "confirmed",
    confirmation_sent_at: new Date().toISOString(),
  }]).select().single();

  if (error) {
    console.error("Viewing insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email with ICS calendar invite
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && data) {
    (async () => {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const viewingDateObj = new Date(viewing_date);
        const dateStr = viewingDateObj.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        const timeStr = viewingDateObj.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
        const propertyLine = `${property.title || property.address} — ${property.city}`;

        // Generate ICS calendar file
        const icsContent = generateICS(viewingDateObj, property, tenant_name, tenant_email);

        // 1. Tenant confirmation
        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: tenant_email,
          subject: `Viewing confirmed — ${dateStr} at ${timeStr}`,
          html: viewingConfirmationEmail(tenant_name.split(" ")[0], propertyLine, dateStr, timeStr, property),
          attachments: [{ filename: "viewing.ics", content: Buffer.from(icsContent).toString("base64") }],
        }).catch((err: unknown) => console.error("[viewing] Tenant email failed:", err));

        // 2. Admin + agents notification
        const { data: agents } = await supabase.from("agents").select("email").eq("is_active", true);
        const agentEmails = (agents || []).map((a: { email: string }) => a.email);

        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          cc: agentEmails,
          subject: `Viewing booked: ${tenant_name} — ${property.address} — ${dateStr}`,
          html: adminViewingEmail(tenant_name, tenant_email, tenant_phone, propertyLine, dateStr, timeStr),
        }).catch((err: unknown) => console.error("[viewing] Admin email failed:", err));

      } catch (err) {
        console.error("[viewing] Email failed:", err);
      }
    })();
  }

  return NextResponse.json(data, { status: 201 });
}

function generateICS(date: Date, property: Record<string, unknown>, tenantName: string, tenantEmail: string): string {
  const start = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = new Date(date.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prospera Properties//Viewing//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Property Viewing — ${property.address}`,
    `DESCRIPTION:Viewing at ${property.address}\\, ${property.city}. Contact Ebin at (519) 697-1227.`,
    `LOCATION:${property.address}\\, ${property.city}\\, ON`,
    `ORGANIZER;CN=Prospera Properties:mailto:hello@prosperaproperties.co`,
    `ATTENDEE;RSVP=TRUE;CN=${tenantName}:mailto:${tenantEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function viewingConfirmationEmail(firstName: string, property: string, date: string, time: string, p: Record<string, unknown>): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <div style="background:#1F2F3A;border-radius:12px;padding:32px 28px;margin-bottom:32px;">
      <h1 style="color:#FAF8F5;font-size:24px;font-weight:300;margin:0 0 8px;">Viewing Confirmed</h1>
      <p style="color:rgba(250,248,245,0.7);font-size:15px;margin:0;">${property}</p>
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Your viewing is locked in. Here are the details:</p>
    <div style="background:#f6f4f1;border-radius:12px;padding:24px;margin:0 0 28px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;font-size:14px;color:#5a6068;width:100px;">When</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;font-weight:600;">${date} at ${time}</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#5a6068;">Where</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;font-weight:600;">${p.address}, ${p.city}, ON</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#5a6068;">Duration</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;">~30 minutes</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#5a6068;">Meet</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;">Ebin from Prospera Properties</td></tr>
      </table>
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Just bring yourself and any questions about the property — nothing else needed for the viewing. If it's a fit, we'll walk you through the application afterward.</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">A calendar invite is attached. Need to reschedule? Just reply to this email.</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 8px;">See you there,</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;font-weight:600;">Ebin — (519) 697-1227</p>
  </div>`;
}

function adminViewingEmail(name: string, email: string, phone: string, property: string, date: string, time: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <div style="background:#1F2F3A;border-radius:12px;padding:32px 28px;margin-bottom:32px;">
      <h1 style="color:#FAF8F5;font-size:24px;font-weight:300;margin:0;">Viewing Booked</h1>
      <p style="color:rgba(250,248,245,0.7);font-size:15px;margin:8px 0 0;">${name} — ${property}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:10px 12px;font-size:14px;color:#5a6068;border-bottom:1px solid #e8e4df;width:120px;">Tenant</td><td style="padding:10px 12px;font-size:14px;color:#1a1a1a;border-bottom:1px solid #e8e4df;font-weight:600;">${name}</td></tr>
      <tr><td style="padding:10px 12px;font-size:14px;color:#5a6068;border-bottom:1px solid #e8e4df;">Email</td><td style="padding:10px 12px;font-size:14px;border-bottom:1px solid #e8e4df;"><a href="mailto:${email}" style="color:#8B2030;">${email}</a></td></tr>
      <tr><td style="padding:10px 12px;font-size:14px;color:#5a6068;border-bottom:1px solid #e8e4df;">Phone</td><td style="padding:10px 12px;font-size:14px;border-bottom:1px solid #e8e4df;"><a href="tel:${phone}" style="color:#8B2030;">${phone || "—"}</a></td></tr>
      <tr><td style="padding:10px 12px;font-size:14px;color:#5a6068;border-bottom:1px solid #e8e4df;">Date</td><td style="padding:10px 12px;font-size:14px;color:#1a1a1a;border-bottom:1px solid #e8e4df;font-weight:600;">${date} at ${time}</td></tr>
      <tr><td style="padding:10px 12px;font-size:14px;color:#5a6068;border-bottom:1px solid #e8e4df;">Property</td><td style="padding:10px 12px;font-size:14px;color:#1a1a1a;border-bottom:1px solid #e8e4df;">${property}</td></tr>
    </table>
  </div>`;
}
