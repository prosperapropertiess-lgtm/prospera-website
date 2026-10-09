import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyQuickActionToken } from "@/lib/application-quick-action-token";
import { decideApplication } from "@/lib/application-decision";

const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";
const BG = "#F7F5F2";

function page(title: string, body: string): NextResponse {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:440px;margin:60px auto;padding:0 24px;text-align:center;">
    ${body}
    <a href="https://www.prosperaproperties.co/admin/applications" style="display:inline-block;margin-top:24px;font-size:13px;color:${CRIMSON};text-decoration:none;">← Back to Applications</a>
  </div>
</body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// One-tap approve/reject — clicked directly from the Ebin-review email, no
// admin login required. Authenticated by a signed, time-limited token
// instead of a session cookie (email clients don't carry cookies).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token") ?? "";

  const { valid, decision } = verifyQuickActionToken(token, id);
  if (!valid || !decision) {
    return page(
      "Link expired",
      `<p style="font-size:20px;font-weight:700;color:${NAVY};">This link has expired or is invalid.</p>
       <p style="font-size:14px;color:#5a6068;">Review and decide on this application from the admin panel instead.</p>`
    );
  }

  const { data: application } = await supabaseAdmin
    .from("applications")
    .select("tenant_name, property_id, properties(address, city)")
    .eq("id", id)
    .maybeSingle();

  const result = await decideApplication(id, decision);
  if (!result.ok) {
    return page("Something went wrong", `<p style="font-size:16px;color:${CRIMSON};">${result.error}</p>`);
  }

  const propRow = application?.properties as unknown as { address?: string; city?: string } | null;
  const propertyLabel = propRow?.address ? `${propRow.address}, ${propRow.city}` : "the property";
  const verb = decision === "approved" ? "Approved" : "Declined";
  const color = decision === "approved" ? "#2D7A4F" : CRIMSON;

  return page(
    `${verb} — ${application?.tenant_name ?? ""}`,
    `<div style="width:48px;height:48px;border-radius:99px;background:${color}1A;color:${color};font-size:24px;line-height:48px;margin:0 auto 16px;">${decision === "approved" ? "✓" : "✕"}</div>
     <p style="font-size:20px;font-weight:700;color:${NAVY};margin:0 0 6px;">${verb}${result.alreadyDone ? " (already was)" : ""}</p>
     <p style="font-size:14px;color:#5a6068;margin:0;">${application?.tenant_name ?? "This applicant"} for ${propertyLabel}.</p>`
  );
}
