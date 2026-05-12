import { NextRequest, NextResponse } from "next/server";
import { getAgentFromRequest } from "@/lib/agent-auth";
import { supabaseAdmin } from "@/lib/supabase";
import JSZip from "jszip";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const agent = await getAgentFromRequest(req);
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: property, error } = await supabaseAdmin
    .from("properties")
    .select("title, address, images")
    .eq("id", id)
    .eq("is_managed", true)
    .maybeSingle();

  if (error || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const images: string[] = property.images ?? [];
  if (images.length === 0) {
    return NextResponse.json({ error: "No images available for this property" }, { status: 404 });
  }

  const zip = new JSZip();
  const folder = zip.folder("photos") as JSZip;

  // Fetch all images in parallel
  await Promise.all(
    images.map(async (url, i) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const buffer = await res.arrayBuffer();
        const ext = url.split(".").pop()?.split("?")[0] ?? "jpg";
        folder.file(`photo-${i + 1}.${ext}`, buffer);
      } catch {
        // skip failed image
      }
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
  const safeName = (property.address ?? "property").replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return new NextResponse(zipBuffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}-photos.zip"`,
    },
  });
}
