import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

interface StatsResult {
  inquiries: number;
  prequalified: number;
  viewings: number;
  applications: number;
  approved: boolean;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = getSupabaseAdmin();

  // Resolve property_id from session token
  const { data: session, error: sessionError } = await sb
    .from("onboarding_sessions")
    .select("property_id")
    .eq("token", token)
    .single();

  if (sessionError || !session?.property_id) {
    return NextResponse.json<StatsResult>({
      inquiries: 0,
      prequalified: 0,
      viewings: 0,
      applications: 0,
      approved: false,
    });
  }

  const propertyId = session.property_id;

  const [inquiriesRes, prequalRes, viewingsRes, applicationsRes] = await Promise.all([
    sb.from("inquiries").select("id", { count: "exact", head: true }).eq("property_id", propertyId),
    sb.from("prequalifications").select("id", { count: "exact", head: true }).eq("property_id", propertyId),
    sb.from("viewings").select("id", { count: "exact", head: true }).eq("property_id", propertyId),
    sb.from("applications").select("id, status", { count: "exact" }).eq("property_id", propertyId),
  ]);

  const approved = Array.isArray(applicationsRes.data)
    ? applicationsRes.data.some((a) => a.status === "approved")
    : false;

  return NextResponse.json<StatsResult>({
    inquiries: inquiriesRes.count ?? 0,
    prequalified: prequalRes.count ?? 0,
    viewings: viewingsRes.count ?? 0,
    applications: applicationsRes.count ?? 0,
    approved,
  });
}
