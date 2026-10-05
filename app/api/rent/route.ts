import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { rentalProfileConfirmationEmail, rentalProfileNotificationEmail } from "@/lib/emails";
import { scoreRentalProfile } from "@/lib/rent/leadScore";
import type { RentalProfileDraft } from "@/lib/rent/types";

// Upserts by session_id on every call — called on every step advance, not
// just at the end. This is the actual point of the table: Ebin gets 30
// enquiries and signs 1 lease, and the other 29 are real signal he wants
// to keep, not lose the moment someone closes the tab. A row exists from
// the first answered question, filled in further as they go, and is only
// ever "complete" (mirrored into leads, triggers email) once they've
// actually reached contact info and consented — everything before that
// is captured silently, no email spam to Ebin per keystroke.
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
    const body = (await req.json()) as RentalProfileDraft & {
      sessionId?: string;
      lastStep?: string;
      completed?: boolean;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
    };

    if (!body.sessionId) {
      return NextResponse.json({ error: "Missing session id." }, { status: 400 });
    }

    const completed = body.completed === true;

    if (completed) {
      if (!body.email || !body.email.includes("@")) {
        return NextResponse.json({ error: "A valid email is required to finish." }, { status: 400 });
      }
      if (!body.marketing_consent) {
        return NextResponse.json({ error: "Please confirm consent to continue." }, { status: 400 });
      }
    }

    const leadScore = scoreRentalProfile(body);

    const { data: upserted, error } = await supabase
      .from("rental_profiles")
      .upsert(
        [
          {
            session_id: body.sessionId,
            last_step: body.lastStep || null,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),

            source: "/rent",
            utm_source: body.utm_source || null,
            utm_medium: body.utm_medium || null,
            utm_campaign: body.utm_campaign || null,

            first_name: body.first_name || null,
            last_name: body.last_name || null,
            email: body.email || null,
            phone: body.phone || null,

            move_timing: body.move_timing || null,
            household_type: body.household_type || null,
            household_type_other: body.household_type_other || null,
            household_size: body.household_size ?? null,
            children_present: body.children_present ?? null,
            children_count: body.children_count || null,

            preferred_areas: body.preferred_areas || [],
            other_location: body.other_location || null,

            property_types: body.property_types || [],
            bedrooms: body.bedrooms || null,
            bathrooms: body.bathrooms || null,

            budget_range: body.budget_range || null,
            max_budget: body.max_budget ?? null,

            parking: body.parking || [],
            pets: body.pets || [],
            pets_note: body.pets_note || null,

            must_haves: body.must_haves || [],
            top_priorities: body.top_priorities || [],
            deal_breakers: body.deal_breakers || [],

            proximity_preferences: body.proximity_preferences || [],
            proximity_detail: body.proximity_detail || null,
            current_situation: body.current_situation || null,
            search_intensity: body.search_intensity || null,

            notes: body.notes || null,
            marketing_consent: body.marketing_consent ?? false,

            lead_score: leadScore,
          },
        ],
        { onConflict: "session_id" }
      )
      .select("id")
      .single();

    if (error || !upserted) {
      console.error("[rent] Supabase upsert failed:", error);
      return NextResponse.json({ error: "Failed to save your profile. Please try again." }, { status: 500 });
    }

    // Only on an actual completion: mirror into the existing leads table
    // (so it's visible in /admin/leads immediately) and send emails.
    // Partial/abandoned saves stay silent — no notification spam per step.
    if (completed) {
      try {
        await supabase.from("leads").insert([
          {
            name: `${body.first_name ?? ""} ${body.last_name ?? ""}`.trim() || body.email,
            email: body.email!,
            phone: body.phone || null,
            city: "London",
            message: summarize(body),
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
            to: body.email!,
            subject: "You're on the list — Prospera Properties",
            html: rentalProfileConfirmationEmail(body.first_name || ""),
          });

          await resend.emails.send({
            from: "Prospera Properties <hello@prosperaproperties.co>",
            to: "prosperapropertiess@gmail.com",
            subject: `New rental profile — ${body.first_name || body.email} (${leadScore})`,
            html: rentalProfileNotificationEmail({ profileId: upserted.id, leadScore, profile: { ...body } }),
          });
        } catch (emailErr) {
          console.error("[rent] Resend error:", emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, id: upserted.id }, { status: 200 });
  } catch (err) {
    console.error("[rent] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
