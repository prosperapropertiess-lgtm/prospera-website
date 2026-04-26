"use client";

import { usePathname } from "next/navigation";
import NewsletterPopup from "./NewsletterPopup";

const TENANT_PATHS = ["/listings", "/tenants"];
const LANDLORD_PATHS = ["/landlords", "/pricing", "/about", "/areas", "/blog"];
const EXCLUDED_PATHS = ["/contact", "/api", "/admin"];

export default function PopupController() {
  const pathname = usePathname();

  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return null;

  if (TENANT_PATHS.some((p) => pathname.startsWith(p))) {
    return <NewsletterPopup variant="tenant" delayMs={25000} />;
  }

  if (LANDLORD_PATHS.some((p) => pathname.startsWith(p))) {
    return <NewsletterPopup variant="landlord" delayMs={30000} />;
  }

  // Homepage — show landlord popup after 45s
  return <NewsletterPopup variant="landlord" delayMs={45000} />;
}
