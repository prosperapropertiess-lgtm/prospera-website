import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRentToken, generatePropertyAnalysis, RentSubmission } from "@/lib/rent-intelligence";
import { rentAnalysisReportEmail, rentSubmissionNotificationEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, monthlyOptin, ...formData } = body;

    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const tokenRow = await validateRentToken(token);
    if (!tokenRow) return NextResponse.json({ error: "Invalid or expired link" }, { status: 410 });

    const submission: RentSubmission = {
      city: formData.city || tokenRow.city || "Unknown",
      city_zone: formData.city_zone || null,
      address: formData.address || null,
      property_type: formData.property_type || null,
      bedrooms: formData.bedrooms != null ? Number(formData.bedrooms) : tokenRow.bedrooms,
      bathrooms: formData.bathrooms != null ? Number(formData.bathrooms) : null,
      half_bathrooms: formData.half_bathrooms != null ? Number(formData.half_bathrooms) : 0,
      sqft: formData.sqft ? Number(formData.sqft) : null,
      floor: formData.floor ? Number(formData.floor) : null,
      building_era: formData.building_era || null,
      units_in_building: formData.units_in_building ? Number(formData.units_in_building) : null,
      separate_entrance: formData.separate_entrance ?? null,
      garage: formData.garage || "none",
      parking_spots: formData.parking_spots != null ? Number(formData.parking_spots) : 0,
      visitor_parking: formData.visitor_parking ?? null,
      backyard: formData.backyard ?? null,
      balcony: formData.balcony ?? null,
      lawn_care: formData.lawn_care || null,
      furnished: formData.furnished || "unfurnished",
      heat_type: formData.heat_type || null,
      ac_type: formData.ac_type || null,
      appliance_fridge: formData.appliance_fridge ?? false,
      appliance_stove: formData.appliance_stove ?? false,
      appliance_dishwasher: formData.appliance_dishwasher ?? false,
      appliance_washer: formData.appliance_washer ?? false,
      appliance_dryer: formData.appliance_dryer ?? false,
      laundry: formData.laundry || null,
      utilities_included: formData.utilities_included || "none",
      pet_friendly: formData.pet_friendly ?? null,
      amenities: formData.amenities || null,
      condo_fees_included: formData.condo_fees_included ?? null,
      newly_renovated: formData.newly_renovated ?? null,
      upkeep_rating: formData.upkeep_rating ? Number(formData.upkeep_rating) : null,
      transit_distance_min: formData.transit_distance_min ? Number(formData.transit_distance_min) : null,
      rent_amount: Number(formData.rent_amount),
      is_asking_rent: formData.is_asking_rent ?? true,
      previous_rent: formData.previous_rent ? Number(formData.previous_rent) : null,
      is_occupied: formData.is_occupied ?? null,
      last_rent_increase: formData.last_rent_increase || null,
      neighbouring_rent: formData.neighbouring_rent ? Number(formData.neighbouring_rent) : null,
      lease_preference: formData.lease_preference || null,
      available_date: formData.available_date || null,
      landlord_style: formData.landlord_style || null,
      special_features: formData.special_features || null,
      remarks: formData.remarks || null,
    };

    if (!submission.rent_amount || isNaN(submission.rent_amount)) {
      return NextResponse.json({ error: "Valid rent amount required" }, { status: 400 });
    }

    // Insert submission
    const { data: submissionRow, error: subErr } = await supabaseAdmin
      .from("rent_submissions")
      .insert([{
        token,
        submission_type: "initial_analysis",
        ...submission,
      }])
      .select("id")
      .single();

    if (subErr || !submissionRow) {
      console.error("Submission insert error:", subErr);
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    // Stamp token used
    await supabaseAdmin
      .from("rent_analysis_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    // Monthly optin
    if (monthlyOptin) {
      await supabaseAdmin
        .from("subscribers")
        .update({ rent_monthly_optin: true, rent_last_token: token })
        .eq("email", tokenRow.email);
    }

    // Return immediately — analysis + email happens in background via waitUntil
    // waitUntil tells Vercel to keep the function alive until the promise resolves,
    // even after the response has been sent to the client.
    const submissionId = submissionRow.id;
    const emailAddress = tokenRow.email;
    const name = tokenRow.name;

    waitUntil(
      (async () => {
        try {
          const { data: marketData } = await supabaseAdmin
            .from("rent_market_data")
            .select("*")
            .eq("city", submission.city)
            .eq("bedrooms", submission.bedrooms ?? 0)
            .eq("is_published", true)
            .maybeSingle();

          let claudeAnalysis = "";
          try {
            claudeAnalysis = await generatePropertyAnalysis(submission, marketData ?? null);
          } catch (err) {
            console.error("[rent-analysis] Claude analysis failed:", err);
            claudeAnalysis = "We were unable to generate an automated analysis at this time. Ebin will personally review your submission and follow up within 24 hours.";
          }

          await supabaseAdmin
            .from("rent_submissions")
            .update({ claude_analysis: claudeAnalysis, analysis_generated_at: new Date().toISOString() })
            .eq("id", submissionId);

          const resendKey = process.env.RESEND_API_KEY;
          if (!resendKey) {
            console.error("[rent-analysis] RESEND_API_KEY not set — email not sent for submission", submissionId);
            return;
          }

          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          const { error: emailErr } = await resend.emails.send({
            from: "Laura at Prospera <hello@prosperaproperties.co>",
            replyTo: "prosperapropertiess@gmail.com",
            to: emailAddress,
            subject: `Your rent analysis — ${submission.city} property`,
            html: rentAnalysisReportEmail({
              name,
              city: submission.city,
              bedrooms: submission.bedrooms,
              unitType: submission.property_type,
              rentAmount: submission.rent_amount,
              claudeAnalysis,
            }),
          });

          if (emailErr) {
            console.error("[rent-analysis] Resend failed for submission", submissionId, emailErr);
            await supabaseAdmin
              .from("rent_submissions")
              .update({ email_error: JSON.stringify(emailErr) })
              .eq("id", submissionId);
          } else {
            await supabaseAdmin
              .from("rent_submissions")
              .update({ email_sent_at: new Date().toISOString() })
              .eq("id", submissionId);
          }

          // Notify Ebin — full property details + analysis
          await resend.emails.send({
            from: "Laura at Prospera <hello@prosperaproperties.co>",
            to: "prosperapropertiess@gmail.com",
            subject: `New rent analysis — ${name || "landlord"} · ${submission.city}`,
            html: rentSubmissionNotificationEmail({
              submissionId,
              landlordName: name,
              landlordEmail: emailAddress,
              landlordPhone: tokenRow.phone,
              submission: submission as unknown as Record<string, unknown>,
              claudeAnalysis,
            }),
          });
        } catch (err) {
          console.error("[rent-analysis] Background processing failed for submission", submissionId, err);
        }
      })()
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("submit-analysis error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
