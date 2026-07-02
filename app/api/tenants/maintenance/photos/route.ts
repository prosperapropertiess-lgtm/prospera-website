import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateTenantToken } from "@/lib/tenant-data";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const formToken = formData.get("token");
  const token = (typeof formToken === "string" ? formToken : null)
    ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const access = await validateTenantToken(token);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const photoFiles = formData.getAll("photo").filter((f): f is File => f instanceof File);
  if (photoFiles.length === 0) return NextResponse.json({ urls: [] });
  if (photoFiles.length > 3) {
    return NextResponse.json({ error: "Maximum 3 photos allowed" }, { status: 400 });
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

  for (const file of photoFiles) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }
  }

  const sb = getSupabaseAdmin();
  const urls: string[] = [];

  for (const file of photoFiles) {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${token}/${timestamp}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await sb.storage
      .from("maintenance-photos")
      .upload(path, buffer, { contentType: file.type });

    if (error) {
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }
    urls.push(path);
  }

  return NextResponse.json({ urls });
}
