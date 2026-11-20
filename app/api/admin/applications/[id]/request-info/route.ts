import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInfoRequest, infoRequestLink } from "@/lib/application-info-request";

// Admin asks an applicant for more documents or answers, sees past requests, or cancels one.

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data } = await supabaseAdmin.from("application_info_requests").select("*").eq("application_id", id).order("sent_at", { ascending: false });
  return NextResponse.json((data ?? []).map((r) => ({ ...r, url: infoRequestLink(r.id) })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.action === "cancel") {
    await supabaseAdmin.from("application_info_requests").update({ cancelled_at: new Date().toISOString() }).eq("id", body.request_id).eq("application_id", id).is("completed_at", null);
    return NextResponse.json({ ok: true });
  }
  try {
    const r = await sendInfoRequest(id, { docTypes: body.doc_types ?? [], questions: body.questions ?? [], note: body.note ?? null });
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't send." }, { status: 400 });
  }
}
