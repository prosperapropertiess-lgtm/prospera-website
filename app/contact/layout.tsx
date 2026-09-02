import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Prospera Properties. Landlords looking for property management and tenants with questions can both reach us directly. Serving London, St. Thomas, and Strathroy, Ontario.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
