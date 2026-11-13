import type { Metadata } from "next";
import type { ReactNode } from "react";
import { poppins } from "@/app/fonts";
import "../globals.css";


export const metadata: Metadata = {
  title: "Onboarding — Prospera Properties",
  robots: { index: false, follow: false },
};

export default function OnboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${poppins.variable} min-h-screen`}
      style={{
        background: "#F5F4F1",
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
        // @ts-ignore
        "--font-dm-sans": "var(--font-poppins)",
      }}
    >
      {children}
    </div>
  );
}
