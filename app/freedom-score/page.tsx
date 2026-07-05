import type { Metadata } from "next";
import PropertyFreedomScore from "@/components/ui/PropertyFreedomScore";

export const metadata: Metadata = {
  title: "Property Freedom Score™ | Prospera Properties",
  description:
    "Free 3-minute assessment for Ontario landlords. Discover how dependent your rental portfolio is on your personal involvement — and get a personalized action plan.",
};

export default function FreedomScorePage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>
      <div className="pt-24 pb-20 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <PropertyFreedomScore />
        </div>
      </div>
    </div>
  );
}
