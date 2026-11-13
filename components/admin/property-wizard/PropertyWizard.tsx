"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardAutoSave } from "./useWizardAutoSave";
import NeighbourhoodStep from "./steps/NeighbourhoodStep";
import PhotosStep from "./steps/PhotosStep";
import PreviewStep from "./steps/PreviewStep";
import { HomeScreen, RentScreen, InsideScreen, OutsideScreen, UtilitiesScreen, AccessScreen } from "./QuickScreens";
import { NAVY, BORDER, MUTED, heading, Progress, Next } from "@/components/flow/FlowUI";

// One short screen per topic. The slow parts (neighbourhood lookup, AI listing
// text, photo labels) run on the server after Photos, while you move on.
const SCREENS = [
  { key: "home", label: "The home", title: "The home" },
  { key: "rent", label: "Rent & move-in", title: "Rent & move-in" },
  { key: "inside", label: "Inside", title: "Inside" },
  { key: "outside", label: "Parking & outside", title: "Parking & outside" },
  { key: "utilities", label: "Utilities & rules", title: "Utilities & rules" },
  { key: "access", label: "Showing & access", title: "Showing & access" },
  { key: "photos", label: "Photos", title: "Photos" },
  { key: "done", label: "Done", title: "" },
] as const;
type ScreenKey = (typeof SCREENS)[number]["key"];

// Canadian street addresses virtually always end in a recognizable
// street-type word. Used only to avoid retroactively flagging an
// already-good, already-published address as "unconfirmed" the next time
// someone opens it for editing — every one of the real truncated
// addresses this was built to catch ("190 wych", "969 batterry") is both
// short AND missing any of these.
const STREET_SUFFIXES = [
  "street", "st", "avenue", "ave", "road", "rd", "drive", "dr", "boulevard", "blvd",
  "crescent", "cres", "court", "ct", "lane", "ln", "way", "place", "pl", "terrace",
  "circle", "cir", "trail", "grove", "gate", "walk", "row", "square", "close", "line",
  "parkway", "pkwy", "highway", "hwy", "heights", "hts", "gardens", "path", "mews", "park",
  "point", "ridge", "hill", "common", "green", "glen", "landing", "run", "bay", "view",
  "sideroad", "concession", "cove", "link", "heath", "hollow", "wood", "woods", "ter", "crt",
];
export function looksLikeCompleteAddress(address: string): boolean {
  // Ignore a trailing unit ("Unit 3", "Apt B", "#2") or direction ("N", "East").
  const trimmed = address
    .trim()
    .replace(/,?\s*(unit|apt|apartment|suite|ste|#)\s*[\w-]+$/i, "")
    .replace(/,?\s+(n|s|e|w|north|south|east|west)\.?$/i, "");
  if (trimmed.length < 10) return false;
  const lastWord = trimmed.toLowerCase().split(/\s+/).pop() ?? "";
  return STREET_SUFFIXES.includes(lastWord.replace(/[.,]/g, ""));
}

// ─── Full property data shape ───────────────────────────────
export interface WizardData {
  // Step 1: Basics
  title: string;
  address: string;
  // True only once a real Google Places suggestion has been selected for
  // the CURRENT address value — false the instant the text is hand-typed
  // or edited, even if it looks plausible. This is what goNext()/Publish
  // actually gate on; never persisted (not a real DB column, see
  // getPayload() below) — purely an in-session guard against the exact
  // bug that shipped 4 truncated live addresses: someone types a partial
  // address and tabs/clicks away before ever picking a suggestion.
  address_confirmed: boolean;
  city: string;
  property_type: string;
  price: number | "";
  bedrooms: number | "";
  bathrooms: number | "";
  sqft: number | "";
  available_date: string;
  // Step 2: Lease & Move-In
  lease_term: string;
  deposit: number | "";
  first_month_required: boolean;
  last_month_required: boolean;
  move_in_costs: Record<string, number>;
  // Step 3: Features
  parking: boolean;
  parking_type: string;
  laundry_type: string;
  ac: boolean;
  heating_type: string;
  appliances: string[];
  outdoor_space: string;
  furnished: boolean;
  storage: boolean;
  elevator: boolean;
  wheelchair_accessible: boolean;
  // Step 4: Policies
  pet_friendly: boolean;
  pet_policy: { cats: boolean; dogs: boolean; other: boolean; deposit: number | ""; restrictions: string };
  smoking_allowed: boolean;
  guest_policy: string;
  quiet_hours: string;
  max_occupants: number | "";
  // Step 5: Utilities
  utilities_included: boolean;
  utilities_list: string[];
  utilities_detail: Record<string, { included: boolean; avg_cost: number | "" }>;
  // Step 6: Neighbourhood
  latitude: number | null;
  longitude: number | null;
  neighbourhood_data: Record<string, unknown[]>;
  walk_score: number | "";
  transit_score: number | "";
  bike_score: number | "";
  bus_routes: { route: string; stop_name: string; frequency: string; walk_time: string }[];
  neighbourhood_vibe: string;
  // Step 7: Photos
  images: string[];
  photo_labels: { url: string; label: string; sort_order: number }[];
  virtual_tour_url: string;
  floor_plan_url: string;
  // Step 8: AI / Preview
  description: string;
  ai_highlights: string[];
  life_simulation: { morning: string; afternoon: string; evening: string; night: string };
  ai_life_intro: string;
  transparency: Record<string, string | string[]>;
  marketplace_description: string;
  // Brief
  unit_number: string;
  entrance: string;
  parking_spaces: number | "";
  storage_details: string;
  other_costs: string;
  renter_notes: string;
  access_instructions: string;
  occupancy: "" | "vacant" | "occupied";
  showing_notes: string;
  // Meta
  slug?: string | null;
  available: boolean;
  status: string;
  wizard_step: number;
}

const BLANK: WizardData = {
  title: "", address: "", address_confirmed: false, city: "London", property_type: "", price: "", bedrooms: "", bathrooms: "", sqft: "", available_date: "",
  lease_term: "", deposit: "", first_month_required: true, last_month_required: true, move_in_costs: { "Key Deposit": 100 },
  parking: false, parking_type: "none", laundry_type: "none", ac: false, heating_type: "", appliances: [], outdoor_space: "none", furnished: false, storage: false, elevator: false, wheelchair_accessible: false,
  pet_friendly: false, pet_policy: { cats: false, dogs: false, other: false, deposit: "", restrictions: "" }, smoking_allowed: false, guest_policy: "", quiet_hours: "", max_occupants: "",
  utilities_included: false, utilities_list: [],
  utilities_detail: { heat: { included: false, avg_cost: "" }, water: { included: false, avg_cost: "" }, hydro: { included: false, avg_cost: "" }, internet: { included: false, avg_cost: "" }, gas: { included: false, avg_cost: "" } },
  latitude: null, longitude: null, neighbourhood_data: {}, walk_score: "", transit_score: "", bike_score: "", bus_routes: [], neighbourhood_vibe: "",
  images: [], photo_labels: [], virtual_tour_url: "", floor_plan_url: "",
  description: "", ai_highlights: [], life_simulation: { morning: "", afternoon: "", evening: "", night: "" }, ai_life_intro: "",
  transparency: {}, marketplace_description: "",
  unit_number: "", entrance: "", parking_spaces: "", storage_details: "", other_costs: "", renter_notes: "",
  access_instructions: "", occupancy: "", showing_notes: "",
  available: true, status: "draft", wizard_step: 1,
};

interface Props {
  initial?: Partial<WizardData> & { id?: string };
  // Set when this property is being added as the final step of a placement
  // onboarding (see docs/tenant-placement-os/05_OWNER_ONBOARDING.md). When
  // present, prefills from the onboarding intake and, on publish, creates
  // the leasing pipeline campaign automatically instead of requiring a
  // separate manual step.
  onboardToken?: string;
}

// Turns the pricing authority + access data already collected during
// placement onboarding (see docs/tenant-placement-os/05_OWNER_ONBOARDING.md)
// into a leasing_properties campaign, reusing the same creation endpoint
// as the manual "+ Add Vacancy" flow (default checklist/channels/task).
async function createCampaignFromOnboarding(
  token: string,
  propertyId: string,
  fallbackPrice: number | ""
): Promise<string | null> {
  const statusRes = await fetch(`/api/onboard/${token}/status`).catch(() => null);
  if (!statusRes?.ok) return null;
  const session = await statusRes.json();
  const step6 = (session.step6_data ?? {}) as Record<string, unknown>;
  const step7 = (session.step7_data ?? {}) as Record<string, unknown>;

  const desiredRent = step7.desired_rent
    ? Number(step7.desired_rent)
    : fallbackPrice !== "" ? Number(fallbackPrice) : null;
  const rentFloor = step7.authorized_rent_floor ? Number(step7.authorized_rent_floor) : null;

  const incentiveMap: Record<string, string> = {
    preauthorized: "Pre-authorized by owner — can offer without asking",
    approval_required: "Owner approval required before offering any incentive",
    no_incentives: "No incentives authorized",
  };
  const incentiveDescription = step7.incentive_authority
    ? incentiveMap[String(step7.incentive_authority)] ?? null
    : null;

  const noteLines: string[] = [];
  if (step7.known_defects) noteLines.push(`Known defects: ${step7.known_defects}`);
  if (step7.pricing_flexibility) noteLines.push(`Pricing flexibility: ${step7.pricing_flexibility}`);
  if (step6.showing_hours) noteLines.push(`Showing hours: ${step6.showing_hours}`);
  if (step6.notice_required) noteLines.push(`Notice required: ${step6.notice_required}`);
  if (step6.showing_restrictions) noteLines.push(`Showing restrictions: ${step6.showing_restrictions}`);

  const createRes = await fetch("/api/admin/leasing/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      property_id: propertyId,
      vacant_since: new Date().toISOString().split("T")[0],
      asking_rent: desiredRent,
      target_rent: desiredRent,
      min_authorized_rent: rentFloor,
      incentive_description: incentiveDescription,
      owner_name: session.owner_name || null,
      owner_email: session.owner_email || null,
      notes: noteLines.length ? noteLines.join("\n") : null,
    }),
  });
  if (!createRes.ok) return null;
  const lp = await createRes.json().catch(() => null);
  return lp?.id ?? null;
}

// Database rows carry nulls; the form wants "" for empty text and numbers.
function fromRow(initial?: Partial<WizardData> & { id?: string }): WizardData {
  const out = { ...BLANK } as Record<string, unknown>;
  for (const [k, v] of Object.entries(initial ?? {})) if (v !== null && v !== undefined) out[k] = v;
  const d = out as unknown as WizardData;
  d.address_confirmed = initial?.address ? looksLikeCompleteAddress(initial.address) : false;
  return d;
}

export default function PropertyWizard({ initial, onboardToken }: Props) {
  const router = useRouter();
  const [data, setData] = useState<WizardData>(() => fromRow(initial));
  const [screen, setScreen] = useState<ScreenKey>(() => (initial?.id ? "home" : "home"));
  const [propertyId, setPropertyId] = useState<string | null>(initial?.id || null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // Prefill from the onboarding session's already-collected intake data
  useEffect(() => {
    if (!onboardToken || initial?.id) return;
    (async () => {
      const res = await fetch(`/api/onboard/${onboardToken}/status`).catch(() => null);
      if (!res?.ok) return;
      const session = await res.json();
      const step6 = (session.step6_data ?? {}) as Record<string, string>;
      const step7 = (session.step7_data ?? {}) as Record<string, unknown>;
      const desiredRent = step7.desired_rent ? Number(step7.desired_rent) : null;
      const access = [
        step6.front_door_code && `Lockbox / door code: ${step6.front_door_code}`,
        step6.garage_code && `Garage code: ${step6.garage_code}`,
        step6.num_keys && `${step6.num_keys} keys`,
        step6.mailbox_notes,
      ].filter(Boolean).join("\n");
      const notes = [
        step6.showing_hours && `Showing hours: ${step6.showing_hours}`,
        step6.notice_required && `Notice: ${step6.notice_required}`,
        step6.showing_restrictions,
      ].filter(Boolean).join("\n");
      setData((prev) => ({
        ...prev,
        address: session.property_address || "",
        city: session.property_city || "London",
        property_type: session.property_type ? String(session.property_type).toLowerCase() : "",
        bedrooms: session.bedrooms ?? "",
        bathrooms: session.bathrooms ?? "",
        price: desiredRent ?? (session.approx_monthly_rent ? Number(session.approx_monthly_rent) : ""),
        access_instructions: prev.access_instructions || access,
        showing_notes: prev.showing_notes || notes,
        occupancy: prev.occupancy || (/occupied/i.test(step6.notice_required ?? "") ? "occupied" : ""),
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardToken, initial?.id]);

  const update = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const idx = SCREENS.findIndex((s) => s.key === screen);

  // Everything the form owns; neighbourhood + AI fields are written by the server too, so only send them once they exist.
  const getPayload = useCallback(() => {
    const d = dataRef.current;
    const n = (v: number | "") => (v !== "" ? Number(v) : null);
    const t = (v: string) => v.trim() || null;
    return {
      // Only sent once set, so a title the listing writer fills in isn't wiped by an empty one.
      title: d.title || undefined,
      address: d.address, city: d.city, property_type: d.property_type || null,
      price: n(d.price), bedrooms: n(d.bedrooms), bathrooms: n(d.bathrooms), sqft: n(d.sqft),
      available_date: d.available_date || null, lease_term: d.lease_term || null,
      deposit: n(d.deposit), first_month_required: d.first_month_required, last_month_required: d.last_month_required, move_in_costs: d.move_in_costs,
      parking: d.parking, parking_type: d.parking_type || null, parking_spaces: n(d.parking_spaces),
      laundry_type: d.laundry_type || null, ac: d.ac, heating_type: d.heating_type || null, appliances: d.appliances,
      outdoor_space: d.outdoor_space || null, furnished: d.furnished, storage: d.storage, storage_details: t(d.storage_details),
      elevator: d.elevator, wheelchair_accessible: d.wheelchair_accessible,
      pet_friendly: d.pet_friendly, pet_policy: d.pet_policy, smoking_allowed: d.smoking_allowed,
      guest_policy: d.guest_policy || null, quiet_hours: d.quiet_hours || null, max_occupants: n(d.max_occupants),
      utilities_included: d.utilities_included, utilities_list: d.utilities_list, utilities_detail: d.utilities_detail,
      latitude: d.latitude ?? undefined, longitude: d.longitude ?? undefined,
      images: d.images, photo_labels: d.photo_labels, virtual_tour_url: d.virtual_tour_url || null, floor_plan_url: d.floor_plan_url || null,
      unit_number: t(d.unit_number), entrance: t(d.entrance), other_costs: t(d.other_costs), renter_notes: t(d.renter_notes),
      access_instructions: t(d.access_instructions), occupancy: d.occupancy || null, showing_notes: t(d.showing_notes),
      available: d.available,
      wizard_step: Math.max(d.wizard_step, idx + 1),
    };
  }, [idx]);

  // The editable listing text (Done screen) is saved separately so a background
  // AI write isn't overwritten by an older copy in this browser.
  const getTextPayload = useCallback(() => {
    const d = dataRef.current;
    return {
      title: d.title, description: d.description || null, ai_highlights: d.ai_highlights, life_simulation: d.life_simulation,
      ai_life_intro: d.ai_life_intro || null, neighbourhood_vibe: d.neighbourhood_vibe || null,
    };
  }, []);

  const { scheduleSave, saveNow } = useWizardAutoSave(propertyId, screen === "done" ? getTextPayload : getPayload, (saved) => {
    setSaving(false);
    if (saved.id && !propertyId) setPropertyId(saved.id as string);
  });

  async function createProperty() {
    const d = dataRef.current;
    const title = `${d.bedrooms === 0 ? "Studio" : `${d.bedrooms} Bedroom`} ${d.property_type ? d.property_type.charAt(0).toUpperCase() + d.property_type.slice(1) : "Home"} in ${d.city}`;
    const res = await fetch("/api/admin/properties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...getPayload(), title }) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error || "Couldn't save. Try again.");
      return null;
    }
    const created = await res.json();
    setPropertyId(created.id);
    update({ slug: created.slug });
    window.history.replaceState(null, "", `/admin/properties/${created.id}`);
    return created.id as string;
  }

  function missingOn(key: ScreenKey): Record<string, string> {
    const d = dataRef.current;
    const e: Record<string, string> = {};
    if (key === "home") {
      if (!d.address.trim()) e.address = "Enter the address.";
      else if (!d.address_confirmed) e.address = "Pick the address from the list, or use it as typed.";
      if (d.bedrooms === "") e.bedrooms = "Pick the number of bedrooms.";
      if (d.bathrooms === "") e.bathrooms = "Pick the number of bathrooms.";
    }
    if (key === "rent") {
      if (!(Number(d.price) > 0)) e.price = "Enter the monthly rent.";
      if (!d.available_date) e.available_date = "Pick when it's available.";
    }
    return e;
  }

  function startEnrich(id: string) {
    // Fire and forget: the server keeps going after this request returns.
    fetch(`/api/admin/properties/${id}/enrich`, { method: "POST" }).catch(() => {});
  }

  async function goTo(next: ScreenKey) {
    setError("");
    setErrors({});
    setScreen(next);
    window.scrollTo({ top: 0 });
  }

  async function continueFrom(key: ScreenKey) {
    const e = missingOn(key);
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`q-${Object.keys(e)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    let id = propertyId;
    if (!id) id = await createProperty();
    else await saveNow();
    setSaving(false);
    if (!id) return;
    if (key === "photos") startEnrich(id);
    goTo(SCREENS[SCREENS.findIndex((s) => s.key === key) + 1].key);
  }

  function onChange(partial: Partial<WizardData>) {
    update(partial);
    if (propertyId) scheduleSave();
  }

  const screenProps = { data, onChange, errors };
  const current = SCREENS[idx];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <div className="px-5 py-3.5 flex items-center gap-4 bg-white border-b" style={{ borderColor: BORDER }}>
        <button onClick={() => router.push("/admin/properties")} className="text-sm font-medium" style={{ color: NAVY }}>← Properties</button>
        <span className="text-sm truncate" style={{ color: MUTED }}>{data.address || (initial?.id ? "Edit property" : "New property")}</span>
        <span className="text-sm ml-auto shrink-0" style={{ color: MUTED }}>{saving ? "Saving…" : propertyId ? "Saved" : ""}</span>
      </div>

      <div className="max-w-xl mx-auto px-5 py-8">
        {screen !== "done" && (
          <>
            <Progress index={idx} total={SCREENS.length - 1} label={current.label} onBack={idx > 0 ? () => goTo(SCREENS[idx - 1].key) : undefined} />
            {propertyId && (
              <div className="flex flex-wrap gap-1.5 -mt-3 mb-6">
                {SCREENS.slice(0, -1).map((s) => (
                  <button key={s.key} type="button" onClick={async () => { await saveNow(); goTo(s.key); }}
                    className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: s.key === screen ? NAVY : BORDER, color: s.key === screen ? "#FAF8F5" : NAVY, backgroundColor: s.key === screen ? NAVY : "#FFFFFF" }}>
                    {s.label}
                  </button>
                ))}
                <button type="button" onClick={async () => { await saveNow(); goTo("done"); }} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: BORDER, color: NAVY, backgroundColor: "#FFFFFF" }}>Brief & publish →</button>
              </div>
            )}
          </>
        )}

        <div key={screen} className="view-step">
          {current.title && <h1 className="text-2xl sm:text-3xl font-bold mb-6 leading-tight" style={heading}>{current.title}</h1>}
          {error && <div role="alert" className="rounded-lg border px-4 py-3 text-sm bg-white mb-6" style={{ borderColor: "#8B2030", color: "#8B2030" }}>{error}</div>}

          {screen === "home" && <HomeScreen {...screenProps} />}
          {screen === "rent" && <RentScreen {...screenProps} />}
          {screen === "inside" && <InsideScreen {...screenProps} />}
          {screen === "outside" && <OutsideScreen {...screenProps} />}
          {screen === "utilities" && <UtilitiesScreen {...screenProps} />}
          {screen === "access" && <AccessScreen {...screenProps} />}
          {screen === "photos" && <PhotosStep data={data} onChange={onChange} propertyId={propertyId} />}
          {screen === "done" && propertyId && (
            <DoneScreen
              id={propertyId} data={data} onChange={onChange} update={update} onboardToken={onboardToken}
              onBack={() => goTo("photos")} onPublished={() => router.push("/admin/properties")}
            />
          )}

          {screen !== "done" && (
            <div className="mt-10">
              <Next onClick={() => continueFrom(screen)} disabled={saving}>{saving ? "Saving…" : screen === "photos" ? "Finish" : "Continue"}</Next>
              {screen === "access" && <p className="text-sm text-center mt-3" style={{ color: MUTED }}>You can skip this and fill it in later.</p>}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .view-step{animation:viewIn .18s ease-out}
        @keyframes viewIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){.view-step{animation:none}}
      `}</style>
    </div>
  );
}

// What still needs filling in for a complete brief, and which screen it's on.
export function briefGaps(d: WizardData): { label: string; screen: ScreenKey }[] {
  const gaps: { label: string; screen: ScreenKey }[] = [];
  if (!d.property_type) gaps.push({ label: "Type of home", screen: "home" });
  if (!d.lease_term) gaps.push({ label: "Lease length", screen: "rent" });
  if (!d.appliances.length) gaps.push({ label: "Appliances", screen: "inside" });
  if (!d.laundry_type) gaps.push({ label: "Laundry", screen: "inside" });
  if (!d.parking_type) gaps.push({ label: "Parking", screen: "outside" });
  if (!d.outdoor_space) gaps.push({ label: "Outdoor space", screen: "outside" });
  if (!d.entrance) gaps.push({ label: "Entrance", screen: "outside" });
  if (!d.occupancy) gaps.push({ label: "Vacant or occupied", screen: "access" });
  if (!d.access_instructions) gaps.push({ label: "Access instructions", screen: "access" });
  if (!d.images.length) gaps.push({ label: "Photos", screen: "photos" });
  return gaps;
}

function Status({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {done
        ? <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: NAVY }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="4"><path d="M5 12l5 5L20 7" /></svg></span>
        : <span className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: BORDER, borderTopColor: NAVY }} />}
      <span className="text-[15px]" style={{ color: done ? NAVY : MUTED }}>{label}</span>
    </div>
  );
}

function DoneScreen({ id, data, onChange, update, onboardToken, onBack, onPublished }: {
  id: string; data: WizardData; onChange: (p: Partial<WizardData>) => void; update: (p: Partial<WizardData>) => void;
  onboardToken?: string; onBack: () => void; onPublished: () => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const [err, setErr] = useState("");
  const [openText, setOpenText] = useState(false);
  const [openArea, setOpenArea] = useState(false);
  const [ready, setReady] = useState({ area: Object.keys(data.neighbourhood_data).length > 0, text: !!data.description });

  // Watch for the background work to land, then pull it into the form.
  useEffect(() => {
    if (ready.area && ready.text) return;
    let tries = 0;
    const t = setInterval(async () => {
      tries++;
      const res = await fetch(`/api/admin/properties/${id}/enrich`).catch(() => null);
      const p = res?.ok ? await res.json() : null;
      if (p) {
        const area = !!p.neighbourhood_data && Object.keys(p.neighbourhood_data).length > 0;
        const text = !!p.description;
        if (area || text) {
          update({
            ...(area ? { neighbourhood_data: p.neighbourhood_data, walk_score: p.walk_score ?? "", transit_score: p.transit_score ?? "", bike_score: p.bike_score ?? "", bus_routes: p.bus_routes ?? [], neighbourhood_vibe: p.neighbourhood_vibe ?? "" } : {}),
            ...(text ? { title: p.title ?? "", description: p.description ?? "", ai_highlights: p.ai_highlights ?? [], life_simulation: p.life_simulation ?? BLANK.life_simulation, ai_life_intro: p.ai_life_intro ?? "" } : {}),
            ...(p.photo_labels ? { photo_labels: p.photo_labels } : {}),
            slug: p.slug,
          });
        }
        setReady({ area, text });
        if ((area && text) || tries > 45) clearInterval(t);
      }
    }, 4000);
    return () => clearInterval(t);
  }, [id, ready.area, ready.text, update]);

  const gaps = briefGaps(data);
  const published = data.status === "published";

  async function publish() {
    if (!data.address_confirmed) { setErr("Confirm the address on the first screen before publishing."); return; }
    setPublishing(true);
    const res = await fetch(`/api/admin/properties/${id}/publish`, { method: "POST" });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setErr(e.error || "Publish failed. Try again.");
      setPublishing(false);
      return;
    }
    update({ status: "published" });
    if (onboardToken) await createCampaignFromOnboarding(onboardToken, id, data.price);
    onPublished();
  }

  return (
    <div className="grid gap-6">
      <div>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: NAVY }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={heading}>{published ? "It's live." : "Saved. Ready when you are."}</h1>
        <p className="text-base" style={{ color: "#333" }}>{data.address}{data.unit_number ? `, ${data.unit_number}` : ""}</p>
      </div>

      <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
        <p className="text-lg font-semibold mb-1" style={{ color: NAVY }}>Property brief</p>
        <p className="text-sm mb-4" style={{ color: "#333" }}>One page with everything about living here. Email it after viewings, print it for neighbours, share it with anyone who knows someone.</p>
        <div className="grid gap-2">
          <a href={`/admin/properties/${id}/brief`} target="_blank" className="block text-center px-6 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
            Open brief & download PDF
          </a>
          <a href={`/admin/properties/${id}/brief?for=agent`} target="_blank" className="text-sm text-center underline py-2" style={{ color: NAVY }}>Agent version (with access details)</a>
        </div>
        {gaps.length > 0 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: BORDER }}>
            <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Missing from the brief</p>
            <div className="flex flex-wrap gap-2">
              {gaps.map((g) => <span key={g.label} className="text-sm px-3 py-1 rounded-full border" style={{ borderColor: BORDER, color: "#333" }}>{g.label}</span>)}
            </div>
            <button type="button" onClick={onBack} className="text-sm underline mt-3" style={{ color: NAVY }}>Go back and fill these in</button>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}>
        <p className="text-lg font-semibold mb-2" style={{ color: NAVY }}>Filling in by itself</p>
        <Status done={ready.area} label={ready.area ? "Neighbourhood, transit and nearby places" : "Looking up the neighbourhood…"} />
        <Status done={ready.text} label={ready.text ? "Listing description and highlights" : "Writing the listing description…"} />
        <p className="text-sm mt-2" style={{ color: MUTED }}>You don&apos;t need to wait here. Check the text before publishing.</p>
        <div className="flex gap-4 mt-3">
          <button type="button" onClick={() => setOpenText((v) => !v)} className="text-sm underline" style={{ color: NAVY }}>{openText ? "Hide" : "Check"} listing text</button>
          <button type="button" onClick={() => setOpenArea((v) => !v)} className="text-sm underline" style={{ color: NAVY }}>{openArea ? "Hide" : "Check"} neighbourhood</button>
        </div>
      </div>
      {openText && <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}><PreviewStep data={data} onChange={onChange} propertyId={id} /></div>}
      {openArea && <div className="rounded-xl border bg-white p-5" style={{ borderColor: BORDER }}><NeighbourhoodStep data={data} onChange={onChange} propertyId={id} /></div>}

      {err && <div role="alert" className="rounded-lg border px-4 py-3 text-sm bg-white" style={{ borderColor: "#8B2030", color: "#8B2030" }}>{err}</div>}
      {published ? (
        <a href={`/listings/${data.slug || id}`} target="_blank" className="block text-center px-6 py-4 text-sm font-semibold uppercase tracking-widest rounded border" style={{ borderColor: NAVY, color: NAVY }}>View the listing</a>
      ) : (
        <div>
          <Next onClick={publish} disabled={publishing}>{publishing ? "Publishing…" : "Publish the listing"}</Next>
          <p className="text-sm text-center mt-3" style={{ color: MUTED }}>Or leave it as a draft. It&apos;s saved.</p>
        </div>
      )}
    </div>
  );
}
