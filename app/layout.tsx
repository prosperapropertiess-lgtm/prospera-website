import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import JsonLd from "@/components/seo/JsonLd";

const outfit = Outfit({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-dm-sans",
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
    images: [
      {
        url: "https://www.prosperaproperties.co/ebin-founder.jpg",
        width: 1200,
        height: 630,
        alt: "Ebin Jaison — Prospera Properties",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prospera Properties",
    description: "Property management in London, St. Thomas & Strathroy, Ontario.",
    images: ["https://www.prosperaproperties.co/ebin-founder.jpg"],
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
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full`}>
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
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "20",
            "bestRating": "5",
            "worstRating": "1"
          },
          "sameAs": [
            "https://www.facebook.com/prosperaproperties",
            "https://www.youtube.com/@prosperaproperties"
          ]
        }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18098735149"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18098735149');
          `}
        </Script>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
