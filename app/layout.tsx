import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import JsonLd from "@/components/seo/JsonLd";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
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
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://hwaroazxbzgmjjasgtdb.supabase.co" />
        <link rel="dns-prefetch" href="https://hwaroazxbzgmjjasgtdb.supabase.co" />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://www.prosperaproperties.co",
          "name": "Prospera Properties",
          "description": "Professional property management in London, St. Thomas, and Strathroy, Ontario. Tenant screening, rent collection, maintenance coordination, and more.",
          "url": "https://www.prosperaproperties.co",
          "telephone": "+15196971227",
          "email": "hello@prosperaproperties.co",
          "logo": "https://www.prosperaproperties.co/logo.png",
          "image": "https://www.prosperaproperties.co/logo.png",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "London",
            "addressRegion": "ON",
            "addressCountry": "CA"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 42.9849,
            "longitude": -81.2453
          },
          "areaServed": [
            { "@type": "City", "name": "London", "sameAs": "https://en.wikipedia.org/wiki/London,_Ontario" },
            { "@type": "City", "name": "St. Thomas", "sameAs": "https://en.wikipedia.org/wiki/St._Thomas,_Ontario" },
            { "@type": "City", "name": "Strathroy", "sameAs": "https://en.wikipedia.org/wiki/Strathroy-Caradoc" }
          ],
          "serviceType": "Property Management",
          "sameAs": [
            "https://www.facebook.com/prosperaproperties",
            "https://www.youtube.com/@prosperaproperties"
          ]
        }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
