import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [leadsRes, subsRes] = await Promise.all([
    supabase.from("leads").select("id, name, email, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
    supabase.from("subscribers").select("id, name, email, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
  ]);

  return NextResponse.json({
    supabase_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    service_key_set:  !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    leads: {
      error: leadsRes.error?.message ?? null,
      count: leadsRes.count,
      recent: leadsRes.data,
    },
    subscribers: {
      error: subsRes.error?.message ?? null,
      count: subsRes.count,
      recent: subsRes.data,
    },
  });
}
