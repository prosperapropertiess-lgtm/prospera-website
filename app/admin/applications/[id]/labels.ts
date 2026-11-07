// Shared by the application detail page and its printable PDF view.

export const VERDICT_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  strong:          { label: "Strong",            bg: "#D1FAE5", text: "#065F46" },
  worth_a_call:    { label: "Worth a call",      bg: "#E0F2FE", text: "#075985" },
  needs_more_info: { label: "Needs more info",   bg: "#FEF3C7", text: "#92400E" },
  not_a_fit:       { label: "Probably not a fit", bg: "#FEE2E2", text: "#991B1B" },
};

export const CHECK_ICON: Record<string, { icon: string; color: string }> = {
  verified:     { icon: "✓", color: "#065F46" },
  claimed_only: { icon: "•", color: "#64748B" },
  concern:      { icon: "!", color: "#B45309" },
  missing:      { icon: "○", color: "#991B1B" },
};

export const INCOME_SOURCE_LABEL: Record<string, string> = {
  employed: "Has a job", self_employed: "Self-employed", student: "Student", retired: "Retired", other: "Other",
};

export const TIME_AT_ADDRESS_LABEL: Record<string, string> = {
  under_1: "Under 1 year", "1_2": "1–2 years", "2_5": "2–5 years", "5_plus": "5+ years",
};
