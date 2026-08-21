import type { Metadata } from "next";
import type { ReactNode } from "react";
import React from "react";
import { Poppins } from "next/font/google";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

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
        display: "flex",
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
        "--font-dm-sans": "var(--font-poppins)",
      } as React.CSSProperties}
    >
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  );
}
