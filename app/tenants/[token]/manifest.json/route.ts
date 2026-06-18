import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const manifest = {
    name: "My Prospera Portal",
    short_name: "My Portal",
    description: "Your tenant portal — payments, maintenance, documents & more.",
    start_url: `/tenants/${token}`,
    scope: `/tenants/${token}`,
    display: "standalone",
    background_color: "#090E17",
    theme_color: "#090E17",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
