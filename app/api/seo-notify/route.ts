import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-notify-secret");
    if (secret !== process.env.SEO_NOTIFY_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { posts } = await req.json() as { posts: { title: string; slug: string; category: string }[] };

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: "No Resend key" }, { status: 500 });

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const postRows = posts
      .map(
        (p) =>
          `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #E8E4DF;">
              <a href="https://www.prosperaproperties.co/blog/${p.slug}" style="color:#0D1B2A;font-weight:500;text-decoration:none;">${p.title}</a>
              <span style="display:block;font-size:11px;color:#9B9B9B;margin-top:2px;">${p.category} · prosperaproperties.co/blog/${p.slug}</span>
            </td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2C2C2C;">
        <div style="background:#0D1B2A;padding:28px 32px;">
          <p style="color:#C5A55A;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Prospera SEO Agent</p>
          <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">New posts published</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#5A5A5A;font-size:14px;margin:0 0 20px;">Your weekly SEO agent just ran. Here's what was published:</p>
          <table style="width:100%;border-collapse:collapse;">
            ${postRows}
          </table>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #E8E4DF;">
            <a href="https://www.prosperaproperties.co/blog" style="display:inline-block;padding:10px 24px;background:#0D1B2A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">View Blog</a>
          </div>
          <p style="font-size:11px;color:#B0B0B0;margin-top:24px;">Prospera Properties · London, St. Thomas & Strathroy, Ontario</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Prospera SEO Agent <hello@prosperaproperties.co>",
      to: "prosperapropertiess@gmail.com",
      subject: `${posts.length} new blog post${posts.length > 1 ? "s" : ""} published — Prospera`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("seo-notify error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
