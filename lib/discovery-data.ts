export interface DiscoveryCall {
  id: string;
  landlord_name: string | null;
  landlord_email: string | null;
  landlord_phone: string | null;
  num_properties_owned: number | null;
  property_address: string | null;
  property_city: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  occupancy_status: string | null;
  approx_monthly_rent: number | null;
  property_condition: string | null;
  condition_notes: string | null;
  reason_for_call: string | null;
  service_type: string | null;
  involvement_level: string | null;
  timeline: string | null;
  ai_verdict: "good_fit" | "not_a_fit" | "borderline" | null;
  ai_reasoning: string | null;
  ai_concerns: string[] | null;
  outcome: "in_progress" | "pending_decision" | "rejected" | "converted";
  onboarding_token: string | null;
  rejection_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const OUTCOME_LABELS: Record<DiscoveryCall["outcome"], string> = {
  in_progress: "In Progress",
  pending_decision: "Awaiting Decision",
  rejected: "Rejected",
  converted: "Converted to Onboarding",
};
