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
  title: "My Portal — Prospera Properties",
  description: "Your tenant portal — payments, documents, maintenance & more.",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Portal",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function TenantsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${cormorant.variable} ${dmSans.variable}`}
      style={{
        minHeight: "100vh",
        background: "#F5F4F1",
        fontFamily: "var(--font-dm-sans), -apple-system, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
