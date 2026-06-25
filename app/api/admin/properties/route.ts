import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getSupabaseAdmin } from "@/lib/supabase";
import { newPropertyAgentEmail } from "@/lib/emails";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const status = body.status || "draft";
  const { data, error } = await supabase.from("properties").insert([{
    ...body,
    is_managed: true,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    last_saved_at: new Date().toISOString(),
  }]).select().single();
  if (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Move photos from properties/new/ to properties/{id}/ in storage
  if (data && data.images?.length) {
    const movedUrls: string[] = [];
    for (const url of data.images as string[]) {
      if (url.includes("/properties/new/")) {
        const oldPath = url.split("/property-images/")[1];
        if (oldPath) {
          const filename = oldPath.split("/").pop()!;
          const newPath = `properties/${data.id}/${filename}`;
          const { error: moveErr } = await supabase.storage.from("property-images").move(oldPath, newPath);
          if (!moveErr) {
            const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(newPath);
            movedUrls.push(publicUrl);
          } else {
            movedUrls.push(url); // keep original if move fails
          }
        } else {
          movedUrls.push(url);
        }
      } else {
        movedUrls.push(url);
      }
    }
    // Update the property with corrected image URLs
    await supabase.from("properties").update({ images: movedUrls }).eq("id", data.id);
    data.images = movedUrls;
  }

  // Notify all active agents about the new property (only when published, non-blocking)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && data && data.status === "published") {
    (async () => {
      try {
        const { data: agents } = await supabaseAdmin
          .from("agents")
          .select("id, name, email")
          .eq("is_active", true);

        if (!agents?.length) return;

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await Promise.all(
          agents.map((agent) =>
            resend.emails.send({
              from: "Prospera Properties <hello@prosperaproperties.co>",
              to: agent.email,
              cc: ["prosperapropertiess@gmail.com"],
              subject: `New property available — ${data.address}, ${data.city}`,
              html: newPropertyAgentEmail({
                agentName: agent.name,
                propertyAddress: data.address ?? "",
                propertyCity: data.city ?? "",
                bedrooms: data.bedrooms ?? 0,
                bathrooms: data.bathrooms ?? 0,
                price: Number(data.price ?? 0),
                propertyId: data.id,
                agentId: agent.id,
              }),
            }).catch((err: unknown) =>
              console.error(`[properties] Agent notification failed for ${agent.email}:`, err)
            )
          )
        );
      } catch (err) {
        console.error("[properties] Agent notification batch failed:", err);
      }
    })();
  }

  return NextResponse.json(data, { status: 201 });
}
