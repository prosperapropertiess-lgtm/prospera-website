import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Send download email if Resend configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && resourceId) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        // Fetch the resource file URL from Supabase
        const { data: resource } = await supabase
          .from("resources")
          .select("file_url, title")
          .eq("id", resourceId)
          .single();

        if (resource?.file_url) {
          await resend.emails.send({
            from: "Prospera Properties <hello@prosperaproperties.co>",
            to: email,
            subject: `Your download: ${resource.title}`,
            html: `<p>Hi ${name || "there"},</p><p>Here's your download: <a href="${resource.file_url}">${resource.title}</a></p><p>If you have any questions about your rental property, feel free to <a href="https://www.prosperaproperties.co/contact">reach out anytime</a>.</p><p>— Ebin, Prospera Properties</p>`,
          });
        }
      } catch {
        // Don't block on email failure
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
