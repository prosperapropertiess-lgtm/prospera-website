import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Returns a short-lived signed URL for the landlord's uploaded lease
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = getSupabaseAdmin();

  // Resolve owner_access token → onboarding_session
  const { data: access } = await sb
    .from("owner_access")
    .select("token")
    .eq("token", token)
    .single();

  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Find the onboarding session that generated this access token
  const { data: session } = await sb
    .from("onboarding_sessions")
    .select("lease_storage_path, property_address")
    .eq("owner_access_token", token)
    .single();

  if (!session?.lease_storage_path) {
    return NextResponse.json({ error: "No lease on file" }, { status: 404 });
  }

  // Generate a 60-minute signed URL
  const { data: signed, error } = await sb.storage
    .from("onboarding")
    .createSignedUrl(session.lease_storage_path, 3600);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  return NextResponse.json({
    url: signed.signedUrl,
    filename: `lease-${(session.property_address ?? "property").replace(/\s+/g, "-").toLowerCase()}.${session.lease_storage_path.split(".").pop()}`,
  });
}
