import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try Prospera Free for 60 Days | Property Management London Ontario",
  description:
    "Full property management for small landlords in London, St. Thomas, Strathroy & Sarnia. 60 days free — no lock-in. Tenant screening, rent collection, maintenance, 0 LTB filings.",
  robots: { index: false, follow: false },
};

export default function PropertyManagementLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
