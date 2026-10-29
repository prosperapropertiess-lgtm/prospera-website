"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";

// Google Ads, GA4 and the Meta pixel. Skipped on admin pages so our own
// visits don't land in ad audiences and analytics.
export default function Tracking() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
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
    </>
  );
}
