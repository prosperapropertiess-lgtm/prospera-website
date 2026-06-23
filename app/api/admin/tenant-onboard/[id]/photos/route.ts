import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET;
const BUCKET = "tenant-inspection";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.headers.get("x-admin-secret");
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("photo") as File[];
  if (!files.length) {
    return NextResponse.json({ error: "No photo files provided" }, { status: 400 });
  }
  if (files.length > 10) {
    return NextResponse.json({ error: "Maximum 10 photos per upload" }, { status: 400 });
  }

  const { id } = await params;
  const sb = getSupabaseAdmin();
  const newPaths: string[] = [];

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${id}/${timestamp}-${safeName}`;

    const { error } = await sb.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: `Upload failed for ${file.name}: ${error.message}` }, { status: 500 });
    }
    newPaths.push(path);
  }

  // Fetch existing photos and append
  const { data: session, error: fetchErr } = await sb
    .from("tenant_onboarding_sessions")
    .select("inspection_photos")
    .eq("id", id)
    .single();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const existing: string[] = session?.inspection_photos ?? [];
  const allPaths = [...existing, ...newPaths];

  const { error: updateErr } = await sb
    .from("tenant_onboarding_sessions")
    .update({ inspection_photos: allPaths })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ paths: newPaths, total: allPaths.length });
}
