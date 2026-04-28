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

    // Send download email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && resourceId) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        // Fetch the file URL from Supabase
        const { data: resource } = await supabase
          .from("resources")
          .select("file_url, title")
          .eq("id", resourceId)
          .single();

        if (resource?.file_url) {
          const { subject, html } = resourceDownloadEmail(
            name,
            resourceId,
            resource.title || resourceTitle,
            resource.file_url
          );

          await resend.emails.send({
            from: "Ebin at Prospera <hello@prosperaproperties.co>",
            to: email,
            subject,
            html,
          });
        }
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
