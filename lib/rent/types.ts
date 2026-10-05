// Data model for the /rent interactive rental-matching flow. Matches the
// spec's JSON structure closely; field names map 1:1 to rental_profiles
// columns so the API route can insert the draft with minimal translation.

export interface RentalProfileDraft {
  move_timing?: string; // "2026-11" | "flexible" | "asap"

  household_type?: string;
  household_type_other?: string;
  household_size?: number;
  children_present?: boolean;
  children_count?: string; // "1" | "2" | "3+"

  preferred_areas?: string[];
  other_location?: string;

  property_types?: string[];
  bedrooms?: string;
  bathrooms?: string;

  budget_range?: string;
  max_budget?: number;

  parking?: string[];
  pets?: string[];
  pets_note?: string;

  must_haves?: string[];
  top_priorities?: string[]; // top 3 of must_haves, in order
  deal_breakers?: string[];

  proximity_preferences?: string[];
  proximity_detail?: string;
  current_situation?: string;
  search_intensity?: string; // "ready_now" | "looking_around" | "planning_ahead"

  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  marketing_consent?: boolean;

  notes?: string;
}

export type StepId =
  | "move_timing"
  | "household_type"
  | "household_size"
  | "location"
  | "property_type"
  | "bedrooms"
  | "bathrooms"
  | "budget"
  | "parking"
  | "pets"
  | "must_haves"
  | "deal_breakers"
  | "proximity"
  | "current_situation"
  | "search_intensity"
  | "contact"
  | "notes";

export const STEP_ORDER: StepId[] = [
  "move_timing",
  "household_type",
  "household_size",
  "location",
  "property_type",
  "bedrooms",
  "bathrooms",
  "budget",
  "parking",
  "pets",
  "must_haves",
  "deal_breakers",
  "proximity",
  "current_situation",
  "search_intensity",
  "contact",
  "notes",
];
