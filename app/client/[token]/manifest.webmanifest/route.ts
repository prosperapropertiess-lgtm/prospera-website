import { NextResponse } from "next/server";

// Each owner's installed app opens straight to their own private dashboard.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return NextResponse.json({
    name: "My Property · Prospera",
    short_name: "My Property",
    start_url: `/client/${token}`,
    scope: `/client/${token}`,
    display: "standalone",
    background_color: "#F7F5F2",
    theme_color: "#1F2F3A",
    icons: [
      { src: "/client-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/client-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  }, { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "private, max-age=3600" } });
}
