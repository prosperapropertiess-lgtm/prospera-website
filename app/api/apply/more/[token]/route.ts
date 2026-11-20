import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { infoRequestIdFromToken, completeInfoRequest } from "@/lib/application-info-request";

export const maxDuration = 300;

// The applicant's private "send us a bit more" link: signed uploads straight to Storage, then submit.

const MAX_SIZE = 15 * 1024 * 1024;
const EXT: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = infoRequestIdFromToken(token);
  if (!id) return NextResponse.json({ error: "This link isn't working." }, { status: 404 });
  const { data: r } = await supabaseAdmin.from("application_info_requests").select("application_id, doc_types, completed_at, cancelled_at").eq("id", id).maybeSingle();
  if (!r || r.cancelled_at) return NextResponse.json({ error: "This request is no longer open." }, { status: 410 });
  if (r.completed_at) return NextResponse.json({ error: "You've already sent these. Thank you." }, { status: 409 });
  const body = await req.json().catch(() => ({}));

  if (body.action === "sign") {
    const { doc_type, content_type, size } = body;
    if (!(r.doc_types as string[]).includes(doc_type)) return NextResponse.json({ error: "Upload failed" }, { status: 400 });
    if (!EXT[content_type]) return NextResponse.json({ error: "Please upload a PDF or a photo." }, { status: 400 });
    if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) return NextResponse.json({ error: "That file is over 15MB. Try a photo or a smaller PDF." }, { status: 400 });
    const path = `applications/${r.application_id}/more-${id}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${doc_type}.${EXT[content_type]}`;
    const { data, error } = await supabaseAdmin.storage.from("applications").createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
    return NextResponse.json({ storage_path: data.path, token: data.token });
  }

  if (body.action === "submit") {
    try {
      await completeInfoRequest(id, { files: body.files ?? [], answers: body.answers ?? {}, comment: body.comment });
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't send. Try again." }, { status: 400 });
    }
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
