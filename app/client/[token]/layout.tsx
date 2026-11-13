import type { Metadata, Viewport } from "next";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  return {
    title: { absolute: "My Property | Prospera" },
    robots: { index: false, follow: false },
    manifest: `/client/${token}/manifest.webmanifest`,
    appleWebApp: { capable: true, title: "My Property", statusBarStyle: "default" },
    icons: { apple: "/client-icon-192.png" },
  };
}
export const viewport: Viewport = { themeColor: "#1F2F3A" };

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return children;
}
