import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "../../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${poppins.variable} min-h-screen`}
      style={{
        background: "#F5F4F1",
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
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
