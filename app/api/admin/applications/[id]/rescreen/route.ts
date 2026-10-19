import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { screenAndSave } from "@/lib/application-screening";

export const maxDuration = 300;

// Re-runs the AI summary on demand, e.g. after it failed or documents were replaced.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { summary, error } = await screenAndSave(id);
  if (!summary) return NextResponse.json({ error: error ?? "AI review failed" }, { status: 502 });
  return NextResponse.json({ ok: true, summary });
}
