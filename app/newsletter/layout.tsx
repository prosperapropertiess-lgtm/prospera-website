import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to the Prospera Properties newsletter. Get landlord tips, Ontario rental market updates, and property management insights delivered to your inbox.",
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
