import type { Metadata } from "next";
import type { ReactNode } from "react";

// Own manifest + iOS web-app meta so "Add to Home Screen" installs the Business
// Numbers dashboard as its own app, not the whole /admin section.
export const metadata: Metadata = {
  title: "Business Numbers — Prospera",
  manifest: "/admin/ceo/manifest.json",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "Numbers",
    statusBarStyle: "default",
  },
};

export default function CeoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
