import { NextRequest, NextResponse } from "next/server";

// Called by the social media agent to post to Facebook
// Keeps Meta credentials off the agent — they stay in Vercel env vars
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;

  if (!pageToken || !pageId) {
    return NextResponse.json({ error: "Meta credentials not configured" }, { status: 500 });
  }

  const { message, imageUrl, link } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    let fbResponse;

    if (imageUrl) {
      // Post with photo
      const body = new URLSearchParams({
        url: imageUrl,
        caption: link ? `${message}\n\n${link}` : message,
        access_token: pageToken,
      });

      fbResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        { method: "POST", body }
      );
    } else {
      // Text post (with optional link)
      const body = new URLSearchParams({
        message: link ? `${message}\n\n${link}` : message,
        access_token: pageToken,
        ...(link ? { link } : {}),
      });

      fbResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        { method: "POST", body }
      );
    }

    const result = await fbResponse.json();

    if (!fbResponse.ok || result.error) {
      console.error("Facebook API error:", result.error);
      return NextResponse.json(
        { error: result.error?.message || "Facebook API error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, postId: result.id || result.post_id });
  } catch (err) {
    console.error("Social post error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
