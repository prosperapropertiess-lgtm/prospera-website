"use client";

import PhotoGallery from "./PhotoGallery";
import QuickSummary from "./QuickSummary";
import PropertyHighlights from "./PropertyHighlights";
import DetailedFeatures from "./DetailedFeatures";
import CostsBreakdown from "./CostsBreakdown";
import SocialProof from "./SocialProof";
import PoliciesSection from "./PoliciesSection";
import ApplicationProcess from "./ApplicationProcess";
import ProspaBenefits from "./ProspaBenefits";
import StickyCTA from "./StickyCTA";
import BookViewingButton from "./BookViewingButton";
import ViewTracker from "./ViewTracker";
import FaqSection from "./FaqSection";
import RentedBanner from "./RentedBanner";
import LifeSimHero from "./LifeSimHero";
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
  inquiry_count?: number | null;
  virtual_tour_url?: string | null;
}

interface ListingPageProps {
  property: PropertyRecord;
  faqs?: FaqItem[];
}

export default function ListingPage({ property, faqs }: ListingPageProps) {
  const isRented = property.available === false;
  const hasPhotos = !!(property.images?.length || property.photo_labels?.length);

  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      <ViewTracker propertyId={property.id} />

      {/* 1. Hero */}
      <LifeSimHero property={property} />

      {/* 2. Rented banner — captures rental alert leads on rented properties */}
      {isRented && <RentedBanner property={property} />}

      {/* 3. Photos */}
      {hasPhotos && <PhotoGallery property={property} />}

      {/* 4. Price, CTA, quick stats */}
      <QuickSummary property={property} />

      {/* 5. Inquiry count + virtual tour if available */}
      <SocialProof property={property} />

      {/* 6. AI highlights — only when data exists */}
      {property.ai_highlights?.length ? (
        <PropertyHighlights property={property} />
      ) : null}

      {/* 7. What's included checklist */}
      <DetailedFeatures property={property} />

      {/* 8. Cost breakdown — rent, deposit, utilities */}
      <CostsBreakdown property={property} />

      {/* 9. Pet, smoking, guest policies */}
      <PoliciesSection property={property} />

      {/* 10. Application process — only for available properties */}
      {!isRented && <ApplicationProcess />}

      {/* 11. FAQ — SEO value + renter confidence */}
      {faqs && faqs.length > 0 && <FaqSection faqs={faqs} />}

      {/* 12. Why Prospera */}
      <ProspaBenefits />

      {/* 13. Bottom CTA */}
      <div className="py-14 px-5 sm:px-8 text-center" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #D8D2C8" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          {isRented ? "Similar Properties Available" : "Ready to Move Forward?"}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
          {property.address}, {property.city}
        </h2>
        <p className="text-sm mb-7" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          {isRented
            ? "This property has been rented. New listings are added regularly."
            : `$${property.price.toLocaleString()}/mo · Applications reviewed within 24 hours.`}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isRented ? (
            <a
              href="/listings"
              className="px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              See Available Properties
            </a>
          ) : (
            <>
              <BookViewingButton property={property} variant="primary" label="Book a Viewing" />
              <a
                href="tel:5196971227"
                className="px-7 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-70"
                style={{ border: "1px solid #D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                (519) 697-1227
              </a>
            </>
          )}
        </div>
      </div>

      {/* Sticky bar */}
      <StickyCTA property={property} />
    </div>
  );
}
