import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// POST /api/listings/view — increment view count, return new total
export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("increment_listing_view", { p_listing_id: id });

  if (error) {
    // Fallback: manual upsert if RPC doesn't exist yet
    const { data: upserted, error: upsertError } = await db
      .from("listing_views")
      .upsert({ listing_id: id, views: 1, updated_at: new Date().toISOString() }, { onConflict: "listing_id", ignoreDuplicates: false })
      .select("views")
      .single();

    if (upsertError) {
      console.error("[listings/view] Error:", upsertError);
      return NextResponse.json({ views: 0 });
    }
    return NextResponse.json({ views: upserted?.views ?? 1 });
  }

  return NextResponse.json({ views: data ?? 1 });
}

// GET /api/listings/view?id=xxx — fetch count without incrementing
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ views: 0 });

  const db = getSupabaseAdmin();
  const { data } = await db.from("listing_views").select("views").eq("listing_id", id).single();
  return NextResponse.json({ views: data?.views ?? 0 });
}
