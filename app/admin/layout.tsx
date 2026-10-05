import type { Metadata } from "next";
import type { ReactNode } from "react";
import React from "react";
import { Poppins } from "next/font/google";
import AdminTopBar from "./AdminTopBar";

// Fallback title for any admin route without its own more specific
// layout.tsx (e.g. the homepage, and deep dynamic detail pages that
// inherit their section's title rather than needing their own).
export const metadata: Metadata = { title: "Prospera Admin", robots: { index: false, follow: false } };

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={poppins.variable}
      style={{
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
        "--font-dm-sans": "var(--font-poppins)",
      } as React.CSSProperties}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <AdminTopBar />
      <main>{children}</main>
    </div>
  );
}
