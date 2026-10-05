import { neighbourhoods } from "@/lib/neighbourhoods";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface MoveTimingOption {
  value: string; // "2026-11" | "flexible" | "asap"
  label: string;
}

// Current month + next 7 (8 real months total), then the two open-ended
// options — matches the spec's "current month, next 5-8 months" window.
export function getMoveTimingOptions(): MoveTimingOption[] {
  const now = new Date();
  const months: MoveTimingOption[] = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ value, label: i === 0 ? `${MONTH_NAMES[d.getMonth()]} (this month)` : MONTH_NAMES[d.getMonth()] });
  }
  return [
    { value: "asap", label: "As soon as possible" },
    ...months,
    { value: "flexible", label: "I'm flexible" },
  ];
}

export const HOUSEHOLD_TYPES = [
  "Just me",
  "Couple",
  "Young couple / first place together",
  "Family with children",
  "Working professionals",
  "Group of working professionals",
  "Students",
  "Group of students",
  "Student + working professional",
  "Newcomer to Canada",
  "Retired couple",
  "Multi-generational family",
  "Friends renting together",
  "Other",
];

// Real, named London neighbourhoods already published on the site
// (/areas/london/[neighbourhood]) rather than invented compass zones —
// recognizable, reuses real content, and needs no custom map geometry.
export const LONDON_AREAS = neighbourhoods
  .filter((n) => n.citySlug === "london")
  .map((n) => n.name);

export const PROPERTY_TYPES = [
  "Apartment",
  "Condo",
  "Townhouse",
  "Detached house",
  "Semi-detached",
  "Basement apartment",
  "Duplex / triplex unit",
  "Student house",
  "Room rental",
  "Furnished rental",
  "I'm open to anything",
];

export const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5+", "Flexible"];
export const BATHROOM_OPTIONS = ["1", "1.5+", "2+", "2.5+", "3+", "Doesn't matter"];

export const BUDGET_RANGES = [
  "Under $1,500",
  "$1,500–$1,800",
  "$1,800–$2,100",
  "$2,100–$2,400",
  "$2,400–$2,700",
  "$2,700–$3,000",
  "$3,000–$3,500",
  "$3,500+",
  "Flexible",
];

export const PARKING_OPTIONS = ["None", "1 space", "2 spaces", "3+", "Street parking is okay", "Flexible"];

export const PET_OPTIONS = ["No pets", "Dog", "Cat", "Multiple pets", "Other"];

export const MUST_HAVES = [
  "In-unit laundry",
  "Dishwasher",
  "Central A/C",
  "Backyard",
  "Balcony",
  "Garage",
  "EV charging",
  "Finished basement",
  "Lots of natural light",
  "Updated kitchen",
  "Home office space",
  "Pet-friendly",
  "Furnished",
  "Utilities included",
  "Internet included",
  "Near transit",
  "Near Western University",
  "Near Fanshawe College",
  "Near a hospital",
  "Near schools",
  "Quiet neighbourhood",
  "Walkable area",
  "Gym nearby",
  "Grocery nearby",
  "Accessible / mobility-friendly",
  "No carpet",
  "Private entrance",
  "Storage",
  "Other",
];

export const DEAL_BREAKERS = [
  "Basement unit",
  "Shared entrance",
  "No parking",
  "Carpet",
  "No laundry",
  "No A/C",
  "Pets not allowed",
  "Far from transit",
  "Student-heavy building",
  "Stairs",
  "Small backyard / no yard",
  "Furnished",
  "Unfurnished",
  "Other",
  "Nothing major",
];

export const PROXIMITY_OPTIONS = [
  "Work",
  "School",
  "Western University",
  "Fanshawe College",
  "Downtown",
  "Hospital",
  "Transit",
  "Highway 401 / 402",
  "Family",
  "Childcare",
  "Parks / trails",
  "Shopping",
  "Restaurants / nightlife",
  "Doesn't matter",
];

export const CURRENT_SITUATION_OPTIONS = [
  "Renting now",
  "Living with family",
  "Moving to London",
  "Moving within London",
  "Selling / leaving another home",
  "Student housing",
  "Temporary accommodation",
  "Other",
];

export const SEARCH_INTENSITY_OPTIONS: { value: string; emoji: string; label: string; helper: string }[] = [
  { value: "ready_now", emoji: "🔥", label: "Ready now", helper: "I'm actively booking viewings." },
  { value: "looking_around", emoji: "👀", label: "Looking around", helper: "I'll move if the right place appears." },
  { value: "planning_ahead", emoji: "🗓", label: "Planning ahead", helper: "I'm researching for later." },
];
