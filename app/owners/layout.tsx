import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
