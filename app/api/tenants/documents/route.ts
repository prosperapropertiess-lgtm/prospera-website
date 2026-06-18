import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateTenantToken, getTenantDocuments } from "@/lib/tenant-data";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const access = await validateTenantToken(token);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const action = req.nextUrl.searchParams.get("action");

  if (action === "download") {
    return handleDownload(req, token);
  }

  const documents = await getTenantDocuments(token);
  return NextResponse.json({ documents });
}

async function handleDownload(req: NextRequest, token: string) {
  const documentId = req.nextUrl.searchParams.get("documentId");
  if (!documentId) return NextResponse.json({ error: "Missing documentId" }, { status: 400 });

  const sb = getSupabaseAdmin();
  const { data: doc } = await sb
    .from("tenant_documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("token", token)
    .single();

  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const { data: signed, error } = await sb.storage
    .from("tenant-documents")
    .createSignedUrl(doc.storage_path, 3600);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: signed.signedUrl });
}
