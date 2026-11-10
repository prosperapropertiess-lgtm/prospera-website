import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: { absolute: "Prospera FieldOps" }, robots: { index: false, follow: false }, manifest: "/team-manifest.webmanifest" };
export const viewport: Viewport = { themeColor: "#1F2F3A" };

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
