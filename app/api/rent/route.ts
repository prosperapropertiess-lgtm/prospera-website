import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { rentalProfileConfirmationEmail, rentalProfileNotificationEmail } from "@/lib/emails";
import { scoreRentalProfile } from "@/lib/rent/leadScore";
import type { RentalProfileDraft } from "@/lib/rent/types";

// Writes the full structured profile to its own table (rental_profiles —
// generic CRM contact properties can't hold arrays like must_haves/areas
// without real schema work), and ALSO drops a lightweight, human-readable
// summary into the existing `leads` table so it shows up in /admin/leads
// immediately with zero extra admin UI work. No HubSpot — deliberately
// dropped for this flow; rental_profiles is the system of record here.
function summarize(d: RentalProfileDraft): string {
  const parts = [
    d.move_timing && `Moving: ${d.move_timing}`,
    d.household_type && `Household: ${d.household_type}`,
    d.bedrooms && `${d.bedrooms} bed`,
    d.budget_range && `Budget: ${d.budget_range}`,
    d.preferred_areas?.length ? `Areas: ${d.preferred_areas.join(", ")}` : null,
    d.search_intensity && `Intensity: ${d.search_intensity.replace(/_/g, " ")}`,
  ].filter(Boolean);
  return parts.join(" · ") || "Rental profile submitted via /rent";
}

export async function POST(req: NextRequest) {
  try {
    const draft = (await req.json()) as RentalProfileDraft & {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
    };

    if (!draft.email || !draft.email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!draft.marketing_consent) {
      return NextResponse.json({ error: "Please confirm consent to continue." }, { status: 400 });
    }

    const leadScore = scoreRentalProfile(draft);

    const { data: inserted, error } = await supabase
      .from("rental_profiles")
      .insert([
        {
          source: "/rent",
          utm_source: draft.utm_source || null,
          utm_medium: draft.utm_medium || null,
          utm_campaign: draft.utm_campaign || null,

          first_name: draft.first_name || null,
          last_name: draft.last_name || null,
          email: draft.email,
          phone: draft.phone || null,

          move_timing: draft.move_timing || null,
          household_type: draft.household_type || null,
          household_type_other: draft.household_type_other || null,
          household_size: draft.household_size ?? null,
          children_present: draft.children_present ?? null,
          children_count: draft.children_count || null,

          preferred_areas: draft.preferred_areas || [],
          other_location: draft.other_location || null,

          property_types: draft.property_types || [],
          bedrooms: draft.bedrooms || null,
          bathrooms: draft.bathrooms || null,

          budget_range: draft.budget_range || null,
          max_budget: draft.max_budget ?? null,

          parking: draft.parking || [],
          pets: draft.pets || [],
          pets_note: draft.pets_note || null,

          must_haves: draft.must_haves || [],
          top_priorities: draft.top_priorities || [],
          deal_breakers: draft.deal_breakers || [],

          proximity_preferences: draft.proximity_preferences || [],
          proximity_detail: draft.proximity_detail || null,
          current_situation: draft.current_situation || null,
          search_intensity: draft.search_intensity || null,

          notes: draft.notes || null,
          marketing_consent: draft.marketing_consent,

          lead_score: leadScore,
        },
      ])
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[rent] Supabase insert failed:", error);
      return NextResponse.json({ error: "Failed to save your profile. Please try again." }, { status: 500 });
    }

    // Mirror into the existing leads table so it's visible in /admin/leads
    // without any new admin UI — best-effort, never blocks the response.
    try {
      await supabase.from("leads").insert([
        {
          name: `${draft.first_name ?? ""} ${draft.last_name ?? ""}`.trim() || draft.email,
          email: draft.email,
          phone: draft.phone || null,
          city: "London",
          message: summarize(draft),
          type: "tenant",
          source: "/rent",
        },
      ]);
    } catch (leadsErr) {
      console.error("[rent] leads mirror failed:", leadsErr);
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          replyTo: "prosperapropertiess@gmail.com",
          to: draft.email,
          subject: "You're on the list — Prospera Properties",
          html: rentalProfileConfirmationEmail(draft.first_name || ""),
        });

        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `New rental profile — ${draft.first_name || draft.email} (${leadScore})`,
          html: rentalProfileNotificationEmail({ profileId: inserted.id, leadScore, profile: { ...draft } }),
        });
      } catch (emailErr) {
        console.error("[rent] Resend error:", emailErr);
      }
    }

    return NextResponse.json({ success: true, id: inserted.id }, { status: 200 });
  } catch (err) {
    console.error("[rent] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
