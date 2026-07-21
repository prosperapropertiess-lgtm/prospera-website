import type { Metadata } from "next";
import FreedomScoreResults from "@/components/ui/PropertyFreedomScore/Results";

export const metadata: Metadata = {
  title: "Your Property Freedom Score™ | Prospera Properties",
  description: "Your personalized landlord freedom score, breakdown, and action plan.",
  robots: { index: false, follow: false },
};

export default function FreedomScoreResultsPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>
      <div className="pt-24 pb-20 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <FreedomScoreResults />
        </div>
      </div>
    </div>
  );
}
