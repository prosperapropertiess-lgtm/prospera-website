import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prospera Platform — Landlording Made Easy",
  description:
    "The app Ontario landlords with 1–5 properties have been waiting for. Rent collection, AI maintenance, auto N4s, tenant portal. 90 days free. Join the waitlist.",
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
