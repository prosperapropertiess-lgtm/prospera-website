import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendApplicationInvite } from "@/lib/application-invite";

// Admin "send application link" button — name, email, property, click send.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.property_id || !body?.tenant_name || !body?.tenant_email) {
    return NextResponse.json({ error: "property_id, tenant_name, and tenant_email are required" }, { status: 400 });
  }

  try {
    const result = await sendApplicationInvite(body.property_id, body.tenant_name, body.tenant_email);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send invite" }, { status: 400 });
  }
}
