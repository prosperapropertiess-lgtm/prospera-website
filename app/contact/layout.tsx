import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Prospera Properties. Whether you're a landlord looking for property management or a tenant with questions, we're here to help. Serving London, St. Thomas, and Strathroy, Ontario.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
