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
  // Exact-match + trailing-slash only -- a plain startsWith("/rent") would
  // also swallow the unrelated, pre-existing /rent-analysis tool.
  const isRent = pathname === "/rent" || pathname?.startsWith("/rent/");

  const isMarketComp = pathname?.startsWith("/market-comp");
  const isListingDetail = /^\/listings\/[^/]+/.test(pathname ?? "");
  const isPortal = isAdmin || isOwners || isLP || isTenants || isOnboard || isDemo || isMarketComp || isRent;

  return (
    <>
      {!isPortal && <ScrollProgress />}
      {!isPortal && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isPortal && <Footer />}
      {!isPortal && <PopupController />}
      {!isPortal && <ChatWidget />}
      {!isPortal && !isListingDetail && <StickyBottomCTA />}
      {!isPortal && <RentActivityToast />}
    </>
  );
}
