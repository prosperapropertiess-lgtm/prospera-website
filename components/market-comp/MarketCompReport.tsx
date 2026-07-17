"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  MapPin,
  TrendingUp,
  Clock,
  Home,
  ChevronDown,
  ChevronUp,
  Bus,
  Star,
  Navigation,
} from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import RentSimulator from "./RentSimulator";

// ── Colour tokens ─────────────────────────────────────────────────────────────
const NAVY      = "#1F2F3A";
const BURGUNDY  = "#8B2030";
const WARM_BG   = "#F7F5F2";
const WHITE     = "#FFFFFF";
const BORDER    = "#D8D2C8";
const TEXT      = "#222222";
const MUTED     = "#666666";
const GREEN     = "#0A7A52";
const AMBER     = "#B45309";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NeighbourhoodPlace {
  name: string;
  address?: string;
  distance?: number;
  walk_time?: number;
  rating?: number;
}

interface Comparable {
  address: string;
  rent: number;
  days_on_market: number | null;
  ad_description: string;
  bedrooms?: number;
  bathrooms?: number;
  neighbourhood_data?: Record<string, NeighbourhoodPlace[]>;
  walk_score?: number;
  transit_score?: number;
  bike_score?: number;
  bus_routes?: Array<{ route: string; stop_name: string }>;
  latitude?: number;
  longitude?: number;
}

export interface MarketCompData {
  token: string;
  owner_name: string | null;
  property_address: string | null;
  property_city: string | null;
  property_type: string | null;
  service_type: string | null;
  approx_monthly_rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  parking_type: string | null;
  property_condition: string | null;
  owner_action_items: string | null;
  rent_insights: string[];
  rent_low: number | null;
  rent_market: number | null;
  rent_premium: number | null;
  comparables: Comparable[];
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDollar(n: number | null | undefined): string {
  if (!n) return "—";
  return `$${n.toLocaleString("en-CA")}`;
}

function haversineKm(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function truncateAddress(addr: string, max = 28): string {
  return addr.length > max ? addr.slice(0, max) + "…" : addr;
}

const AMENITY_CATEGORIES = [
  "grocery", "pharmacy", "transit", "schools",
  "parks", "restaurants", "cafes", "banks", "gyms", "hospitals",
] as const;

type AmenityCategory = typeof AMENITY_CATEGORIES[number];

const CATEGORY_LABELS: Record<AmenityCategory, string> = {
  grocery:     "Grocery",
  pharmacy:    "Pharmacy",
  transit:     "Transit",
  schools:     "Schools",
  parks:       "Parks",
  restaurants: "Restaurants",
  cafes:       "Cafes",
  banks:       "Banks",
  gyms:        "Gyms",
  hospitals:   "Hospitals",
};

function amenityCount(
  data: Record<string, NeighbourhoodPlace[]> | undefined,
  cat: AmenityCategory
): number {
  return data?.[cat]?.length ?? 0;
}

// ── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, label, color }: {
  score: number;
  label: string;
  color: string;
}) {
  const pct = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 15.9155;
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={BORDER}
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
        <text
          x="18"
          y="20.35"
          textAnchor="middle"
          className="rotate-90"
          style={{
            fontSize: "8px",
            fontWeight: 700,
            fill: TEXT,
            fontFamily: "var(--font-dm-sans)",
            transformOrigin: "18px 18px",
            transform: "rotate(90deg)",
          }}
        >
          {score}
        </text>
      </svg>
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: MUTED, fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Score Bar (horizontal comparison) ────────────────────────────────────────

function ScoreBar({
  label, subjectScore, compScore,
}: { label: string; subjectScore: number; compScore: number }) {
  const max = 100;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: MUTED }}>{label}</span>
        <div className="flex gap-3 text-xs">
          <span style={{ color: NAVY, fontWeight: 600 }}>Subject: {subjectScore}</span>
          <span style={{ color: MUTED }}>Comp: {compScore}</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: BORDER }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${(subjectScore / max) * 100}%`,
            background: NAVY,
            opacity: 0.25,
          }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${(compScore / max) * 100}%`,
            background: compScore > subjectScore ? AMBER : GREEN,
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}

// ── Rent Tier Card ────────────────────────────────────────────────────────────

function RentTierCard({
  label, price, fillTime, note, accent,
}: {
  label: string; price: string; fillTime: string; note: string; accent?: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-xl p-6 border"
      style={{
        background: accent ? NAVY : WHITE,
        borderColor: accent ? NAVY : BORDER,
        boxShadow: accent
          ? "0 8px 32px rgba(31,47,58,0.18)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: accent ? "rgba(250,248,245,0.55)" : MUTED }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-bold mb-1"
        style={{
          color: accent ? "#FAF8F5" : TEXT,
          fontFamily: "var(--font-cormorant)",
        }}
      >
        {price}
      </p>
      <p
        className="text-sm font-medium mb-3"
        style={{ color: accent ? "rgba(250,248,245,0.70)" : MUTED }}
      >
        {fillTime}
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: accent ? "rgba(250,248,245,0.60)" : MUTED }}
      >
        {note}
      </p>
      {accent && (
        <div
          className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: BURGUNDY, color: "#FAF8F5" }}
        >
          Recommended
        </div>
      )}
    </div>
  );
}

// ── Comparable Card ───────────────────────────────────────────────────────────

function ComparableCard({
  comp, index, subjectLat, subjectLng, subjectNeighbourhood,
  subjectWalk, subjectTransit, subjectBike,
}: {
  comp: Comparable;
  index: number;
  subjectLat?: number;
  subjectLng?: number;
  subjectNeighbourhood?: Record<string, NeighbourhoodPlace[]>;
  subjectWalk: number;
  subjectTransit: number;
  subjectBike: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const distKm =
    subjectLat && subjectLng && comp.latitude && comp.longitude
      ? haversineKm(subjectLat, subjectLng, comp.latitude, comp.longitude)
      : null;

  const hasDOM = comp.days_on_market !== null && comp.days_on_market > 0;
  const compWalk = comp.walk_score ?? 0;
  const compTransit = comp.transit_score ?? 0;
  const compBike = comp.bike_score ?? 0;

  return (
    <div
      className="rounded-xl border bg-white"
      style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: NAVY, color: "#FAF8F5" }}
              >
                {index + 1}
              </span>
              <h3
                className="font-bold text-base"
                style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}
              >
                {comp.address}
              </h3>
            </div>
            <div className="flex items-center gap-4 flex-wrap mt-2">
              {distKm !== null && (
                <span className="flex items-center gap-1 text-sm" style={{ color: MUTED }}>
                  <Navigation size={13} />
                  {distKm < 1
                    ? `${Math.round(distKm * 1000)}m away`
                    : `${distKm.toFixed(1)}km away`}
                </span>
              )}
              {comp.bedrooms != null && (
                <span className="text-sm" style={{ color: MUTED }}>
                  {comp.bedrooms} bed{comp.bedrooms !== 1 ? "s" : ""}
                  {comp.bathrooms != null ? ` · ${comp.bathrooms} bath` : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-right">
              <p
                className="text-2xl font-bold"
                style={{ color: TEXT, fontFamily: "var(--font-cormorant)" }}
              >
                {fmtDollar(comp.rent)}
                <span className="text-sm font-normal text-gray-400">/mo</span>
              </p>
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
              style={{
                background: hasDOM
                  ? "rgba(180,83,9,0.10)"
                  : "rgba(10,122,82,0.10)",
                color: hasDOM ? AMBER : GREEN,
              }}
            >
              {hasDOM
                ? `Listed ${comp.days_on_market}d ago`
                : "Active listing"}
            </span>
          </div>
        </div>
      </div>

      {/* Walk/transit scores comparison */}
      {(compWalk > 0 || subjectWalk > 0) && (
        <div className="px-6 pb-4">
          <ScoreBar label="Walk Score" subjectScore={subjectWalk} compScore={compWalk} />
          <ScoreBar label="Transit Score" subjectScore={subjectTransit} compScore={compTransit} />
          <ScoreBar label="Bike Score" subjectScore={subjectBike} compScore={compBike} />
        </div>
      )}

      {/* Amenity comparison */}
      {(comp.neighbourhood_data || subjectNeighbourhood) && (
        <div className="px-6 pb-4">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: MUTED }}
          >
            Nearby Amenities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(["grocery", "transit", "parks", "cafes", "gyms", "restaurants"] as AmenityCategory[]).map((cat) => {
              const subCount = amenityCount(subjectNeighbourhood, cat);
              const compCount = amenityCount(comp.neighbourhood_data, cat);
              const better = subCount >= compCount;
              return (
                <div
                  key={cat}
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: WARM_BG,
                    borderLeft: `3px solid ${better ? GREEN : AMBER}`,
                  }}
                >
                  <span className="font-semibold capitalize" style={{ color: TEXT }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <div className="flex gap-2 mt-0.5" style={{ color: MUTED }}>
                    <span>Subject: <strong style={{ color: better ? GREEN : TEXT }}>{subCount}</strong></span>
                    <span>·</span>
                    <span>Comp: <strong>{compCount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bus routes */}
      {comp.bus_routes && comp.bus_routes.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {comp.bus_routes.slice(0, 4).map((r, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                style={{ background: "rgba(31,47,58,0.07)", color: NAVY }}
              >
                <Bus size={11} />
                Route {r.route} — {r.stop_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable description */}
      {comp.ad_description && (
        <div className="border-t" style={{ borderColor: BORDER }}>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: MUTED }}
          >
            <span>Original listing description</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expanded && (
            <div
              className="px-6 pb-5 text-sm leading-relaxed"
              style={{
                color: MUTED,
                background: WARM_BG,
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              {comp.ad_description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Amenity Matrix ────────────────────────────────────────────────────────────

function AmenityMatrix({
  subjectData,
  comparables,
}: {
  subjectData?: Record<string, NeighbourhoodPlace[]>;
  comparables: Comparable[];
}) {
  const compsWithData = comparables.filter((c) => c.neighbourhood_data);
  if (!subjectData && compsWithData.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: MUTED, background: WARM_BG, borderBottom: `1px solid ${BORDER}` }}
            >
              Category
            </th>
            <th
              className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-widest"
              style={{
                color: "#FAF8F5",
                background: NAVY,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              Your Property
            </th>
            <th
              className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-widest"
              style={{ color: MUTED, background: WARM_BG, borderBottom: `1px solid ${BORDER}` }}
            >
              Comp Average
            </th>
            <th
              className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-widest"
              style={{ color: MUTED, background: WARM_BG, borderBottom: `1px solid ${BORDER}` }}
            >
              Edge
            </th>
          </tr>
        </thead>
        <tbody>
          {AMENITY_CATEGORIES.map((cat, i) => {
            const subCount = amenityCount(subjectData, cat);
            const compAvg =
              compsWithData.length > 0
                ? Math.round(
                    compsWithData.reduce(
                      (sum, c) => sum + amenityCount(c.neighbourhood_data, cat),
                      0
                    ) / compsWithData.length
                  )
                : 0;
            const better = subCount >= compAvg;
            const diff = subCount - compAvg;

            return (
              <tr
                key={cat}
                style={{ background: i % 2 === 0 ? WHITE : WARM_BG }}
              >
                <td className="py-3 px-4 font-medium" style={{ color: TEXT }}>
                  {CATEGORY_LABELS[cat]}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className="font-bold text-base"
                    style={{ color: NAVY }}
                  >
                    {subCount}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-medium" style={{ color: MUTED }}>
                    {compAvg}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: better
                        ? "rgba(10,122,82,0.10)"
                        : "rgba(180,83,9,0.10)",
                      color: better ? GREEN : AMBER,
                    }}
                  >
                    {diff >= 0 ? `+${diff}` : diff}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Neighbourhood Category ────────────────────────────────────────────────────

function NeighbourhoodCategory({
  label,
  places,
}: {
  label: string;
  places: NeighbourhoodPlace[];
}) {
  const [open, setOpen] = useState(false);
  if (!places || places.length === 0) return null;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: BORDER }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white text-left transition-opacity hover:opacity-80"
      >
        <div className="flex items-center gap-3">
          <span
            className="font-semibold"
            style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}
          >
            {label}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(31,47,58,0.07)",
              color: NAVY,
            }}
          >
            {places.length}
          </span>
        </div>
        {open ? (
          <ChevronUp size={16} style={{ color: MUTED }} />
        ) : (
          <ChevronDown size={16} style={{ color: MUTED }} />
        )}
      </button>

      {open && (
        <div className="divide-y" style={{ borderColor: BORDER }}>
          {places.slice(0, 8).map((p, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 px-5 py-3"
              style={{ background: WARM_BG }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: TEXT }}>
                  {p.name}
                </p>
                {p.address && (
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                    {p.address}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {p.distance != null && (
                  <span className="text-xs font-medium" style={{ color: MUTED }}>
                    {p.distance < 1000
                      ? `${p.distance}m`
                      : `${(p.distance / 1000).toFixed(1)}km`}
                  </span>
                )}
                {p.rating != null && p.rating > 0 && (
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: AMBER }}
                  >
                    <Star size={10} fill={AMBER} />
                    {p.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; rent: number; isSubject: boolean } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-lg border text-sm"
      style={{ background: WHITE, borderColor: BORDER, color: TEXT }}
    >
      <p className="font-semibold mb-1">{d.label}</p>
      <p style={{ color: d.isSubject ? BURGUNDY : NAVY }}>
        {fmtDollar(d.rent)}/mo
      </p>
    </div>
  );
}

// ── Owner Action Plan ─────────────────────────────────────────────────────────

function OwnerActionPlan({ condition, ownerActionItems }: { condition: string | null; ownerActionItems: string | null }) {
  // Only the checkbox part (before "Agent notes:") goes in the owner column
  const rawOwnerPart = ownerActionItems
    ? ownerActionItems.split(/Agent notes:/i)[0]
    : "";

  // Parse checked items — only lines that look like bullet/dash items
  const ownerLines = rawOwnerPart
    .split(/\n/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  const hasOwnerItems = ownerLines.length > 0;

  const prospераItems = [
    { title: "Professional photography", desc: "High-quality photos and a polished listing that stands out." },
    { title: "Listed everywhere", desc: "Syndicated across Kijiji, Rentals.ca, Facebook, and social." },
    { title: "Same-day responses", desc: "Every inquiry answered the same day — no one slips through." },
    { title: "Full tenant screening", desc: "Background, credit, and reference checks on every applicant." },
    { title: "Lease handled for you", desc: "We prepare and execute the lease. You just sign off." },
  ];

  return (
    <section className="px-5 sm:px-8 py-16 sm:py-20" style={{ backgroundColor: WARM_BG }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: MUTED }}>
            Before We List
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center" style={{ color: NAVY, fontFamily: "var(--font-dm-sans)" }}>
            {hasOwnerItems ? "A few things from you — then we take over." : "Your property is ready."}
          </h2>
          <p className="text-sm text-center mb-12 max-w-lg mx-auto" style={{ color: MUTED, lineHeight: 1.8 }}>
            {hasOwnerItems
              ? "Not urgent — but these will help it rent faster and at a stronger price."
              : "Move-in ready and well-maintained. The work from here is ours."}
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-12">

            {/* Owner suggestions */}
            {hasOwnerItems && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1" style={{ background: BORDER }} />
                  <span className="text-xs font-semibold uppercase tracking-widest px-3" style={{ color: BURGUNDY }}>
                    A few suggestions
                  </span>
                  <div className="h-px flex-1" style={{ background: BORDER }} />
                </div>
                <div className="flex flex-col gap-3">
                  {ownerLines.map((line, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-2xl p-5"
                      style={{
                        background: WHITE,
                        border: `1px solid ${BORDER}`,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: "rgba(139,32,48,0.08)", color: BURGUNDY }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: TEXT }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prospera items */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: BORDER }} />
                <span className="text-xs font-semibold uppercase tracking-widest px-3" style={{ color: NAVY }}>
                  What Prospera handles
                </span>
                <div className="h-px flex-1" style={{ background: BORDER }} />
              </div>
              <div className="flex flex-col gap-3">
                {prospераItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-2xl p-5"
                    style={{
                      background: WHITE,
                      border: `1px solid ${BORDER}`,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(10,122,82,0.10)", color: GREEN }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: TEXT }}>{item.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Main Report Component ─────────────────────────────────────────────────────

export default function MarketCompReport({ data }: { data: MarketCompData }) {
  const {
    owner_name, property_address, property_city, property_type, service_type,
    approx_monthly_rent, bedrooms, bathrooms, parking_spots, parking_type, property_condition, owner_action_items,
    rent_insights,
    rent_low, rent_market, rent_premium,
    comparables, created_at, token,
  } = data;

  const firstName = owner_name?.split(" ")[0] ?? "there";
  const fullAddress = [property_address, property_city].filter(Boolean).join(", ");
  const dateStr = new Date(created_at).toLocaleDateString("en-CA", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Derive rent range from comparables if not set
  const rents = comparables.map((c) => c.rent).filter(Boolean);
  const derivedLow     = rent_low     ?? (rents.length ? Math.min(...rents) : null);
  const derivedMarket  = rent_market  ?? (rents.length ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : null);
  const derivedPremium = rent_premium ?? (rents.length ? Math.max(...rents) : null);
  const avgRent = derivedMarket ?? (rents.length ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : 0);

  // Subject property neighbourhood from first comp's structure if subject has none
  const subjectNeighbourhood = undefined as Record<string, NeighbourhoodPlace[]> | undefined;
  const subjectWalk    = 0;
  const subjectTransit = 0;
  const subjectBike    = 0;

  // Chart data
  const chartData = [
    {
      label: truncateAddress(property_address ?? "Your property"),
      rent: approx_monthly_rent ?? derivedMarket ?? 0,
      isSubject: true,
    },
    ...comparables.map((c) => ({
      label: truncateAddress(c.address),
      rent: c.rent,
      isSubject: false,
    })),
  ];

  // Suggestions — prefer Claude-parsed insights from agent notes; fall back to defaults
  const suggestions: string[] = rent_insights && rent_insights.length > 0
    ? rent_insights
    : (() => {
        const fallback: string[] = [];
        if (comparables.length > 0) {
          const subRent = approx_monthly_rent ?? derivedMarket ?? 0;
          if (subRent < (derivedMarket ?? 0) * 0.95) {
            fallback.push(
              "Your asking rent is below market rate. Pricing at market or premium typically reduces vacancy by attracting stronger applicants who see value and commit faster."
            );
          }
        }
        fallback.push(
          "Including utilities (water, heat) in the rent allows you to list at a higher rate — many tenants pay a premium for predictable monthly costs.",
          "Professional photos of clean, staged rooms reduce days on market by 30–50% on average.",
          "A freshly painted unit with updated fixtures signals a well-maintained property and supports top-of-range pricing.",
          "Offering one month free on a 12-month lease is perceived as a better incentive than a lower monthly rent, while preserving your legal rental rate for future increases."
        );
        return fallback;
      })();

  return (
    <div style={{ background: WARM_BG, fontFamily: "var(--font-dm-sans)" }}>

      {/* ── A. Hero ────────────────────────────────────────────────────────── */}
      <section style={{ background: NAVY }} className="px-5 sm:px-8 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "rgba(250,248,245,0.45)" }}
            >
              Market Analysis Report
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              {fullAddress || "Your Property"}
            </h1>
            <p
              className="text-lg sm:text-xl mb-8"
              style={{ color: "rgba(250,248,245,0.65)" }}
            >
              Prepared for {firstName}
            </p>
            <div
              className="flex flex-wrap gap-6"
              style={{ color: "rgba(250,248,245,0.45)" }}
            >
              <span className="flex items-center gap-2 text-sm">
                <MapPin size={14} />
                {property_city ?? "Ontario"}
              </span>
              <span className="flex items-center gap-2 text-sm">
                <TrendingUp size={14} />
                {comparables.length} comparable{comparables.length !== 1 ? "s" : ""} analysed
              </span>
              <span className="flex items-center gap-2 text-sm">
                <Clock size={14} />
                {dateStr}
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── B. Executive Summary ───────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
              style={{ color: "#999999" }}
            >
              Executive Summary
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-6"
              style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}
            >
              What the market supports
            </h2>
            <p
              className="text-base leading-relaxed text-center max-w-2xl mx-auto mb-12"
              style={{ color: "#333333" }}
            >
              Based on {comparables.length} comparable {comparables.length === 1 ? "property" : "properties"} within 2km of{" "}
              {property_address ?? "your property"}, the current market supports rent between{" "}
              <strong>{fmtDollar(derivedLow)}</strong> and{" "}
              <strong>{fmtDollar(derivedPremium)}</strong>
              {bedrooms != null ? ` for a ${bedrooms}-bedroom unit` : ""}.
            </p>

            {/* Rent tier cards */}
            <div className="flex flex-col sm:flex-row gap-4">
              <RentTierCard
                label="Conservative"
                price={fmtDollar(derivedLow)}
                fillTime="Faster fill time"
                note="Priced to attract maximum applicant volume. Reduces vacancy days. Suitable if a quick, reliable tenant is the priority."
              />
              <RentTierCard
                label="Market Rate"
                price={fmtDollar(derivedMarket)}
                fillTime="Typical fill time"
                note="Aligned with comparable units currently active in your neighbourhood. Balanced approach for quality tenants."
                accent
              />
              <RentTierCard
                label="Premium"
                price={fmtDollar(derivedPremium)}
                fillTime="Longer fill time"
                note="Top-of-market positioning. Justifiable with recent renovations, included utilities, or standout features."
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── C. Property Overview ───────────────────────────────────────────── */}
      <section
        className="px-5 sm:px-8 py-16 sm:py-20"
        style={{ background: WHITE }}
      >
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
              style={{ color: "#999999" }}
            >
              Subject Property
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-10"
              style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}
            >
              Your property at a glance
            </h2>

            {(() => {
              const details = [
                { label: "Address", value: property_address },
                { label: "City", value: property_city },
                { label: "Type", value: property_type },
                { label: "Service", value: service_type === "management" ? "Placement + Management" : "Tenant Placement" },
                { label: "Bedrooms", value: bedrooms != null ? `${bedrooms} bed${bedrooms !== 1 ? "s" : ""}` : null },
                { label: "Bathrooms", value: bathrooms != null ? `${bathrooms} bath${bathrooms !== 1 ? "s" : ""}` : null },
                { label: "Parking", value: parking_type && parking_type !== "none" ? `${parking_spots || 1} spot${(parking_spots || 1) > 1 ? "s" : ""} · ${parking_type === "driveway" ? "Driveway" : parking_type === "garage" ? "Garage" : parking_type === "street" ? "Street" : parking_type}` : parking_spots ? `${parking_spots} spot${parking_spots > 1 ? "s" : ""}` : null },
                { label: "Condition", value: property_condition ? ({ needs_work: "Needs Work", fair: "Fair", good: "Good", great: "Great", move_in_ready: "Move-In Ready" }[property_condition] || property_condition) : null },
              ].filter((r) => r.value);
              const lastRowStart = details.length % 2 === 0 ? details.length - 2 : details.length - 1;
              return (
                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: BORDER, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  {/* Asking rent hero */}
                  {approx_monthly_rent && (
                    <div className="px-8 py-7 text-center" style={{ background: NAVY }}>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(250,248,245,0.4)" }}>
                        Asking Rent
                      </p>
                      <p className="text-4xl sm:text-5xl font-bold" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                        {fmtDollar(approx_monthly_rent)}<span className="text-xl font-normal" style={{ opacity: 0.45 }}>/mo</span>
                      </p>
                    </div>
                  )}

                  {/* 2-column detail grid */}
                  <div className="grid grid-cols-2">
                    {details.map(({ label, value }, i) => (
                      <div
                        key={label}
                        className="px-6 py-5"
                        style={{
                          borderRight: i % 2 === 0 ? `1px solid ${BORDER}` : undefined,
                          borderBottom: i < lastRowStart ? `1px solid ${BORDER}` : undefined,
                          background: Math.floor(i / 2) % 2 === 0 ? WHITE : WARM_BG,
                        }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: MUTED }}>
                          {label}
                        </p>
                        <p className="font-semibold text-base" style={{ color: TEXT }}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Walkability scores — only if available */}
                  {(subjectWalk > 0 || subjectTransit > 0 || subjectBike > 0) && (
                    <div className="px-7 py-6" style={{ borderTop: `1px solid ${BORDER}`, background: WARM_BG }}>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: MUTED }}>
                        Walkability Scores
                      </p>
                      <div className="flex gap-8 flex-wrap">
                        <ScoreCircle score={subjectWalk} label="Walk" color={NAVY} />
                        <ScoreCircle score={subjectTransit} label="Transit" color={BURGUNDY} />
                        <ScoreCircle score={subjectBike} label="Bike" color={GREEN} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </FadeIn>
        </div>
      </section>

      {/* ── D. Comparable Properties ───────────────────────────────────────── */}
      {comparables.length > 0 && (
        <section className="px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
                style={{ color: "#999999" }}
              >
                Comparable Properties
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-center mb-3"
                style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}
              >
                {comparables.length} units researched
              </h2>
              <p
                className="text-base text-center mb-12"
                style={{ color: MUTED }}
              >
                Each unit was found on the active rental market and verified manually.
              </p>
            </FadeIn>

            <div className="flex flex-col gap-5">
              {comparables.slice(0, 5).map((comp, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <ComparableCard
                    comp={comp}
                    index={i}
                    subjectNeighbourhood={subjectNeighbourhood}
                    subjectWalk={subjectWalk}
                    subjectTransit={subjectTransit}
                    subjectBike={subjectBike}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── E. Rent Distribution Chart ─────────────────────────────────────── */}
      {chartData.length > 1 && (
        <section
          className="px-5 sm:px-8 py-16 sm:py-20"
          style={{ background: WHITE }}
        >
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
                style={{ color: "#999999" }}
              >
                Rent Distribution
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-center mb-12"
                style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}
              >
                Where your property sits in the market
              </h2>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: MUTED, fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: MUTED, fontSize: 11, fontFamily: "var(--font-dm-sans)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  {avgRent > 0 && (
                    <ReferenceLine
                      y={avgRent}
                      stroke={MUTED}
                      strokeDasharray="6 3"
                      label={{
                        value: `Avg ${fmtDollar(avgRent)}`,
                        fill: MUTED,
                        fontSize: 11,
                        fontFamily: "var(--font-dm-sans)",
                        position: "right",
                      }}
                    />
                  )}
                  <Bar dataKey="rent" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.isSubject ? BURGUNDY : NAVY}
                        opacity={entry.isSubject ? 1 : 0.65}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: BURGUNDY }} />
                  <span className="text-xs" style={{ color: MUTED }}>Your property</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: NAVY, opacity: 0.65 }} />
                  <span className="text-xs" style={{ color: MUTED }}>Comparables</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── Owner Action Plan ──────────────────────────────────────────── */}
      {(property_condition || owner_action_items) && (
        <OwnerActionPlan condition={property_condition} ownerActionItems={owner_action_items} />
      )}

      {/* ── Interactive Rent Simulator ──────────────────────────────────── */}
      {rent_low && rent_market && rent_premium && (
        <RentSimulator
          rentLow={rent_low}
          rentMarket={rent_market}
          rentPremium={rent_premium}
          compRents={comparables.map((c) => c.rent).filter(Boolean)}
        />
      )}

      {/* ── F. Amenity Comparison Matrix ───────────────────────────────────── */}
      {comparables.some((c) => c.neighbourhood_data) && (
        <section className="px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
                style={{ color: "#999999" }}
              >
                Neighbourhood Comparison
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-center mb-3"
                style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}
              >
                Amenity matrix
              </h2>
              <p
                className="text-base text-center mb-10"
                style={{ color: MUTED }}
              >
                Your property vs. the average across all comparables within 1km.
              </p>

              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <AmenityMatrix
                  subjectData={subjectNeighbourhood}
                  comparables={comparables}
                />
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── G. Neighbourhood Intelligence ─────────────────────────────────── */}
      {subjectNeighbourhood && Object.keys(subjectNeighbourhood).length > 0 && (
        <section
          className="px-5 sm:px-8 py-16 sm:py-20"
          style={{ background: WHITE }}
        >
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
                style={{ color: "#999999" }}
              >
                Neighbourhood Intelligence
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-center mb-3"
                style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}
              >
                What&apos;s nearby
              </h2>
              <p
                className="text-base text-center mb-10"
                style={{ color: MUTED }}
              >
                Detailed breakdown of what tenants can access within walking distance of{" "}
                {property_address}.
              </p>

              <div className="flex flex-col gap-3">
                {AMENITY_CATEGORIES.map((cat) => {
                  const places = subjectNeighbourhood[cat] ?? [];
                  return (
                    <NeighbourhoodCategory
                      key={cat}
                      label={CATEGORY_LABELS[cat]}
                      places={places}
                    />
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ── H. Ways to Increase Rent ────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
              style={{ color: "#999999" }}
            >
              Rental Strategy
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-center mb-3"
              style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}
            >
              How to command top rent
            </h2>
            <p
              className="text-base text-center mb-12"
              style={{ color: MUTED }}
            >
              Specific actions based on this market analysis.
            </p>

            <div className="flex flex-col gap-4">
              {suggestions.map((s, i) => {
                // Render **bold** markdown inline
                const parts = s.split(/(\*\*[^*]+\*\*)/g);
                return (
                  <div
                    key={i}
                    className="flex gap-4 rounded-xl border bg-white p-6"
                    style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(139,32,48,0.08)", color: BURGUNDY }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-base leading-relaxed" style={{ color: "#333333" }}>
                      {parts.map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j} style={{ color: TEXT }}>{part.slice(2, -2)}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── I. Bottom CTA ───────────────────────────────────────────────────── */}
      <section
        className="px-5 sm:px-8 py-20 sm:py-24"
        style={{ background: NAVY }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{ background: "rgba(139,32,48,0.25)", color: "#FAF8F5" }}
            >
              Next step
            </div>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-5"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              Ready to move forward?
            </h2>
            <p
              className="text-base mb-10 max-w-xl mx-auto"
              style={{ color: "rgba(250,248,245,0.65)" }}
            >
              We place your tenant, collect first month&apos;s rent as our fee, and last month goes
              directly to you before key handover. No ongoing fees unless you choose management.
            </p>

            <div className="flex flex-col items-center gap-5">
              <a
                href={`/onboard/${token}/agreement`}
                style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}
                className="px-10 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
              >
                Sign Placement Agreement
              </a>

              <div className="flex items-center gap-2">
                <Home size={14} style={{ color: "rgba(250,248,245,0.40)" }} />
                <a
                  href="tel:5196971227"
                  className="text-xs font-medium uppercase tracking-widest pb-px transition-opacity hover:opacity-60"
                  style={{ color: "rgba(250,248,245,0.55)", borderBottom: "1px solid rgba(250,248,245,0.20)" }}
                >
                  Questions? Call Ebin — (519) 697-1227
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
