import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ALL_DOC_TYPES } from "@/lib/application-requirements";

// Staff-added documents for an application already submitted: a signed upload URL
// (files go straight to Storage, past Vercel's 4.5MB body limit), then a record.
// Re-running the AI is a separate step (../rescreen) so several files can go up first.

const MAX_SIZE = 25 * 1024 * 1024;
const EXT: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

type Params = { params: Promise<{ id: string }> };

async function exists(id: string) {
  const { data } = await supabaseAdmin.from("applications").select("id").eq("id", id).maybeSingle();
  return !!data;
}

// POST { action: "upload_url", doc_type, content_type, size } → { storage_path, token }
// POST { action: "attach", doc_type, storage_path, file_name } → { ok }
export async function POST(req: NextRequest, { params }: Params) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!await exists(id)) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  const b = await req.json().catch(() => ({}));
  if (!ALL_DOC_TYPES.includes(b.doc_type)) return NextResponse.json({ error: "Pick what kind of document it is." }, { status: 400 });

  if (b.action === "upload_url") {
    if (!EXT[b.content_type]) return NextResponse.json({ error: "Upload a PDF or a photo (JPG or PNG)." }, { status: 400 });
    if (typeof b.size !== "number" || b.size <= 0 || b.size > MAX_SIZE) return NextResponse.json({ error: "That file is over 25MB." }, { status: 400 });
    const path = `applications/${id}/staff-${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${b.doc_type}.${EXT[b.content_type]}`;
    const { data, error } = await supabaseAdmin.storage.from("applications").createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: "Couldn't start the upload." }, { status: 500 });
    return NextResponse.json({ storage_path: data.path, token: data.token });
  }

  if (b.action === "attach") {
    const path = String(b.storage_path ?? "");
    if (!new RegExp(`^applications/${id}/staff-[\\w.-]+$`).test(path)) return NextResponse.json({ error: "Bad upload path" }, { status: 400 });
    const { error } = await supabaseAdmin.from("application_documents").insert({
      application_id: id, doc_type: b.doc_type, storage_path: path, uploaded_by: "staff",
      file_name: typeof b.file_name === "string" ? b.file_name.slice(0, 200) : null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// DELETE ?doc=<id>: remove a document staff added by mistake. The applicant's own uploads stay.
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const docId = req.nextUrl.searchParams.get("doc");
  const { data: doc } = await supabaseAdmin.from("application_documents")
    .select("id, storage_path, uploaded_by").eq("id", docId ?? "").eq("application_id", id).maybeSingle();
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (doc.uploaded_by !== "staff") return NextResponse.json({ error: "Only documents added by staff can be removed." }, { status: 403 });
  await supabaseAdmin.storage.from("applications").remove([doc.storage_path]);
  await supabaseAdmin.from("application_documents").delete().eq("id", doc.id);
  return NextResponse.json({ ok: true });
}
