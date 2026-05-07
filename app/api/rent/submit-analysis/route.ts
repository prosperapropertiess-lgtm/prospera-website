import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRentToken, generatePropertyAnalysis, RentSubmission } from "@/lib/rent-intelligence";
import { rentAnalysisReportEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, monthlyOptin, ...formData } = body;

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Validate token
    const tokenRow = await validateRentToken(token);
    if (!tokenRow) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 410 });
    }

    // Build submission object
    const submission: RentSubmission = {
      city: formData.city || tokenRow.city || "Unknown",
      address: formData.address || null,
      unit_type: formData.unit_type || null,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : tokenRow.bedrooms,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      sqft: formData.sqft ? Number(formData.sqft) : null,
      floor: formData.floor ? Number(formData.floor) : null,
      parking: formData.parking ?? null,
      laundry: formData.laundry || null,
      utilities_included: formData.utilities_included ?? null,
      pet_friendly: formData.pet_friendly ?? null,
      rent_amount: Number(formData.rent_amount),
      is_asking_rent: formData.is_asking_rent ?? true,
      is_occupied: formData.is_occupied ?? null,
      last_rent_increase: formData.last_rent_increase || null,
    };

    if (!submission.rent_amount || isNaN(submission.rent_amount)) {
      return NextResponse.json({ error: "Valid rent amount required" }, { status: 400 });
    }

    // Insert submission row
    const { data: submissionRow, error: subErr } = await supabaseAdmin
      .from("rent_submissions")
      .insert([{
        token,
        submission_type: "initial_analysis",
        city: submission.city,
        address: submission.address,
        unit_type: submission.unit_type,
        bedrooms: submission.bedrooms,
        bathrooms: submission.bathrooms,
        sqft: submission.sqft,
        floor: submission.floor,
        parking: submission.parking,
        laundry: submission.laundry,
        utilities_included: submission.utilities_included,
        pet_friendly: submission.pet_friendly,
        rent_amount: submission.rent_amount,
        is_asking_rent: submission.is_asking_rent,
        is_occupied: submission.is_occupied,
        last_rent_increase: submission.last_rent_increase,
      }])
      .select("id")
      .single();

    if (subErr || !submissionRow) {
      console.error("Submission insert error:", subErr);
      return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
    }

    // Stamp token as used
    await supabaseAdmin
      .from("rent_analysis_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    // Handle monthly optin
    if (monthlyOptin) {
      await supabaseAdmin
        .from("subscribers")
        .update({ rent_monthly_optin: true, rent_last_token: token })
        .eq("email", tokenRow.email);
    }

    // Fetch market data for this city+bedrooms (may be null early on)
    const { data: marketData } = await supabaseAdmin
      .from("rent_market_data")
      .select("*")
      .eq("city", submission.city)
      .eq("bedrooms", submission.bedrooms ?? 0)
      .eq("is_published", true)
      .maybeSingle();

    // Generate Claude analysis (non-blocking for response, but we await it for the email)
    let claudeAnalysis = "";
    try {
      claudeAnalysis = await generatePropertyAnalysis(submission, marketData ?? null);
    } catch (err) {
      console.error("Claude analysis error:", err);
      claudeAnalysis = "We were unable to generate an analysis at this time. Ebin will personally review your submission and follow up within 24 hours.";
    }

    // Update submission with analysis
    await supabaseAdmin
      .from("rent_submissions")
      .update({
        claude_analysis: claudeAnalysis,
        analysis_generated_at: new Date().toISOString(),
      })
      .eq("id", submissionRow.id);

    // Send report email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Ebin at Prospera <hello@prosperaproperties.co>",
        replyTo: "prosperapropertiess@gmail.com",
        to: tokenRow.email,
        subject: `Your rent analysis — ${submission.city} property`,
        html: rentAnalysisReportEmail({
          name: tokenRow.name,
          city: submission.city,
          bedrooms: submission.bedrooms,
          unitType: submission.unit_type,
          rentAmount: submission.rent_amount,
          claudeAnalysis,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("submit-analysis error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
