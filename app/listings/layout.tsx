import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Available Rentals",
  description:
    "Browse rental properties managed by Prospera Properties in London, St. Thomas, and Strathroy, Ontario. Well-maintained homes with professional management.",
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
