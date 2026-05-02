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

  if (token !== process.env.SEO_NOTIFY_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!id || !["approve", "deny"].includes(action ?? "")) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tech_proposals")
    .update({
      status: action === "approve" ? "approved" : "denied",
      decision_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return new NextResponse("Failed to update", { status: 500 });

  const approved = action === "approve";

  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${approved ? "Approved" : "Denied"} — Prospera IT Agent</title>
        <style>
          body { font-family: sans-serif; background: #FAF8F5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: white; border: 1px solid #E8E4DF; padding: 48px; max-width: 480px; text-align: center; }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h1 { color: #0D1B2A; font-weight: 300; font-size: 28px; margin: 0 0 8px; }
          p { color: #5A5A5A; font-size: 14px; margin: 0 0 24px; line-height: 1.6; }
          .feature { font-weight: 500; color: #0D1B2A; }
          a { color: #7B1C1C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${approved ? "✓" : "✕"}</div>
          <h1>${approved ? "Feature approved." : "Feature denied."}</h1>
          <p class="feature">${data?.title ?? ""}</p>
          <p>${approved
            ? "The IT agent will build this today. You'll get a completion email when it's done."
            : "Got it. The IT agent will propose something else next Wednesday."
          }</p>
          <a href="https://www.prosperaproperties.co">← Back to site</a>
        </div>
      </body>
    </html>
  `, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
