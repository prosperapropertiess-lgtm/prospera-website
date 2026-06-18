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
    .from("property_schedule")
    .select("id, property_id, event_type, title, description, event_date, recurring, created_at")
    .eq("property_id", propertyId)
    .order("event_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    propertyId?: string;
    eventType?: string;
    title?: string;
    description?: string;
    eventDate?: string;
    recurring?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { propertyId, eventType, title, description, eventDate, recurring } = body;
  if (!propertyId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("property_schedule")
    .insert({
      property_id: propertyId,
      event_type: eventType ?? "other",
      title,
      description: description ?? null,
      event_date: eventDate ?? null,
      recurring: recurring ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
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
  const { error } = await sb.from("property_schedule").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
