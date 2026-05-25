import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prospera Platform — Landlording on Autopilot",
  description:
    "Rent collected. N4s filed. Maintenance handled. You didn't lift a finger. The app Ontario landlords with 1–5 properties have been waiting for. 90 days free — no contracts.",
  openGraph: {
    title: "Prospera Platform — Landlording on Autopilot",
    description:
      "Rent collected automatically. N4s filed the moment rent is late. Maintenance triaged by AI. Built by an Ontario landlord, for Ontario landlords with 1–5 properties. 90 days free.",
    type: "website",
    url: "https://www.prosperaproperties.co/platform",
    siteName: "Prospera Properties",
    images: [
      {
        url: "https://www.prosperaproperties.co/app-screens/landlord_dashboard_1.png",
        width: 390,
        height: 844,
        alt: "Prospera Platform — landlord dashboard showing rent collected and property overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prospera Platform — Landlording on Autopilot",
    description:
      "Rent collected. N4s filed. Maintenance handled. 90 days free. No contracts.",
    images: ["https://www.prosperaproperties.co/app-screens/landlord_dashboard_1.png"],
  },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
