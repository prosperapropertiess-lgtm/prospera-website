import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

function isAuthenticated(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  return session?.value === "authenticated";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const supabase = getAdminClient();

  const { data, error } = await supabase.from("properties").update(body).eq("id", id).select().single();
  if (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getAdminClient();

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
