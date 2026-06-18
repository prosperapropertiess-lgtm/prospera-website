import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant, DM_Sans } from "next/font/google";
import "../globals.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${cormorant.variable} ${dmSans.variable} min-h-screen`}
      style={{
        background: "#F5F4F1",
        fontFamily: "var(--font-dm-sans), -apple-system, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
