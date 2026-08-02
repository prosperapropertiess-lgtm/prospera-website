"use client";

import LifeSimHero from "./LifeSimHero";
import QuickSummary from "./QuickSummary";
import ShareBar from "./ShareBar";
import PhotoGallery from "./PhotoGallery";
import PropertyHighlights from "./PropertyHighlights";
import IdealTenant from "./IdealTenant";
import DetailedFeatures from "./DetailedFeatures";
import DailyRoutine from "./DailyRoutine";
import MicroLocation from "./MicroLocation";
import NeighbourhoodVibe from "./NeighbourhoodVibe";
import CostsBreakdown from "./CostsBreakdown";
import TransparencySection from "./TransparencySection";
import PoliciesSection from "./PoliciesSection";
import CommuteSimulator from "./CommuteSimulator";
import ApplicationProcess from "./ApplicationProcess";
import SocialProof from "./SocialProof";
import ProspaBenefits from "./ProspaBenefits";
import StickyCTA from "./StickyCTA";
import BookViewingButton from "./BookViewingButton";
import FaqSection from "./FaqSection";
import RentedBanner from "./RentedBanner";
import type { FaqItem } from "@/app/listings/[slug]/page";

export interface PropertyRecord extends Record<string, unknown> {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number | null;
  property_type?: string | null;
  available_date?: string | null;
  available?: boolean;
  pet_friendly?: boolean;
  buildium_link?: string | null;
  images?: string[] | null;
  photo_labels?: Array<{ label: string; url: string }> | null;
  ai_life_intro?: string | null;
  ai_highlights?: string[] | null;
  life_simulation?: Record<string, string> | null;
  neighbourhood_data?: Record<string, unknown> | null;
  neighbourhood_vibe?: string | null;
  bus_routes?: Array<Record<string, unknown>> | null;
  transparency?: Record<string, string> | null;
  deposit?: number | null;
  utilities_included?: boolean;
  utilities_list?: string[] | null;
  utilities_tenant_paid?: Array<{ name: string; avg_cost?: number }> | null;
  pet_policy?: string | Record<string, unknown> | null;
  smoking_allowed?: boolean | null;
  quiet_hours?: string | null;
  max_occupants?: number | null;
  guest_policy?: string | null;
  lease_term?: string | null;
  walk_score?: number | null;
  transit_score?: number | null;
  bike_score?: number | null;
  parking?: boolean;
  ideal_tenant_profile?: string[] | null;
  inquiry_count?: number | null;
  virtual_tour_url?: string | null;
}

interface ListingPageProps {
  property: PropertyRecord;
  faqs?: FaqItem[];
}

export default function ListingPage({ property, faqs }: ListingPageProps) {
  const isRented = property.available === false;

  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      <LifeSimHero property={property} />

      {/* Rented banner — keeps SEO traffic, captures rental alert leads */}
      {isRented && <RentedBanner property={property} />}

      {/* Photos immediately after hero — highest conversion priority */}
      {(property.images?.length || property.photo_labels?.length) ? (
        <PhotoGallery property={property} />
      ) : null}

      <QuickSummary property={property} />

      <ShareBar property={property} />

      <SocialProof property={property} />

      {property.ai_highlights?.length ? (
        <PropertyHighlights property={property} />
      ) : null}

      <IdealTenant property={property} />

      <DetailedFeatures property={property} />

      {property.life_simulation && Object.keys(property.life_simulation).length > 0 ? (
        <DailyRoutine property={property} />
      ) : null}

      <MicroLocation property={property} />

      {/* Mid-page CTA — after location, before neighbourhood copy */}
      <div className="py-10 px-5 sm:px-8 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <p className="text-sm mb-1 font-medium" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
          Like what you see?
        </p>
        <p className="text-xl font-bold mb-5" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
          Spots like this don&apos;t sit. Book before someone else does.
        </p>
        <BookViewingButton property={property} variant="primary" label="Book a Viewing" />
      </div>

      {property.neighbourhood_vibe ? (
        <NeighbourhoodVibe property={property} />
      ) : null}

      <CostsBreakdown property={property} />

      {property.transparency && Object.keys(property.transparency).length > 0 ? (
        <TransparencySection property={property} />
      ) : null}

      <PoliciesSection property={property} />

      <CommuteSimulator property={property} />

      <ApplicationProcess />

      {faqs && faqs.length > 0 && <FaqSection faqs={faqs} />}

      <ProspaBenefits />

      {/* Bottom CTA — static, above sticky bar */}
      <div className="py-14 px-5 sm:px-8 text-center" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #D8D2C8" }}>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
        >
          Ready to Move Forward?
        </p>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          {property.address}, {property.city}
        </h2>
        <p className="text-sm mb-7" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          ${property.price.toLocaleString()}/mo · Applications reviewed within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <BookViewingButton property={property} variant="primary" label="Book a Viewing" />
          <a
            href="tel:5196971227"
            className="px-7 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-70"
            style={{ border: "1px solid #D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            (519) 697-1227
          </a>
        </div>
      </div>

      <StickyCTA property={property} />
    </div>
  );
}
