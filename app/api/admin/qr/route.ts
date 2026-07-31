import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import QRCode from "qrcode";

function generateSlug(length = 7): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => chars[b % chars.length])
    .join("");
}

// GET — list all QR codes with scan counts
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("qr_codes")
    .select("*, qr_scans(count)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ codes: data });
}

// POST — create a new QR code
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, destination_url } = await req.json();
  if (!name || !destination_url) {
    return NextResponse.json({ error: "name and destination_url required" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const slug = generateSlug();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prosperaproperties.ca";
  const redirect_url = `${baseUrl}/r/${slug}`;

  const { data, error } = await db
    .from("qr_codes")
    .insert({ name, destination_url, slug, redirect_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate QR image as base64 data URL
  const qrDataUrl = await QRCode.toDataURL(redirect_url, {
    width: 400,
    margin: 2,
    color: { dark: "#1F2F3A", light: "#FFFFFF" },
  });

  return NextResponse.json({ code: data, qrDataUrl });
}
