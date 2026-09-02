import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free 17-Point Lease Addendum for Ontario Landlords | Prospera Properties",
  description: "Download the free 17-point lease addendum used by Prospera Properties across London, Strathroy, and St. Thomas, tested against real Ontario tenant scenarios.",
  robots: { index: false, follow: false },
};

export default function LeaseAddendumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
