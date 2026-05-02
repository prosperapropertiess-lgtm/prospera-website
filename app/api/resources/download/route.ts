import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resourceDownloadEmail } from "@/lib/emails";
import { upsertZohoContact } from "@/lib/zoho";

export async function POST(req: NextRequest) {
  try {
    const { name, email, resourceId, resourceTitle } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Upsert subscriber
    await supabase.from("subscribers").upsert(
      [{ email, name: name || null, type: "landlord", source: "resources_page" }],
      { onConflict: "email", ignoreDuplicates: false }
    );

    // Log the download
    await supabase.from("resource_downloads").insert([
      { email, resource_id: resourceId, resource_title: resourceTitle },
    ]).select();

    // Static map of resourceId → public PDF URL (for resources that have actual files)
    const FILE_URLS: Record<string, string> = {
      "eviction-notices": "https://www.prosperaproperties.co/forms/N4-clean.pdf",
      "ontario-standard-lease": "https://www.ontario.ca/laws/statute/06r17",
    };

    // Send download email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && resourceId) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const fileUrl = FILE_URLS[resourceId] || null;
        const { subject, html } = resourceDownloadEmail(name, resourceId, resourceTitle, fileUrl);

        await resend.emails.send({
          from: "Ebin at Prospera <hello@prosperaproperties.co>",
          to: email,
          subject,
          html,
        });
      } catch {
        // Don't block on email failure
      }
    }

    // Add to Zoho CRM
    try {
      await upsertZohoContact({
        email,
        name,
        type: "landlord",
        source: "resources_page",
        note: `Downloaded: ${resourceTitle}`,
      });
    } catch {
      // Don't block on CRM failure
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
