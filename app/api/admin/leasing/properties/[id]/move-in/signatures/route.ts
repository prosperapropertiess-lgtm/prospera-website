/**
 * Collect one signer's signature, tied to the exact report version they
 * reviewed. Signatures are never edited or deleted — if content changes
 * after signing, the session's report_version is bumped separately (see
 * new-version/route.ts) and fresh signatures are required at the new
 * version; the old ones stay on record under their original version.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { sessionId, reportVersion, signerName, signerRole, signatureData } = await req.json();
  if (!sessionId || !reportVersion || !signerName?.trim() || !signerRole || !signatureData) {
    return NextResponse.json({ error: "sessionId, reportVersion, signerName, signerRole, signatureData required" }, { status: 400 });
  }
  if (!["tenant", "inspector"].includes(signerRole)) {
    return NextResponse.json({ error: "signerRole must be 'tenant' or 'inspector'" }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  const { data: session } = await db.from("move_in_sessions").select("report_version").eq("id", sessionId).single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.report_version !== reportVersion) {
    return NextResponse.json({ error: "This report has changed since you loaded it — refresh and review again before signing." }, { status: 409 });
  }

  const { data, error } = await db
    .from("move_in_signatures")
    .insert({
      session_id: sessionId,
      report_version: reportVersion,
      signer_name: signerName.trim(),
      signer_role: signerRole,
      signature_data: signatureData,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("move_in_sessions").update({ status: "awaiting_signatures" }).eq("id", sessionId).eq("status", "draft");

  return NextResponse.json(data);
}
