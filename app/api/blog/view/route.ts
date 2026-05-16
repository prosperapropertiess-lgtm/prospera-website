import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// POST /api/blog/view — increment view count, return new total
export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  // Upsert: insert with 1 or increment existing
  const { data, error } = await db.rpc("increment_blog_view", { post_slug: slug });

  if (error) {
    // Fallback: manual upsert if RPC doesn't exist yet
    const { data: upserted, error: upsertError } = await db
      .from("blog_views")
      .upsert({ slug, views: 1, updated_at: new Date().toISOString() }, { onConflict: "slug", ignoreDuplicates: false })
      .select("views")
      .single();

    if (upsertError) {
      console.error("[blog/view] Error:", upsertError);
      return NextResponse.json({ views: 0 });
    }
    return NextResponse.json({ views: upserted?.views ?? 1 });
  }

  return NextResponse.json({ views: data ?? 1 });
}

// GET /api/blog/view?slug=xxx — fetch count without incrementing
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ views: 0 });

  const db = getSupabaseAdmin();
  const { data } = await db.from("blog_views").select("views").eq("slug", slug).single();
  return NextResponse.json({ views: data?.views ?? 0 });
}
