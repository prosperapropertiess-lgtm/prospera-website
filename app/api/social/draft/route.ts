import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const BASE_URL = "https://www.prosperaproperties.co";

// Called by the social agent to save a draft and email it for approval
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, message, imageUrl, link } = await req.json();

  if (!slug || !message) {
    return NextResponse.json({ error: "slug and message required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("social_drafts")
    .insert([{ slug, message, image_url: imageUrl || null, link: link || null }])
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }

  const approveUrl = `${BASE_URL}/api/social/approve?id=${data.id}&token=${process.env.SEO_NOTIFY_SECRET}`;
  const token = process.env.SEO_NOTIFY_SECRET;

  // Email preview to Ebin
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Prospera Social Agent <hello@prosperaproperties.co>",
        to: "prosperapropertiess@gmail.com",
        subject: `[Social] Draft ready — ${slug}`,
        html: `
          <div style="font-family:sans-serif;max-width:580px;margin:0 auto;">
            <div style="background:#1F2F3A;padding:24px 32px;">
              <p style="color:#6A2E35;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Prospera Social Agent</p>
              <h1 style="color:#FAF8F5;font-size:20px;font-weight:300;margin:0;">Facebook post ready for review</h1>
            </div>
            <div style="padding:32px;background:#FAF8F5;">
              ${imageUrl ? `<img src="${imageUrl}" style="width:100%;height:200px;object-fit:cover;margin-bottom:20px;" />` : ""}
              <p style="font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;">Draft Caption</p>
              <div style="background:white;border:1px solid #E8E4DF;padding:20px;margin-bottom:24px;white-space:pre-wrap;font-size:14px;color:#2C2C2C;line-height:1.7;">${message.replace(/\n/g, "<br/>")}</div>
              <a href="${approveUrl}" style="display:inline-block;padding:14px 32px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-right:12px;">Post it →</a>
              <a href="${BASE_URL}/api/social/approve?id=${data.id}&token=${token}&action=skip" style="display:inline-block;padding:14px 24px;border:1px solid #E8E4DF;color:#9B9B9B;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Skip</a>
              <p style="margin-top:24px;font-size:12px;color:#9B9B9B;">Post will go to: <a href="${link || BASE_URL}" style="color:#7B1C1C;">${link || BASE_URL}</a></p>
            </div>
          </div>
        `,
      });
    } catch {
      // Don't block on email failure
    }
  }

  return NextResponse.json({ success: true, draftId: data.id });
}
