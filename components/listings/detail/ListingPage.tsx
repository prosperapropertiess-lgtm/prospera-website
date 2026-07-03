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
import SocialProof from "./SocialProof";
import ProspaBenefits from "./ProspaBenefits";
import StickyCTA from "./StickyCTA";

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
}

export default function ListingPage({ property }: ListingPageProps) {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      <LifeSimHero property={property} />

      <QuickSummary property={property} />

      <ShareBar property={property} />

      <SocialProof property={property} />

      {(property.images?.length || property.photo_labels?.length) ? (
        <PhotoGallery property={property} />
      ) : null}

      {property.ai_highlights?.length ? (
        <PropertyHighlights property={property} />
      ) : null}

      <IdealTenant property={property} />

      <DetailedFeatures property={property} />

      {property.life_simulation && Object.keys(property.life_simulation).length > 0 ? (
        <DailyRoutine property={property} />
      ) : null}

      {(property.neighbourhood_data || property.bus_routes?.length) ? (
        <MicroLocation property={property} />
      ) : null}

      {property.neighbourhood_vibe ? (
        <NeighbourhoodVibe property={property} />
      ) : null}

      <CostsBreakdown property={property} />

      {property.transparency && Object.keys(property.transparency).length > 0 ? (
        <TransparencySection property={property} />
      ) : null}

      <PoliciesSection property={property} />

      <CommuteSimulator property={property} />

      <ProspaBenefits />

      <StickyCTA property={property} />
    </div>
  );
}
