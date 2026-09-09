import { NextResponse } from "next/server";

// Standalone installable app for the Business Numbers dashboard, so it can be
// added to the home screen / taskbar on its own — separate from the rest of /admin.
export async function GET() {
  return NextResponse.json(
    {
      name: "Prospera — Business Numbers",
      short_name: "Numbers",
      description: "Prospera Properties — revenue, profit, expenses and runway.",
      start_url: "/admin/ceo",
      scope: "/admin/ceo",
      display: "standalone",
      background_color: "#F7F5F2",
      theme_color: "#1F2F3A",
      orientation: "any",
      icons: [
        { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
