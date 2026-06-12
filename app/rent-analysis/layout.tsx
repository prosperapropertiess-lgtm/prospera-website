import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Rent Analysis",
  description:
    "Get a free rent analysis for your property in London, St. Thomas, or Strathroy, Ontario. See what similar units are renting for and what your property is worth.",
};

export default function RentAnalysisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
