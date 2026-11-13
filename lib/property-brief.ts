// Everything the one-page property brief shows, read from the properties row.
// Only facts that were entered are shown; missing ones are left out, never guessed.
import QRCode from "qrcode";
import { getSupabaseAdmin } from "@/lib/supabase";
import { homeSlug } from "@/lib/viewing-requests";
import { signId } from "@/lib/fieldops/engine";

const SITE = "https://www.prosperaproperties.co";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type PropertyRow = Record<string, any>;

export async function loadProperty(by: { id?: string; slug?: string }): Promise<PropertyRow | null> {
  let q = getSupabaseAdmin().from("properties").select("*");
  q = by.id ? q.eq("id", by.id) : q.eq("slug", by.slug!);
  const { data } = await q.maybeSingle();
  return data;
}

export const briefUrl = (p: PropertyRow) => `${SITE}/brief/${p.slug ?? p.id}`;
export const agentBriefUrl = (p: PropertyRow) => `${SITE}/brief/${p.slug ?? p.id}?k=${signId("brief", p.id)}`;

export async function briefLinks(p: PropertyRow) {
  const viewing = `${SITE}/view/${homeSlug(p.address ?? "")}`;
  const { data: agents } = await getSupabaseAdmin().from("agents").select("id").eq("is_active", true).neq("role", "specialist").limit(1);
  const apply = agents?.[0] ? `${SITE}/apply/${agents[0].id}/${p.id}` : `${SITE}/apply`;
  const qr = await QRCode.toDataURL(viewing, { margin: 0, width: 240, color: { dark: "#1F2F3A", light: "#FFFFFF" } });
  return { viewing, apply, listing: `${SITE}/listings/${p.slug ?? p.id}`, qr };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function fullAddress(p: PropertyRow) {
  return `${p.address}${p.unit_number ? `, ${p.unit_number}` : ""}`;
}

export function availableLine(p: PropertyRow) {
  const d = p.available_date as string | null;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  if (!d || d <= today) return "Available now";
  return `Available ${new Date(`${d}T12:00:00Z`).toLocaleDateString("en-CA", { month: "long", day: "numeric", timeZone: "UTC" })}`;
}

const UTIL_NAMES: Record<string, string> = { heat: "Heat", hydro: "Hydro", water: "Water", gas: "Gas", internet: "Internet" };
const LAUNDRY: Record<string, string> = { "in-unit": "In the unit", shared: "Shared in the building", "coin-op": "Shared, coin or card", none: "No laundry" };
const HEAT: Record<string, string> = { gas: "Gas furnace", electric: "Electric", baseboard: "Baseboard heaters", "heat-pump": "Heat pump", "forced-air": "Forced air", radiator: "Radiators" };
const PARKING: Record<string, string> = { driveway: "Driveway", garage: "Garage", street: "Street parking", lot: "Parking lot", underground: "Underground", none: "No parking" };
const OUTDOOR: Record<string, string> = { balcony: "Balcony", patio: "Patio", deck: "Deck", yard: "Private yard", shared_yard: "Shared yard", rooftop: "Rooftop access", none: "None" };
const LEASE: Record<string, string> = { "12 months": "1 year", "month-to-month": "Month to month", flexible: "Flexible", "6 months": "6 months", "2 years": "2 years" };

export type Line = { label: string; value: string };

export function briefSections(p: PropertyRow) {
  const util = (p.utilities_detail ?? {}) as Record<string, { included: boolean; avg_cost: number | "" }>;
  // Older listings only filled utilities_list ("Heat", "Hydro / Electricity"), not utilities_detail.
  const listed = ((p.utilities_list ?? []) as string[]).map((x) => x.trim()).filter(Boolean);
  const fromDetail = Object.entries(util).filter(([, v]) => v.included).map(([k]) => UTIL_NAMES[k] ?? cap(k));
  const included = fromDetail.length ? fromDetail : listed;
  const isListed = (k: string) => listed.some((x) => x.toLowerCase().startsWith(k));
  const paid = Object.entries(util).filter(([k, v]) => !v.included && !(fromDetail.length === 0 && isListed(k)));
  const estimate = paid.reduce((s, [, v]) => s + (Number(v.avg_cost) || 0), 0);
  const keyDeposit = Number((p.move_in_costs ?? {})["Key Deposit"]) || 0;
  const rent = Number(p.price) || 0;

  const home: Line[] = [
    { label: "Bedrooms", value: p.bedrooms === 0 ? "Studio" : String(p.bedrooms ?? "") },
    { label: "Bathrooms", value: String(p.bathrooms ?? "") },
    p.sqft ? { label: "Size", value: `About ${Number(p.sqft).toLocaleString()} sq ft` } : null,
    p.property_type && p.property_type !== "other" ? { label: "Type", value: cap(String(p.property_type)) } : null,
    p.lease_term ? { label: "Lease", value: LEASE[p.lease_term] ?? p.lease_term } : null,
    p.furnished ? { label: "Furnished", value: "Yes" } : null,
  ].filter((x): x is Line => !!x && !!x.value);

  const costs: Line[] = [
    { label: "Rent", value: `${money(rent)} a month` },
    { label: "Included in rent", value: included.length ? included.join(", ") : p.utilities_included ? "Utilities included" : "No utilities" },
    paid.length ? { label: "You pay", value: `${paid.map(([k]) => UTIL_NAMES[k] ?? cap(k)).join(", ")}${estimate ? ` (about ${money(estimate)} a month)` : ""}` } : null,
    p.other_costs ? { label: "Other costs", value: p.other_costs } : null,
    p.last_month_required ? { label: "Last month's rent deposit", value: `${money(rent)}, paid at signing and used for your last month` } : null,
    keyDeposit ? { label: "Key deposit", value: `${money(keyDeposit)}, refundable when keys are returned` } : null,
  ].filter((x): x is Line => !!x);

  const inside: Line[] = [
    p.appliances?.length ? { label: "Appliances", value: (p.appliances as string[]).join(", ") } : null,
    p.laundry_type ? { label: "Laundry", value: LAUNDRY[p.laundry_type] ?? p.laundry_type } : null,
    p.heating_type ? { label: "Heating", value: HEAT[p.heating_type] ?? p.heating_type } : null,
    { label: "Air conditioning", value: p.ac ? "Yes" : "No" },
  ].filter((x): x is Line => !!x);

  const outside: Line[] = [
    p.parking_type && !(p.parking_type === "none" && p.parking)
      ? { label: "Parking", value: `${PARKING[p.parking_type] ?? p.parking_type}${p.parking_spaces ? `, ${p.parking_spaces} spot${p.parking_spaces > 1 ? "s" : ""}` : ""}` }
      : p.parking ? { label: "Parking", value: "Included" } : null,
    p.outdoor_space ? { label: "Outdoor space", value: OUTDOOR[p.outdoor_space] ?? p.outdoor_space } : null,
    p.storage ? { label: "Storage", value: p.storage_details || "Yes" } : null,
    p.entrance ? { label: "Entrance", value: p.entrance } : null,
  ].filter((x): x is Line => !!x);

  const pets = p.pet_policy ?? {};
  const rules: Line[] = [
    { label: "Pets", value: pets.cats && pets.dogs ? "Cats and dogs welcome" : pets.cats ? "Cats welcome" : pets.dogs ? "Dogs welcome" : "Ask us about your pet" },
    { label: "Smoking", value: p.smoking_allowed ? "Allowed" : "No smoking inside" },
  ];

  // Nearby: a few real places from the neighbourhood lookup.
  const nd = (p.neighbourhood_data ?? {}) as Record<string, any>;
  const pick = (key: string, label: string) => {
    const first = (nd[key] as { name: string; walk_time?: string; distance?: string }[] | undefined)?.[0];
    return first ? { label, value: `${first.name}${first.walk_time ? `, ${first.walk_time}` : first.distance ? `, ${first.distance}` : ""}` } : null;
  };
  const bus = ((p.bus_routes ?? []) as { route: string; stop_name: string; walk_time?: string }[])[0];
  const nearby: Line[] = [
    pick("grocery_or_supermarket", "Groceries"),
    bus ? { label: "Bus", value: `Route ${bus.route} at ${bus.stop_name}${bus.walk_time ? `, ${bus.walk_time}` : ""}` } : pick("transit_station", "Transit"),
    pick("park", "Park"),
    pick("pharmacy", "Pharmacy"),
    pick("school", "School"),
    p.walk_score ? { label: "Walk Score", value: `${p.walk_score} out of 100` } : null,
  ].filter((x): x is Line => !!x);

  return { home, costs, inside, outside, rules, nearby, monthly: rent + estimate };
}
