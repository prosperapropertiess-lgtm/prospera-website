import type { Metadata } from "next";

export function reportMetadata(key: string | null, median: number | null, label: string): Metadata {
  const title = `London Rent Report${label ? ` · ${label}` : ""}`;
  const description = median
    ? `A typical London, Ontario home is asking $${Math.round(median).toLocaleString("en-CA")} a month on Facebook Marketplace. Explore every ad by bedrooms, type and neighbourhood.`
    : "Asking rents across London, Ontario, from public Facebook Marketplace ads.";
  const image = key ? `/rent-report/${key}/opengraph-image` : undefined;
  return { title: { absolute: title }, description, openGraph: { title, description, images: image ? [image] : undefined }, twitter: { card: "summary_large_image", title, description } };
}

