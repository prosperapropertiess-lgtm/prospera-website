// Shared by the public /view form, its API, the admin page and the daily review.

export const INCOME_RANGES = [
  { value: "under_3000", label: "Under $3,000" },
  { value: "3000_4000", label: "$3,000 – $4,000" },
  { value: "4000_5000", label: "$4,000 – $5,000" },
  { value: "5000_6000", label: "$5,000 – $6,000" },
  { value: "6000_plus", label: "$6,000 or more" },
] as const;

export const CREDIT_RANGES = [
  { value: "750_plus", label: "750 or higher" },
  { value: "700_749", label: "700 – 749" },
  { value: "650_699", label: "650 – 699" },
  { value: "600_649", label: "600 – 649" },
  { value: "below_600", label: "Below 600" },
  { value: "unknown", label: "I don't know" },
  { value: "no_history", label: "No credit history in Canada yet" },
] as const;

export const CONSENT_TEXT =
  "I agree that Prospera Properties can use these answers to review my viewing request and contact me. If I apply for this home, I consent to a credit and background check.";

export function incomeLabel(v: string | null | undefined) {
  return INCOME_RANGES.find((r) => r.value === v)?.label ?? "Not given";
}
export function creditLabel(v: string | null | undefined) {
  return CREDIT_RANGES.find((r) => r.value === v)?.label ?? "Not given";
}

export interface PublicHome {
  id: string;
  title: string | null;
  address: string;
  city: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  available_date: string | null;
  utilities_included: boolean | null;
  utilities_list: string[] | null;
  parking: boolean | null;
  image: string | null;
}

export const PUBLIC_HOME_FIELDS =
  "id, title, address, city, price, bedrooms, bathrooms, available_date, utilities_included, utilities_list, parking, images";

export function toPublicHome(p: Record<string, unknown>): PublicHome {
  const images = (p.images as string[] | null) ?? [];
  return {
    id: p.id as string,
    title: (p.title as string) ?? null,
    address: p.address as string,
    city: p.city as string,
    price: Number(p.price),
    bedrooms: (p.bedrooms as number) ?? null,
    bathrooms: p.bathrooms == null ? null : Number(p.bathrooms),
    available_date: (p.available_date as string) ?? null,
    utilities_included: (p.utilities_included as boolean) ?? null,
    utilities_list: (p.utilities_list as string[]) ?? null,
    parking: (p.parking as boolean) ?? null,
    image: images[0] ?? null,
  };
}

/** Today's date in Toronto as YYYY-MM-DD. */
export function torontoToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
}

export const VIEW_URL = "https://www.prosperaproperties.co/view";
