import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import JsonLd from "@/components/seo/JsonLd";
import TrafficSourceTracker from "@/components/TrafficSourceTracker";

const outfit = Outfit({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "600", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Prospera Properties | Property Management & Rental Agency — London, Ontario",
    template: "%s | Prospera Properties",
  },
  description:
    "Prospera Properties is a property management company and rental agency serving London, St. Thomas, and Strathroy, Ontario. Tenant screening, rent collection, maintenance, and full landlord services.",
  keywords: [
    "property management London Ontario",
    "rental agency London Ontario",
    "property management company London Ontario",
    "rental property management London Ontario",
    "property manager London Ontario",
    "property management St Thomas Ontario",
    "property management Strathroy Ontario",
    "landlord services Ontario",
    "rental management company Ontario",
    "property rental agency London Ontario",
  ],
  openGraph: {
    title: "Prospera Properties — Property Management & Rental Agency in London, Ontario",
    description:
      "Property management and rental agency serving London, St. Thomas, and Strathroy, Ontario. Tenant screening, rent collection, and full maintenance coordination.",
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
  verification: {
    google: "IgIdFF_PIJN3f3CO3omh1lGvqRnU1yK6xm64X5Lk4Wk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} min-h-full`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://hwaroazxbzgmjjasgtdb.supabase.co" />
        <link rel="dns-prefetch" href="https://hwaroazxbzgmjjasgtdb.supabase.co" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "RealEstateAgent"],
          "@id": "https://www.prosperaproperties.co",
          "name": "Prospera Properties",
          "description": "Professional property management in London, St. Thomas, and Strathroy, Ontario. Tenant screening, rent collection, maintenance coordination, and more.",
          "url": "https://www.prosperaproperties.co",
          "telephone": "+15196971227",
          "email": "hello@prosperaproperties.co",
          "logo": { "@type": "ImageObject", "url": "https://www.prosperaproperties.co/logo.png" },
          "image": "https://www.prosperaproperties.co/ebin-founder.jpg",
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
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 5.0,
            "reviewCount": 20,
            "bestRating": 5,
            "worstRating": 1
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
            gtag('config', 'G-J4XDMZBV1R');
          `}
        </Script>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1283332666116015');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1283332666116015&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <TrafficSourceTracker />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
