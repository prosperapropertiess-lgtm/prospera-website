import { NextResponse } from "next/server";

// Standalone installable app for the daily sales scorecard, so it can be added
// to the home screen on its own, separate from the rest of /admin.
export async function GET() {
  return NextResponse.json(
    {
      name: "Prospera — Sales Scorecard",
      short_name: "Scorecard",
      description: "Daily new outreaches and follow-ups.",
      start_url: "/admin/scorecard",
      scope: "/admin/scorecard",
      display: "standalone",
      background_color: "#F7F5F2",
      theme_color: "#1F2F3A",
      orientation: "portrait",
      icons: [
        { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } }
  );
}
