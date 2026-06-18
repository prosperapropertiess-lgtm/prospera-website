"use client";

import { useEffect } from "react";
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
  const isTenants = pathname?.startsWith("/tenants");

  useEffect(() => {
    if (isLP || isAdmin || isOwners || isTenants) return;

    let lenis: import("@studio-freight/lenis").default | null = null;
    let raf: number;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
        orientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      function tick(time: number) {
        lenis!.raf(time);
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [isLP, isAdmin, isOwners, isTenants]);

  const isPortal = isAdmin || isOwners || isLP || isTenants;

  return (
    <>
      {!isPortal && <ScrollProgress />}
      {!isPortal && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isPortal && <Footer />}
      {!isPortal && <PopupController />}
      {!isPortal && <ChatWidget />}
      {!isPortal && <StickyBottomCTA />}
      {!isPortal && <RentActivityToast />}
    </>
  );
}
