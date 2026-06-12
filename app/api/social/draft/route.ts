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

  const token = process.env.SEO_NOTIFY_SECRET;
  const approveFbUrl  = `${BASE_URL}/api/social/approve?id=${data.id}&token=${token}&platform=facebook`;
  const approveLiUrl  = `${BASE_URL}/api/social/approve?id=${data.id}&token=${token}&platform=linkedin`;
  const approveBothUrl = `${BASE_URL}/api/social/approve?id=${data.id}&token=${token}&platform=both`;
  const skipUrl       = `${BASE_URL}/api/social/approve?id=${data.id}&token=${token}&action=skip`;

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
              <p style="color:#8B2030;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Prospera Social Agent</p>
              <h1 style="color:#FAF8F5;font-size:20px;font-weight:300;margin:0;">Post ready for review</h1>
            </div>
            <div style="padding:32px;background:#FAF8F5;">
              ${imageUrl ? `<img src="${imageUrl}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:20px;" />` : ""}
              <p style="font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;">Draft</p>
              <div style="background:white;border:1px solid #E8E4DF;padding:20px;margin-bottom:28px;white-space:pre-wrap;font-size:14px;color:#2C2C2C;line-height:1.8;border-radius:6px;">${message.replace(/\n/g, "<br/>")}</div>

              <p style="font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px;">Post to:</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
                <a href="${approveBothUrl}" style="display:inline-block;padding:13px 24px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:4px;">Both →</a>
                <a href="${approveFbUrl}" style="display:inline-block;padding:13px 24px;background:#1877F2;color:#FFFFFF;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:4px;">Facebook only</a>
                <a href="${approveLiUrl}" style="display:inline-block;padding:13px 24px;background:#0A66C2;color:#FFFFFF;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:4px;">LinkedIn only</a>
                <a href="${skipUrl}" style="display:inline-block;padding:13px 20px;border:1px solid #D8D2C8;color:#9B9B9B;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-radius:4px;">Skip</a>
              </div>

              <p style="font-size:11px;color:#B0B0B0;margin:0;">Prospera Properties · London, St. Thomas &amp; Strathroy, Ontario</p>
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
