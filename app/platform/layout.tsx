import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Prospera App — Built by a Landlord, for Landlords",
  description:
    "Rent reminders in one tap. The right LTB notice, picked for you. Maintenance tracked start to finish. Built for Ontario landlords with 4–15 properties by someone who runs his own.",
  openGraph: {
    title: "The Prospera App — Built by a Landlord, for Landlords",
    description:
      "Rent reminders in one tap. The right LTB notice, picked for you. Maintenance tracked start to finish. Built for Ontario landlords with 4–15 properties by someone who runs his own.",
    type: "website",
    url: "https://www.prosperaproperties.co/platform",
    siteName: "Prospera Properties",
    images: [
      {
        url: "https://www.prosperaproperties.co/app-screens/command-dashboard.png",
        width: 1206,
        height: 2622,
        alt: "The Prospera app — Command dashboard showing rent collected and portfolio status",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Prospera App — Built by a Landlord, for Landlords",
    description:
      "Rent reminders in one tap. The right LTB notice, picked for you. Maintenance tracked start to finish.",
    images: ["https://www.prosperaproperties.co/app-screens/command-dashboard.png"],
  },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
