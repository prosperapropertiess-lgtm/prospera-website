import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

interface OwnerDocument {
  id: string;
  label: string;
  category: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

async function validateToken(sb: ReturnType<typeof getSupabaseAdmin>, token: string): Promise<boolean> {
  const { data } = await sb
    .from("owner_access")
    .select("token")
    .eq("token", token)
    .single();
  return !!data;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const token = searchParams.get("token");
  const action = searchParams.get("action");
  const documentId = searchParams.get("documentId");

  if (!propertyId || !token) {
    return NextResponse.json({ error: "Missing propertyId or token" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const valid = await validateToken(sb, token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (action === "download") {
    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    const { data: doc, error: docError } = await sb
      .from("owner_documents")
      .select("storage_path")
      .eq("id", documentId)
      .eq("property_id", propertyId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const { data: signed, error: signedError } = await sb.storage
      .from("owner-documents")
      .createSignedUrl(doc.storage_path, 3600);

    if (signedError || !signed) {
      return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: signed.signedUrl });
  }

  // Default: list documents
  const { data: documents, error } = await sb
    .from("owner_documents")
    .select("id, label, category, file_name, file_size, mime_type, uploaded_at")
    .eq("property_id", propertyId)
    .order("uploaded_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: (documents ?? []) as OwnerDocument[] });
}
