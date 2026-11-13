import type { Metadata } from "next";
import type { ReactNode } from "react";
import { poppins } from "@/app/fonts";
import "../globals.css";


export const metadata: Metadata = {
  title: "Owner Portal — Prospera Properties",
  description: "View your property performance and financials.",
  robots: { index: false, follow: false },
};

export default function OwnersLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${poppins.variable} min-h-screen`}
      style={{
        background: "#F5F4F1",
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
        // Map legacy font vars to Poppins so all existing components pick it up
        // @ts-ignore
        "--font-dm-sans": "var(--font-poppins)",
        "--font-outfit": "var(--font-poppins)",
        "--font-cormorant": "var(--font-poppins)",
        "--font-inter": "var(--font-poppins)",
      }}
    >
      {children}
    </div>
  );
}
