import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-notify-secret");
    if (secret !== process.env.SEO_NOTIFY_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, why, risks, mitigation, steps, effort, target_users, performance_notes } = body;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tech_proposals")
      .insert([{
        title,
        description,
        why,
        risks,
        mitigation,
        steps: JSON.stringify(steps),
        effort,
        target_users,
        performance_notes,
        status: "pending",
        week_of: new Date().toISOString().split("T")[0],
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const base = "https://www.prosperaproperties.co";
    const approveUrl = `${base}/api/tech-decision?id=${data.id}&action=approve&token=${process.env.SEO_NOTIFY_SECRET}`;
    const denyUrl = `${base}/api/tech-decision?id=${data.id}&action=deny&token=${process.env.SEO_NOTIFY_SECRET}`;

    const stepsList = (steps as string[]).map((s: string, i: number) =>
      `<tr><td style="padding:6px 0;border-bottom:1px solid #F0EBE5;font-size:13px;color:#2C2C2C;"><strong style="color:#0D1B2A;">${i + 1}.</strong> ${s}</td></tr>`
    ).join("");

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2C2C2C;">
        <div style="background:#0D1B2A;padding:28px 32px;">
          <p style="color:#C5A55A;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Prospera IT Agent</p>
          <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">Weekly Feature Proposal</h1>
        </div>

        <div style="padding:32px;">
          <h2 style="font-size:20px;color:#0D1B2A;font-weight:500;margin:0 0 4px;">${title}</h2>
          <p style="font-size:12px;color:#9B9B9B;margin:0 0 24px;">For: ${target_users} &nbsp;·&nbsp; Effort: ${effort}</p>

          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7B1C1C;margin:0 0 8px;">What it does</h3>
          <p style="font-size:14px;color:#2C2C2C;margin:0 0 20px;line-height:1.6;">${description}</p>

          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7B1C1C;margin:0 0 8px;">Why it's valuable</h3>
          <p style="font-size:14px;color:#2C2C2C;margin:0 0 20px;line-height:1.6;">${why}</p>

          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7B1C1C;margin:0 0 8px;">Risks</h3>
          <p style="font-size:14px;color:#2C2C2C;margin:0 0 20px;line-height:1.6;">${risks}</p>

          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7B1C1C;margin:0 0 8px;">Risk mitigation</h3>
          <p style="font-size:14px;color:#2C2C2C;margin:0 0 20px;line-height:1.6;">${mitigation}</p>

          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7B1C1C;margin:0 0 8px;">Implementation steps</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${stepsList}</table>

          ${performance_notes ? `
          <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7B1C1C;margin:0 0 8px;">Performance & efficiency notes</h3>
          <p style="font-size:13px;color:#5A5A5A;margin:0 0 24px;line-height:1.6;padding:12px;background:#F5F0EB;">${performance_notes}</p>
          ` : ""}

          <div style="border-top:1px solid #E8E4DF;padding-top:24px;display:flex;gap:12px;">
            <a href="${approveUrl}" style="display:inline-block;padding:14px 32px;background:#0D1B2A;color:#FAF8F5;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;margin-right:12px;">
              ✓ Approve — Build it
            </a>
            <a href="${denyUrl}" style="display:inline-block;padding:14px 32px;background:#F5F0EB;color:#7B1C1C;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #7B1C1C;">
              ✕ Deny — Skip this week
            </a>
          </div>

          <p style="font-size:11px;color:#B0B0B0;margin-top:24px;">
            You have until 6pm UTC today to decide. If no decision is made, the implementation agent will skip this week.<br/>
            Prospera Properties · IT Agent · prosperaproperties.co
          </p>
        </div>
      </div>
    `;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Prospera IT Agent <hello@prosperaproperties.co>",
        to: "prosperapropertiess@gmail.com",
        subject: `[IT Agent] Proposal: ${title}`,
        html,
      });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("tech-propose error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
