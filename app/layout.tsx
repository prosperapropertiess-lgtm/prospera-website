import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PopupController from "@/components/ui/PopupController";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jakartaBody = Plus_Jakarta_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Prospera Properties — Property Management in London, St. Thomas & Strathroy",
    template: "%s — Prospera Properties",
  },
  description:
    "Prospera Properties offers professional property management in London, St. Thomas, and Strathroy, Ontario. Tenant screening, rent collection, maintenance coordination, and more.",
  keywords: ["property management London Ontario", "property management St Thomas Ontario", "property management Strathroy Ontario", "rental property management Ontario", "landlord services Ontario"],
  openGraph: {
    title: "Prospera Properties — Property Management in Ontario",
    description:
      "Professional property management across London, St. Thomas, and Strathroy. Tenant screening, rent collection, and full maintenance coordination.",
    type: "website",
    url: "https://www.prosperaproperties.co",
    siteName: "Prospera Properties",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prospera Properties",
    description: "Property management in London, St. Thomas & Strathroy, Ontario.",
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
    <html lang="en" className={`${jakarta.variable} ${jakartaBody.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <PopupController />
      </body>
    </html>
  );
}
