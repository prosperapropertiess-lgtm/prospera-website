import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

// Own manifest + iOS web-app meta so "Add to Home Screen" installs the scorecard
// as its own app, not the whole /admin section.
export const metadata: Metadata = {
  title: { absolute: "Sales Scorecard — Prospera" },
  manifest: "/admin/scorecard/manifest.json",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Scorecard", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#1F2F3A" };

export default function ScorecardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
