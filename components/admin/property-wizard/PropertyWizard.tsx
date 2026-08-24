"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import WizardProgress from "./WizardProgress";
import { useWizardAutoSave } from "./useWizardAutoSave";
import BasicsStep from "./steps/BasicsStep";
import LeaseStep from "./steps/LeaseStep";
import FeaturesStep from "./steps/FeaturesStep";
import PoliciesStep from "./steps/PoliciesStep";
import UtilitiesStep from "./steps/UtilitiesStep";
import NeighbourhoodStep from "./steps/NeighbourhoodStep";
import PhotosStep from "./steps/PhotosStep";
import PreviewStep from "./steps/PreviewStep";

const BG = "#F7F5F2";
const NAV = "#1F2F3A";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";

// ─── Full property data shape ───────────────────────────────
export interface WizardData {
  // Step 1: Basics
  title: string;
  address: string;
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
  // Meta
  available: boolean;
  status: string;
  wizard_step: number;
}

const BLANK: WizardData = {
  title: "", address: "", city: "London", property_type: "", price: "", bedrooms: "", bathrooms: "", sqft: "", available_date: "",
  lease_term: "", deposit: "", first_month_required: true, last_month_required: true, move_in_costs: { "Key Deposit": 100 },
  parking: false, parking_type: "none", laundry_type: "none", ac: false, heating_type: "", appliances: [], outdoor_space: "none", furnished: false, storage: false, elevator: false, wheelchair_accessible: false,
  pet_friendly: false, pet_policy: { cats: false, dogs: false, other: false, deposit: "", restrictions: "" }, smoking_allowed: false, guest_policy: "", quiet_hours: "", max_occupants: "",
  utilities_included: false, utilities_list: [],
  utilities_detail: { heat: { included: false, avg_cost: "" }, water: { included: false, avg_cost: "" }, hydro: { included: false, avg_cost: "" }, internet: { included: false, avg_cost: "" }, gas: { included: false, avg_cost: "" } },
  latitude: null, longitude: null, neighbourhood_data: {}, walk_score: "", transit_score: "", bike_score: "", bus_routes: [], neighbourhood_vibe: "",
  images: [], photo_labels: [], virtual_tour_url: "", floor_plan_url: "",
  description: "", ai_highlights: [], life_simulation: { morning: "", afternoon: "", evening: "", night: "" }, ai_life_intro: "",
  transparency: {}, marketplace_description: "",
  available: true, status: "draft", wizard_step: 1,
};

interface Props {
  initial?: Partial<WizardData> & { id?: string };
  // Set when this property is being added as the final step of a placement
  // onboarding (see docs/tenant-placement-os/05_OWNER_ONBOARDING.md). When
  // present, prefills from the onboarding intake and, on publish, creates
  // the leasing pipeline campaign automatically instead of requiring a
  // separate manual "+ Add Vacancy" click in /admin/leasing.
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

export default function PropertyWizard({ initial, onboardToken }: Props) {
  const router = useRouter();
  const [data, setData] = useState<WizardData>(() => ({ ...BLANK, ...initial }));
  const [currentStep, setCurrentStep] = useState(() => initial?.wizard_step || 1);
  const [propertyId, setPropertyId] = useState<string | null>(initial?.id || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dataRef = useRef(data);
  dataRef.current = data;

  // Prefill from the onboarding session's already-collected intake data
  useEffect(() => {
    if (!onboardToken || initial?.id) return;
    (async () => {
      const res = await fetch(`/api/onboard/${onboardToken}/status`).catch(() => null);
      if (!res?.ok) return;
      const session = await res.json();
      const step7 = (session.step7_data ?? {}) as Record<string, unknown>;
      const desiredRent = step7.desired_rent ? Number(step7.desired_rent) : null;
      setData((prev) => ({
        ...prev,
        address: session.property_address || "",
        city: session.property_city || "London",
        property_type: session.property_type ? String(session.property_type).toLowerCase() : "",
        bedrooms: session.bedrooms ?? "",
        bathrooms: session.bathrooms ?? "",
        price: desiredRent ?? (session.approx_monthly_rent ? Number(session.approx_monthly_rent) : ""),
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardToken, initial?.id]);

  // Update a field or set of fields
  const update = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  // Build the payload for saving
  const getPayload = useCallback(() => {
    const d = dataRef.current;
    return {
      title: d.title,
      address: d.address,
      city: d.city,
      property_type: d.property_type || null,
      price: d.price !== "" ? Number(d.price) : null,
      bedrooms: d.bedrooms !== "" ? Number(d.bedrooms) : null,
      bathrooms: d.bathrooms !== "" ? Number(d.bathrooms) : null,
      sqft: d.sqft !== "" ? Number(d.sqft) : null,
      available_date: d.available_date || null,
      lease_term: d.lease_term || null,
      deposit: d.deposit !== "" ? Number(d.deposit) : null,
      first_month_required: d.first_month_required,
      last_month_required: d.last_month_required,
      move_in_costs: d.move_in_costs,
      parking: d.parking,
      parking_type: d.parking_type || null,
      laundry_type: d.laundry_type || null,
      ac: d.ac,
      heating_type: d.heating_type || null,
      appliances: d.appliances,
      outdoor_space: d.outdoor_space || null,
      furnished: d.furnished,
      storage: d.storage,
      elevator: d.elevator,
      wheelchair_accessible: d.wheelchair_accessible,
      pet_friendly: d.pet_friendly,
      pet_policy: d.pet_policy,
      smoking_allowed: d.smoking_allowed,
      guest_policy: d.guest_policy || null,
      quiet_hours: d.quiet_hours || null,
      max_occupants: d.max_occupants !== "" ? Number(d.max_occupants) : null,
      utilities_included: d.utilities_included,
      utilities_list: d.utilities_list,
      utilities_detail: d.utilities_detail,
      latitude: d.latitude,
      longitude: d.longitude,
      neighbourhood_data: d.neighbourhood_data,
      walk_score: d.walk_score !== "" ? Number(d.walk_score) : null,
      transit_score: d.transit_score !== "" ? Number(d.transit_score) : null,
      bike_score: d.bike_score !== "" ? Number(d.bike_score) : null,
      bus_routes: d.bus_routes,
      neighbourhood_vibe: d.neighbourhood_vibe || null,
      images: d.images,
      photo_labels: d.photo_labels,
      virtual_tour_url: d.virtual_tour_url || null,
      floor_plan_url: d.floor_plan_url || null,
      description: d.description || null,
      ai_highlights: d.ai_highlights,
      life_simulation: d.life_simulation,
      ai_life_intro: d.ai_life_intro || null,
      transparency: d.transparency,
      available: d.available,
      wizard_step: Math.max(d.wizard_step, currentStep),
    };
  }, [currentStep]);

  const { scheduleSave, saveNow } = useWizardAutoSave(propertyId, getPayload, (saved) => {
    setSaving(false);
    if (saved.id && !propertyId) setPropertyId(saved.id as string);
  });

  // Create property on first save (Step 1 completion)
  async function createProperty() {
    setSaving(true);
    setError("");
    const payload = getPayload();
    const res = await fetch("/api/admin/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      setPropertyId(created.id);
      setSaving(false);
      return created.id;
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.error || "Failed to save. Try again.");
      setSaving(false);
      return null;
    }
  }

  // Navigate to next step
  async function goNext() {
    const nextStep = currentStep + 1;
    if (nextStep > 8) return;

    // Create property on first step if new
    if (!propertyId && currentStep === 1) {
      const id = await createProperty();
      if (!id) return;
      // Update URL so refresh loads the saved property
      window.history.replaceState(null, "", `/admin/properties/${id}`);
      setData((prev) => ({ ...prev, wizard_step: Math.max(prev.wizard_step, nextStep) }));
      setCurrentStep(nextStep);
      return;
    } else {
      setSaving(true);
      await saveNow();
      setSaving(false);
      // Auto-fill deposit with price if still empty
      if (currentStep === 1 && dataRef.current.deposit === "" && dataRef.current.price !== "") {
        update({ deposit: Number(dataRef.current.price) });
      }
    }

    setData((prev) => ({ ...prev, wizard_step: Math.max(prev.wizard_step, nextStep) }));
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Navigate to previous step
  function goPrev() {
    if (currentStep <= 1) return;
    if (propertyId) scheduleSave();
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Go to specific step (from sidebar)
  function goToStep(step: number) {
    if (step > data.wizard_step + 1) return;
    if (propertyId) scheduleSave();
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Trigger auto-save on field change
  function onChange(partial: Partial<WizardData>) {
    update(partial);
    if (propertyId) scheduleSave();
  }

  // Mobile step indicator
  const mobileStepLabel = ["", "Basics", "Lease & Move-In", "Features", "Policies", "Utilities", "Neighbourhood", "Photos & Media", "Preview & Publish"][currentStep];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: NAV, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => router.push("/admin/properties")} className="text-sm transition-colors" style={{ color: "rgba(250,248,245,0.55)" }}>
          ← Properties
        </button>
        <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: "#FAF8F5" }}>
          {initial?.id ? "Edit Property" : "New Property"}
        </span>
        {saving && <span className="text-xs ml-auto" style={{ color: "rgba(250,248,245,0.55)" }}>Saving...</span>}
      </div>

      {/* Mobile step indicator */}
      <div className="lg:hidden px-6 py-3 flex items-center justify-between" style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
        <span className="text-xs font-medium" style={{ color: TEXT_SEC }}>Step {currentStep} of 8 · {mobileStepLabel}</span>
        <div className="flex gap-1">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width: i + 1 === currentStep ? 20 : 8,
                backgroundColor: i + 1 <= currentStep ? "#8B2030" : "#D8D2C8",
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <WizardProgress
          currentStep={currentStep}
          highestStep={data.wizard_step}
          onStepClick={goToStep}
          isSaving={saving}
          status={data.status}
        />

        {/* Step content */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(139,32,48,0.08)", color: "#8B2030" }}>
              {error}
            </div>
          )}

          {currentStep === 1 && <BasicsStep data={data} onChange={onChange} />}
          {currentStep === 2 && <LeaseStep data={data} onChange={onChange} />}
          {currentStep === 3 && <FeaturesStep data={data} onChange={onChange} />}
          {currentStep === 4 && <PoliciesStep data={data} onChange={onChange} />}
          {currentStep === 5 && <UtilitiesStep data={data} onChange={onChange} />}
          {currentStep === 6 && <NeighbourhoodStep data={data} onChange={onChange} propertyId={propertyId} />}
          {currentStep === 7 && <PhotosStep data={data} onChange={onChange} propertyId={propertyId} />}
          {currentStep === 8 && <PreviewStep data={data} onChange={onChange} propertyId={propertyId} />}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pb-10">
            <button
              onClick={goPrev}
              disabled={currentStep <= 1}
              className="px-6 py-3 text-sm rounded-lg transition-opacity disabled:opacity-20"
              style={{ color: TEXT_SEC, border: `1px solid #D8D2C8` }}
            >
              ← Previous
            </button>

            {currentStep < 8 ? (
              <button
                onClick={goNext}
                disabled={saving}
                className="px-8 py-3 text-sm text-white rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "#8B2030" }}
              >
                {saving ? "Saving..." : currentStep === 1 && !propertyId ? "Save & Continue" : "Next →"}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await saveNow();
                    router.push("/admin/properties");
                  }}
                  className="px-6 py-3 text-sm rounded-lg transition-opacity"
                  style={{ color: TEXT_SEC, border: `1px solid #D8D2C8` }}
                >
                  Save Draft
                </button>
                <button
                  onClick={async () => {
                    if (!propertyId) return;
                    setSaving(true);
                    await saveNow();
                    const pubRes = await fetch(`/api/admin/properties/${propertyId}/publish`, { method: "POST" });
                    if (!pubRes.ok) {
                      const err = await pubRes.json().catch(() => ({}));
                      setError(err.error || "Publish failed. Try again.");
                      setSaving(false);
                      return;
                    }
                    update({ status: "published" });

                    // Placement onboarding → auto-create the leasing pipeline
                    // campaign instead of requiring a manual "+ Add Vacancy"
                    // click, so the flow really is click-to-close.
                    if (onboardToken) {
                      const campaignId = await createCampaignFromOnboarding(onboardToken, propertyId, dataRef.current.price);
                      if (campaignId) {
                        router.push(`/admin/leasing/${campaignId}`);
                        return;
                      }
                    }

                    router.push("/admin/properties");
                  }}
                  disabled={saving}
                  className="px-8 py-3 text-sm text-white rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: "#8B2030" }}
                >
                  Publish Listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
