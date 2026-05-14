import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const token = searchParams.get("token");

  if (!id || !token || !["approve", "deny"].includes(action ?? "")) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const supabase = getSupabase();

  // Verify the per-record approval token (not the shared agent secret)
  const { data: proposal } = await supabase
    .from("tech_proposals")
    .select("id, approval_token, status")
    .eq("id", id)
    .maybeSingle();

  if (!proposal || proposal.approval_token !== token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (proposal.status !== "pending") {
    return new NextResponse("Already decided", { status: 409 });
  }

  const { data, error } = await supabase
    .from("tech_proposals")
    .update({
      status: action === "approve" ? "approved" : "denied",
      decision_at: new Date().toISOString(),
      approval_token: null, // invalidate after use
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return new NextResponse("Failed to update", { status: 500 });

  const approved = action === "approve";

  // ── On approval: immediately trigger the build agent (non-blocking) ───────
  if (approved) {
    const base = req.nextUrl.origin;
    fetch(`${base}/api/tech-build`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-notify-secret": process.env.SEO_NOTIFY_SECRET ?? "",
      },
      body: JSON.stringify({ proposalId: id }),
    }).catch((err) => console.error("[tech-decision] Build trigger failed:", err));
  }

  return new NextResponse(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${approved ? "Building now" : "Denied"} — Prospera CTO</title>
  <style>
    body { font-family: sans-serif; background: #FAF8F5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; border: 1px solid #E8E4DF; padding: 52px 48px; max-width: 480px; text-align: center; }
    .icon { width: 56px; height: 56px; background: #1F2F3A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 20px; }
    h1 { color: #1F2F3A; font-weight: 300; font-size: 28px; margin: 0 0 8px; }
    .title { font-weight: 600; color: #1F2F3A; font-size: 15px; margin: 0 0 16px; }
    p { color: #5A5A5A; font-size: 14px; margin: 0 0 28px; line-height: 1.6; }
    a { display: inline-block; padding: 12px 28px; background: #1F2F3A; color: #FAF8F5; text-decoration: none; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${approved ? "⟳" : "✕"}</div>
    <h1>${approved ? "Building now." : "Denied."}</h1>
    <p class="title">${data?.title ?? ""}</p>
    <p>${approved
      ? "The CTO agent is generating the implementation. You'll get an email with the Claude Code prompt in ~30 seconds."
      : "Got it. The CTO agent will propose something different next Monday."
    }</p>
    <a href="https://www.prosperaproperties.co">← Back to site</a>
  </div>
</body>
</html>`, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
