import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fetchRentForYear, fetchAllProperties } from "@/lib/notion";

// TEMPORARY debug route — diagnosing the MRR calculation, remove after use
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
  const [entries, properties] = await Promise.all([
    fetchRentForYear(year),
    fetchAllProperties(),
  ]);
  const propMap = new Map(properties.map((p) => [p.id, p.address]));
  const enriched = entries.map((e) => ({
    ...e,
    propertyAddress: propMap.get(e.propertyId) ?? "(unmatched property id)",
  }));
  return NextResponse.json({ count: entries.length, entries: enriched, propertyCount: properties.length });
}
