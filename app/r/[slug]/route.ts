import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("qr_codes")
    .select("id, destination_url")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Log the scan (fire-and-forget — don't block redirect)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "";

  db.from("qr_scans").insert({
    qr_code_id: data.id,
    ip,
    user_agent: userAgent,
  }).then(() => {});

  return NextResponse.redirect(data.destination_url);
}
