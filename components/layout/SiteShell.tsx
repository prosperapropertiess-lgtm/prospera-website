"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PopupController = dynamic(() => import("@/components/ui/PopupController"), { ssr: false });
const ChatWidget = dynamic(() => import("@/components/ui/ChatWidget"), { ssr: false });

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <PopupController />}
      {!isAdmin && <ChatWidget />}
    </>
  );
}
