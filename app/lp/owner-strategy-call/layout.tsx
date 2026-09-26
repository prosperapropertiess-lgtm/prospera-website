import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Owner Strategy Call | Prospera Properties",
  description:
    "For owners of 2–15 rental properties in London, St. Thomas, and Strathroy, Ontario. Prospera handles the tenants, repairs, rent, and paperwork — you keep the property, not the second job.",
  robots: { index: false, follow: false },
};

export default function OwnerStrategyCallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
