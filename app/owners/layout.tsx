import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Inter } from "next/font/google";
import "../globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Owner Portal — Prospera Properties",
  description: "View your property performance and financials.",
  robots: { index: false, follow: false },
};

export default function OwnersLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${outfit.variable} ${inter.variable} min-h-screen`}
      style={{
        background: "linear-gradient(135deg, #0f1624 0%, #141b2c 40%, #1a1029 100%)",
        fontFamily: "var(--font-inter), -apple-system, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
