import type { Metadata } from "next";
import FitForm from "@/components/fit/FitForm";

export const metadata: Metadata = {
  title: "Tell Us About Your Property | Prospera Properties",
  robots: { index: false, follow: false },
};

export default function FitPage() {
  return <FitForm />;
}
