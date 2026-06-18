import { NextRequest, NextResponse } from "next/server";
import { fetchAllTenants, fetchAllProperties } from "@/lib/notion";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
const INACTIVE = new Set(["former", "evicted", "ended", "past", "inactive", "terminated", "moved out"]);

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [allTenants, allProperties] = await Promise.all([
    fetchAllTenants(),
    fetchAllProperties(),
  ]);

  const tenants = allTenants
    .filter((t) => !INACTIVE.has(t.status.toLowerCase().trim()))
    .map((t) => ({ id: t.id, name: t.name, propertyId: t.propertyId }));

  const properties = allProperties
    .filter((p) => p.status?.toLowerCase() !== "inactive")
    .map((p) => ({ id: p.id, address: p.address || p.name }));

  return NextResponse.json({ tenants, properties });
}
