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
  const id       = searchParams.get("id");
  const token    = searchParams.get("token");
  const action   = searchParams.get("action") || "post";
  const platform = searchParams.get("platform") || "both"; // facebook | linkedin | both

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
    return new NextResponse(
      html("Already handled", `This post was already ${draft.status}.`, draft.slug, []),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (action === "skip") {
    await supabase.from("social_drafts").update({ status: "skipped" }).eq("id", id);
    return new NextResponse(
      html("Skipped", "Post was skipped. The agent won't try this one again.", draft.slug, []),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const results: string[] = [];
  const errors:  string[] = [];

  // ── Post to Facebook ───────────────────────────────────────────────────────
  if (platform === "facebook" || platform === "both") {
    const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
    const pageId    = process.env.META_PAGE_ID;

    if (!pageToken || !pageId) {
      errors.push("Facebook credentials not configured");
    } else {
      try {
        const caption = draft.link ? `${draft.message}\n\n${draft.link}` : draft.message;
        let fbRes;

        if (draft.image_url) {
          const body = new URLSearchParams({ url: draft.image_url, caption, access_token: pageToken });
          fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, { method: "POST", body });
        } else {
          const body = new URLSearchParams({
            message: caption,
            access_token: pageToken,
            ...(draft.link ? { link: draft.link } : {}),
          });
          fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, { method: "POST", body });
        }

        const fbData = await fbRes.json();
        if (!fbRes.ok || fbData.error) {
          errors.push(`Facebook: ${fbData.error?.message ?? "Unknown error"}`);
        } else {
          results.push("Facebook");
        }
      } catch (err) {
        errors.push(`Facebook: ${String(err)}`);
      }
    }
  }

  // ── Post to LinkedIn ───────────────────────────────────────────────────────
  if (platform === "linkedin" || platform === "both") {
    const liToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const liOrgId = process.env.LINKEDIN_ORGANIZATION_ID; // urn:li:organization:XXXXX

    if (!liToken || !liOrgId) {
      errors.push("LinkedIn credentials not configured");
    } else {
      try {
        const body: Record<string, unknown> = {
          author: `urn:li:organization:${liOrgId}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: draft.message },
              shareMediaCategory: draft.link ? "ARTICLE" : "NONE",
              ...(draft.link ? {
                media: [{
                  status: "READY",
                  originalUrl: draft.link,
                }],
              } : {}),
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        };

        const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${liToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify(body),
        });

        const liData = await liRes.json();
        if (!liRes.ok) {
          errors.push(`LinkedIn: ${liData.message ?? JSON.stringify(liData)}`);
        } else {
          results.push("LinkedIn");
        }
      } catch (err) {
        errors.push(`LinkedIn: ${String(err)}`);
      }
    }
  }

  // ── Update status ──────────────────────────────────────────────────────────
  const newStatus = results.length > 0 ? "posted" : "failed";
  await supabase.from("social_drafts").update({ status: newStatus }).eq("id", id);

  if (results.length === 0) {
    return new NextResponse(
      html("Post failed", `Errors: ${errors.join(" | ")}`, draft.slug, []),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    html(
      `Posted to ${results.join(" & ")} ✓`,
      `Your post is now live on ${results.join(" and ")}.${errors.length ? ` (${errors.join("; ")})` : ""}`,
      draft.slug,
      results
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function html(title: string, body: string, slug: string, platforms: string[]): string {
  const links = [
    platforms.includes("Facebook") ? `<a href="https://www.facebook.com/381380218388134" target="_blank" style="display:inline-block;padding:12px 24px;background:#1877F2;color:#fff;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:4px;margin-right:8px;">View on Facebook →</a>` : "",
    platforms.includes("LinkedIn") ? `<a href="https://www.linkedin.com/company/prospera-properties" target="_blank" style="display:inline-block;padding:12px 24px;background:#0A66C2;color:#fff;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:4px;">View on LinkedIn →</a>` : "",
  ].filter(Boolean).join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title} — Prospera Social</title>
    <style>
      body { font-family: sans-serif; background: #FAF8F5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .card { background: white; border: 1px solid #E8E4DF; padding: 48px; max-width: 480px; text-align: center; border-radius: 8px; }
      h1 { color: #1F2F3A; font-weight: 300; font-size: 28px; margin: 0 0 12px; }
      p { color: #5A5A5A; font-size: 14px; margin: 0 0 28px; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${title}</h1>
      <p>${body}</p>
      ${links || `<a href="https://www.prosperaproperties.co" style="display:inline-block;padding:12px 24px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:4px;">Back to site</a>`}
    </div>
  </body>
</html>`;
}
