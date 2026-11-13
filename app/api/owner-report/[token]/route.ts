import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { applicationIdFromOwnerToken, ownerDecision } from "@/lib/application-pipeline";

// The owner's one tap from their report link: conditionally approve or decline.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = applicationIdFromOwnerToken(token);
  if (!id) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  if (b.decision !== "approved" && b.decision !== "declined") return NextResponse.json({ error: "Pick approve or decline." }, { status: 400 });
  const { data: a } = await getSupabaseAdmin().from("applications").select("stage").eq("id", id).maybeSingle();
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (a.stage !== "sent_to_owner") return NextResponse.json({ error: "A decision has already been recorded. Call or text Ebin to change it." }, { status: 409 });
  await ownerDecision(id, b.decision, typeof b.note === "string" ? b.note.slice(0, 1000) : null, "owner");
  return NextResponse.json({ ok: true });
}
