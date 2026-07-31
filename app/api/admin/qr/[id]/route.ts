import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import QRCode from "qrcode";

// PATCH — update destination URL or name
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const updates: Record<string, string> = {};
  if (body.name) updates.name = body.name;
  if (body.destination_url) updates.destination_url = body.destination_url;

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("qr_codes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data });
}

// DELETE — remove a QR code and its scans
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getSupabaseAdmin();

  await db.from("qr_scans").delete().eq("qr_code_id", id);
  const { error } = await db.from("qr_codes").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// GET — get QR image for a specific code
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("qr_codes")
    .select("redirect_url")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qrDataUrl = await QRCode.toDataURL(data.redirect_url, {
    width: 400,
    margin: 2,
    color: { dark: "#1F2F3A", light: "#FFFFFF" },
  });

  return NextResponse.json({ qrDataUrl });
}
