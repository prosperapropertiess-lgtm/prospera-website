import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateTenantToken } from "@/lib/tenant-data";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  const { data: session } = await sb
    .from("onboarding_sessions")
    .select("lease_storage_path, property_address, created_at")
    .eq("notion_property_id", access.property_id)
    .not("lease_storage_path", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!session?.lease_storage_path) {
    return NextResponse.json({ error: "No lease found" }, { status: 404 });
  }

  const { data: signed, error } = await sb.storage
    .from("onboarding")
    .createSignedUrl(session.lease_storage_path, 3600);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
