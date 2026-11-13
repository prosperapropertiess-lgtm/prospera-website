"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PopupController = dynamic(() => import("@/components/ui/PopupController"), { ssr: false });
const ChatWidget = dynamic(() => import("@/components/ui/ChatWidget"), { ssr: false });
const ScrollProgress = dynamic(() => import("@/components/ui/ScrollProgress"), { ssr: false });
const StickyBottomCTA = dynamic(() => import("@/components/ui/StickyBottomCTA"), { ssr: false });
const RentActivityToast = dynamic(() => import("@/components/ui/RentActivityToast"), { ssr: false });

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isOwners = pathname?.startsWith("/owners");
  const isLP = pathname?.startsWith("/lp");
  const isDemo = pathname?.startsWith("/demo");
  const isTenants = pathname?.startsWith("/tenants");
  const isOnboard = pathname?.startsWith("/onboard");
  const isFit = pathname === "/fit" || pathname?.startsWith("/fit/");
  // Exact-match + trailing-slash only -- a plain startsWith("/rent") would
  // also swallow the unrelated, pre-existing /rent-analysis tool.
  const isRent = pathname === "/rent" || pathname?.startsWith("/rent/");

  const isMarketComp = pathname?.startsWith("/market-comp");
  const isView = pathname === "/view" || pathname?.startsWith("/view/");
  // The rental application is a focused form like /view: no site menu, footer or pop-ups.
  const isApply = pathname === "/apply" || pathname?.startsWith("/apply/") || pathname?.startsWith("/brief/");
  const isFieldOps = pathname?.startsWith("/book/") || pathname === "/team" || pathname?.startsWith("/team/");
  const isListingDetail = /^\/listings\/[^/]+/.test(pathname ?? "");
  // The rent report keeps the site header and footer but none of the pop-ups.
  const isReport = pathname === "/rent-report" || pathname?.startsWith("/rent-report/");
  const isPortal = isAdmin || isOwners || isLP || isTenants || isOnboard || isFit || isDemo || isMarketComp || isRent || isView || isApply || isFieldOps;

  return (
    <>
      {!isPortal && !isReport && <ScrollProgress />}
      {!isPortal && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isPortal && <Footer />}
      {!isPortal && !isReport && <PopupController />}
      {!isPortal && !isReport && <ChatWidget />}
      {!isPortal && !isListingDetail && !isReport && <StickyBottomCTA />}
      {!isPortal && !isReport && <RentActivityToast />}
    </>
  );
}
