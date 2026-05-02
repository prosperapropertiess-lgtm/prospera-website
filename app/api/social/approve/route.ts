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
  const token = searchParams.get("token");
  const action = searchParams.get("action") || "post";

  if (token !== process.env.SEO_NOTIFY_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const supabase = getSupabase();

  const { data: draft, error } = await supabase
    .from("social_drafts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !draft) {
    return new NextResponse("Draft not found", { status: 404 });
  }

  if (draft.status !== "pending") {
    return new NextResponse(html("Already handled", `This post was already ${draft.status}.`, ""), {
      headers: { "Content-Type": "text/html" },
    });
  }

  if (action === "skip") {
    await supabase.from("social_drafts").update({ status: "skipped" }).eq("id", id);
    return new NextResponse(html("Skipped", "Post was skipped. The agent won't try this one again.", draft.slug), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Post to Facebook
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;

  if (!pageToken || !pageId) {
    return new NextResponse("Meta credentials not configured", { status: 500 });
  }

  try {
    let fbResponse;
    const caption = draft.link ? `${draft.message}\n\n${draft.link}` : draft.message;

    if (draft.image_url) {
      const body = new URLSearchParams({
        url: draft.image_url,
        caption,
        access_token: pageToken,
      });
      fbResponse = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: "POST",
        body,
      });
    } else {
      const body = new URLSearchParams({
        message: caption,
        access_token: pageToken,
        ...(draft.link ? { link: draft.link } : {}),
      });
      fbResponse = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: "POST",
        body,
      });
    }

    const result = await fbResponse.json();

    if (!fbResponse.ok || result.error) {
      await supabase.from("social_drafts").update({ status: "failed" }).eq("id", id);
      return new NextResponse(
        html("Post failed", `Facebook returned an error: ${result.error?.message || "Unknown error"}`, draft.slug),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    await supabase.from("social_drafts").update({ status: "posted" }).eq("id", id);

    return new NextResponse(
      html("Posted ✓", "Your post is live on the Prospera Properties Facebook Page.", draft.slug),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}

function html(title: string, body: string, slug: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title} — Prospera Social</title>
    <style>
      body { font-family: sans-serif; background: #FAF8F5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .card { background: white; border: 1px solid #E8E4DF; padding: 48px; max-width: 480px; text-align: center; }
      h1 { color: #0D1B2A; font-weight: 300; font-size: 28px; margin: 0 0 12px; }
      p { color: #5A5A5A; font-size: 14px; margin: 0 0 24px; line-height: 1.6; }
      a { display: inline-block; padding: 12px 28px; background: #0D1B2A; color: #FAF8F5; text-decoration: none; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${title}</h1>
      <p>${body}</p>
      <a href="https://www.facebook.com/profile.php?id=100083220997935" target="_blank">View Facebook Page →</a>
    </div>
  </body>
</html>`;
}
