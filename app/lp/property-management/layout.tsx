import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Rental Analysis for London, Ontario Landlords — Prospera Properties",
  description: "Get a free rental analysis for your property, access our complete landlord resource centre, and book a no-obligation strategy call. Serving London, St. Thomas, and Strathroy.",
  robots: { index: false, follow: false },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
