import { NextRequest, NextResponse } from "next/server";
import { validateTenantToken, getTenantInfo } from "@/lib/tenant-data";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
    ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const access = await validateTenantToken(token);
  if (!access) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const info = await getTenantInfo(access.notion_tenant_id);

  return NextResponse.json({
    valid: true,
    tenantName: access.tenant_name,
    propertyAddress: info?.propertyAddress ?? "",
  });
}
