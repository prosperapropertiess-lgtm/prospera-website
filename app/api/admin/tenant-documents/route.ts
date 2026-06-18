import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const token = formData.get("token");
  const tenantId = formData.get("tenantId");
  const propertyId = formData.get("propertyId");
  const label = formData.get("label");
  const category = formData.get("category");
  const file = formData.get("file");

  if (
    typeof token !== "string" || !token ||
    typeof tenantId !== "string" || !tenantId ||
    typeof propertyId !== "string" || !propertyId ||
    typeof label !== "string" || !label ||
    typeof category !== "string" || !category ||
    !(file instanceof File)
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const sanitized = sanitizeFilename(file.name);
  const storagePath = `${token}/${propertyId}/${Date.now()}-${sanitized}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await sb.storage
    .from("tenant-documents")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: document, error: dbError } = await sb
    .from("tenant_documents")
    .insert({
      tenant_id: tenantId,
      property_id: propertyId,
      token,
      label,
      category,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select("id, label, file_name")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, document });
}
