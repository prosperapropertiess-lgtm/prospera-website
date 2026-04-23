import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PopupController from "@/components/ui/PopupController";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Prospera Properties — Property Management in London, St. Thomas & Sarnia",
    template: "%s — Prospera Properties",
  },
  description:
    "Prospera Properties offers professional property management in London, St. Thomas, and Sarnia, Ontario. Tenant screening, rent collection, maintenance coordination, and more.",
  keywords: ["property management London Ontario", "property management St Thomas Ontario", "property management Sarnia Ontario", "rental property management Ontario", "landlord services Ontario"],
  openGraph: {
    title: "Prospera Properties — Property Management in Ontario",
    description:
      "Professional property management across London, St. Thomas, and Sarnia. Tenant screening, rent collection, and full maintenance coordination.",
    type: "website",
    url: "https://www.prosperaproperties.co",
    siteName: "Prospera Properties",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prospera Properties",
    description: "Property management in London, St. Thomas & Sarnia, Ontario.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <PopupController />
        </body>
    </html>
  );
}
