// Shared option lists for the landlord fit questionnaire (/fit/[token]) and the admin review page.

export const AREAS = [
  "London: North",
  "London: East",
  "London: South",
  "London: West",
  "London: Downtown / Old East",
  "St. Thomas",
  "Strathroy",
  "Somewhere else nearby",
] as const;

// Rent ranges; `mid` is stored as approx_monthly_rent so the onboarding wizard has a number to start from.
export const RENT_RANGES: { label: string; mid: number }[] = [
  { label: "Under $1,500", mid: 1400 },
  { label: "$1,500 – $1,800", mid: 1650 },
  { label: "$1,800 – $2,100", mid: 1950 },
  { label: "$2,100 – $2,400", mid: 2250 },
  { label: "$2,400 – $2,800", mid: 2600 },
  { label: "$2,800 – $3,200", mid: 3000 },
  { label: "Over $3,200", mid: 3400 },
];

export const RENT_BASIS = [
  "What I think it's worth",
  "What I'd like to get",
  "What I charged before",
  "I'm not sure",
] as const;

export const RENT_FLEXIBILITY = [
  "Firm, I won't go lower",
  "Some room (a few %)",
  "Flexible, rent it fast",
  "I want your advice",
] as const;

export const MAINTENANCE_LEVELS = [
  "Like new / recently updated",
  "Well looked after",
  "Some wear, everything works",
  "Has been neglected",
] as const;

export const CONDITIONS = ["Excellent", "Good", "Needs some work", "Needs major repairs"] as const;
export const PROPERTY_TYPES = ["House", "Townhouse", "Apartment", "Duplex", "Basement Unit", "Other"] as const;
export const OCCUPANCY = ["Occupied", "Vacant"] as const;
export const SERVICES = ["Full Management", "Placement Only", "Not sure yet"] as const;
export const INVOLVEMENT = ["Fully hands-off", "Some involvement", "Wants to approve everything"] as const;
export const TIMELINES = ["ASAP", "Within a month", "Just exploring"] as const;

// Fields the landlord may write through the public fit link.
export const FIT_WRITABLE_FIELDS = [
  "landlord_name", "landlord_phone", "num_properties_owned",
  "area", "address_disclosed", "property_address", "property_city",
  "property_type", "bedrooms", "bathrooms", "occupancy_status",
  "property_condition", "maintenance_level", "condition_notes",
  "rent_expectation", "rent_basis", "rent_flexibility", "approx_monthly_rent",
  "service_type", "involvement_level", "timeline", "reason_for_call",
] as const;

export function cityFromArea(area: string): string {
  if (area.startsWith("London")) return "London";
  if (area === "St. Thomas" || area === "Strathroy") return area;
  return "";
}
