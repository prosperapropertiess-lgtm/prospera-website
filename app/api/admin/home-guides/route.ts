import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET;

function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return !!ADMIN_SECRET && auth === `Bearer ${ADMIN_SECRET}`;
}

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("property_home_guide")
    .select("id, property_id, section, title, content, sort_order, updated_at")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sections: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { propertyId?: string; section?: string; title?: string; content?: string; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { propertyId, section, title, content, sortOrder } = body;
  if (!propertyId || !section || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("property_home_guide")
    .upsert(
      {
        property_id: propertyId,
        section,
        title,
        content: content ?? "",
        sort_order: sortOrder ?? 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "property_id,section" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ section: data });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("property_home_guide").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
