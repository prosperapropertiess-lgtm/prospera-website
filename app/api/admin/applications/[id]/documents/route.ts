import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ALL_DOC_TYPES } from "@/lib/application-requirements";
import { screenAndSave } from "@/lib/application-screening";

export const maxDuration = 300;

// Admin adds, relabels or removes an applicant's documents, e.g. when the
// applicant emails the missing bank statement. Files go straight to Storage
// through a signed upload URL (Vercel caps request bodies at 4.5MB).

const MAX_SIZE = 15 * 1024 * 1024;
const EXT: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (body.action === "sign") {
    const { doc_type, content_type, size } = body;
    if (!ALL_DOC_TYPES.includes(doc_type)) return NextResponse.json({ error: "Pick what kind of document this is." }, { status: 400 });
    if (!EXT[content_type]) return NextResponse.json({ error: "Upload a PDF or a photo (JPG or PNG)." }, { status: 400 });
    if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) return NextResponse.json({ error: "That file is over 15MB." }, { status: 400 });
    const path = `applications/${id}/admin-${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${doc_type}.${EXT[content_type]}`;
    const { data, error } = await supabaseAdmin.storage.from("applications").createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    return NextResponse.json({ storage_path: data.path, token: data.token });
  }

  if (body.action === "attach") {
    const files = (body.files ?? []) as { doc_type: string; path: string }[];
    const ok = files.filter((f) => ALL_DOC_TYPES.includes(f.doc_type as never) && f.path?.startsWith(`applications/${id}/admin-`));
    if (!ok.length) return NextResponse.json({ error: "Nothing to add." }, { status: 400 });
    const { error } = await supabaseAdmin.from("application_documents").insert(ok.map((f) => ({ application_id: id, doc_type: f.doc_type, storage_path: f.path })));
    if (error) return NextResponse.json({ error: "Couldn't save the documents." }, { status: 500 });
    if (!body.rescreen) return NextResponse.json({ ok: true });
    const { summary, error: aiError } = await screenAndSave(id);
    return NextResponse.json({ ok: true, rescreened: !!summary, error: summary ? null : aiError ?? "AI review failed" });
  }

  if (body.action === "relabel") {
    if (!ALL_DOC_TYPES.includes(body.doc_type)) return NextResponse.json({ error: "Unknown document type" }, { status: 400 });
    await supabaseAdmin.from("application_documents").update({ doc_type: body.doc_type }).eq("id", body.doc_id).eq("application_id", id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "remove") {
    const { data: doc } = await supabaseAdmin.from("application_documents").select("storage_path").eq("id", body.doc_id).eq("application_id", id).maybeSingle();
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    await supabaseAdmin.from("application_documents").delete().eq("id", body.doc_id);
    await supabaseAdmin.storage.from("applications").remove([doc.storage_path]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
