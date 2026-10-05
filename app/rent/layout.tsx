import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Find Your Next Rental | Prospera Properties",
  description:
    "Tell Prospera what you're looking for once. We'll help match you with rentals in London, Ontario as they become available.",
};

export default function RentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
