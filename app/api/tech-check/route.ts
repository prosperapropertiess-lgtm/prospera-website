import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Called by the implementation agent to check for an approved proposal
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  // Get the most recent approved-but-not-yet-implemented proposal
  const { data, error } = await supabase
    .from("tech_proposals")
    .select("*")
    .eq("status", "approved")
    .order("decision_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({ approved: false });
  }

  return NextResponse.json({
    approved: true,
    proposal: {
      id: data.id,
      title: data.title,
      description: data.description,
      why: data.why,
      steps: JSON.parse(data.steps || "[]"),
      effort: data.effort,
      target_users: data.target_users,
    },
  });
}

// Called by the implementation agent after completing a feature
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, summary } = await req.json();

  const supabase = getSupabase();
  await supabase
    .from("tech_proposals")
    .update({ status: "implemented", implemented_at: new Date().toISOString() })
    .eq("id", id);

  // Send completion email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && summary) {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Prospera IT Agent <hello@prosperaproperties.co>",
      to: "prosperapropertiess@gmail.com",
      subject: `[IT Agent] Feature shipped — ${summary.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:#0D1B2A;padding:28px 32px;">
            <p style="color:#C5A55A;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Prospera IT Agent</p>
            <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">Feature shipped ✓</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="font-size:18px;color:#0D1B2A;font-weight:500;margin:0 0 16px;">${summary.title}</h2>
            <p style="font-size:14px;color:#2C2C2C;line-height:1.6;margin:0 0 24px;">${summary.what_was_done}</p>
            ${summary.files_changed ? `<p style="font-size:12px;color:#9B9B9B;margin:0 0 24px;">Files changed: ${summary.files_changed}</p>` : ""}
            <a href="https://www.prosperaproperties.co" style="display:inline-block;padding:12px 28px;background:#0D1B2A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">View site</a>
            <p style="font-size:11px;color:#B0B0B0;margin-top:24px;">Prospera Properties · IT Agent</p>
          </div>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
