import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const sb = getSupabaseAdmin();

  const [{ data: queue }, { data: log }] = await Promise.all([
    sb.from("email_sequence_state")
      .select("*")
      .order("next_send_at", { ascending: true })
      .limit(200),
    sb.from("sequence_send_log")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50),
  ]);

  return NextResponse.json({ queue: queue ?? [], log: log ?? [] });
}
