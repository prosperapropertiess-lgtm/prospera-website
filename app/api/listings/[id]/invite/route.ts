import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey, logApiKeyActivity } from "@/lib/api-key-auth";
import { sendApplicationInvite } from "@/lib/application-invite";

// Agent-facing — lets Muse/ChatGPT/etc. send a prospect the application
// link directly: "send the application to this prospect" → one call here.
// Same Authorization: Bearer <api key> auth as the rest of /api/listings.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid, keyId } = await verifyApiKey(req);
  if (!valid) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.tenant_name || !body?.tenant_email) {
    return NextResponse.json({ error: "tenant_name and tenant_email are required" }, { status: 400 });
  }

  try {
    const result = await sendApplicationInvite(id, body.tenant_name, body.tenant_email);
    await logApiKeyActivity(keyId, "send_invite", `Sent application invite to ${body.tenant_name} <${body.tenant_email}> for ${result.propertyAddress}`, id);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send invite" }, { status: 400 });
  }
}
