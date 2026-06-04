import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { onboardEmail2DetailsReceived } from "@/lib/emails";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.prosperaproperties.co";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const sb = getSupabaseAdmin();

  const { data: session } = await sb
    .from("onboarding_sessions")
    .select("*")
    .eq("token", token)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { reviewed_data } = body;

  // Merge reviewed corrections back into lease_parsed_data
  const mergedData = { ...(session.lease_parsed_data ?? {}), ...(reviewed_data ?? {}) };

  await sb.from("onboarding_sessions").update({
    lease_parsed_data: mergedData,
  }).eq("token", token);

  // Send Email 2 to owner: details form link
  if (session.owner_email) {
    const tenants = mergedData.tenants ?? [];
    const tenantCount = Array.isArray(tenants) ? tenants.length : 0;
    const fieldsExtracted = Object.entries(mergedData).filter(([, v]) => v !== null && v !== undefined).length;

    try {
      const html = onboardEmail2DetailsReceived({
        ownerName: session.owner_name || "there",
        propertyAddress: session.property_address || "your property",
        tenantCount,
        fieldsExtracted,
        agreementUrl: `${BASE_URL}/onboard/${token}/agreement`,
      });
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Ebin | Prospera Properties <prosperapropertiess@gmail.com>",
          to: session.owner_email,
          subject: "Details received — one signature and you're halfway there",
          html,
        });
      }
    } catch (e) {
      console.error("Email 2 failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
