import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("properties")
    .update({ ...body, last_saved_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // A home with applications or showings can't be wiped without losing those records,
  // so it's archived instead: gone from the website and the listings page, records kept.
  const [{ count: apps }, { count: appts }] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("property_id", id),
    supabase.from("fo_appointments").select("id", { count: "exact", head: true }).eq("property_id", id),
  ]);
  if ((apps ?? 0) + (appts ?? 0) > 0) {
    const { error } = await supabase.from("properties").update({ status: "archived", available: false, published_at: null }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, archived: true });
  }

  // Delete photos from storage first
  const { data: property } = await supabase.from("properties").select("images").eq("id", id).single();
  if (property?.images?.length) {
    const paths = property.images.map((url: string) => {
      const parts = url.split("/property-images/");
      return parts[1] || "";
    }).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from("property-images").remove(paths);
    }
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
