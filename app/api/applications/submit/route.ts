import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { applicationReceivedAgentEmail } from "@/lib/emails";

interface DocEntry {
  doc_type: string;
  storage_path: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agent_id, property_id,
      tenant_name, tenant_email, tenant_phone, tenant_dob, current_address,
      employer_name, employer_position, monthly_income, employment_start, employment_type,
      landlord_ref_name, landlord_ref_phone, landlord_ref_email,
      employer_ref_name, employer_ref_phone, employer_ref_email,
      documents,
    } = body;

    // Basic validation
    if (!agent_id || !property_id) {
      return NextResponse.json({ error: "Invalid application link" }, { status: 400 });
    }
    if (!tenant_name || !tenant_email || !tenant_phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 });
    }

    // Validate agent exists and is active
    const { data: agent } = await supabaseAdmin
      .from("agents")
      .select("id, name, email, is_active")
      .eq("id", agent_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!agent) return NextResponse.json({ error: "Invalid application link" }, { status: 400 });

    // Validate property exists and is available
    const { data: property } = await supabaseAdmin
      .from("properties")
      .select("id, address, city, price")
      .eq("id", property_id)
      .eq("is_managed", true)
      .eq("available", true)
      .maybeSingle();

    if (!property) return NextResponse.json({ error: "This property is no longer available" }, { status: 400 });

    // Insert application
    const { data: application, error: appErr } = await supabaseAdmin
      .from("applications")
      .insert([{
        agent_id,
        property_id,
        tenant_name: tenant_name.trim(),
        tenant_email: tenant_email.toLowerCase().trim(),
        tenant_phone: tenant_phone.trim(),
        tenant_dob: tenant_dob || null,
        current_address: current_address || null,
        employer_name: employer_name || null,
        employer_position: employer_position || null,
        monthly_income: monthly_income ? Number(monthly_income) : null,
        employment_start: employment_start || null,
        employment_type: employment_type || null,
        landlord_ref_name: landlord_ref_name || null,
        landlord_ref_phone: landlord_ref_phone || null,
        landlord_ref_email: landlord_ref_email || null,
        employer_ref_name: employer_ref_name || null,
        employer_ref_phone: employer_ref_phone || null,
        employer_ref_email: employer_ref_email || null,
        monthly_rent: Number(property.price),
        status: "pending",
      }])
      .select("id")
      .single();

    if (appErr || !application) {
      console.error("Application insert error:", appErr);
      return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
    }

    // Move documents from temp/ to applications/{id}/ and insert document rows
    const docEntries: DocEntry[] = Array.isArray(documents) ? documents : [];
    for (const doc of docEntries) {
      if (!doc.storage_path || !doc.doc_type) continue;

      const newPath = doc.storage_path.replace(
        /^temp\//,
        `applications/${application.id}/`
      );

      const { error: moveErr } = await supabaseAdmin.storage
        .from("applications")
        .move(doc.storage_path, newPath);

      const finalPath = moveErr ? doc.storage_path : newPath;

      await supabaseAdmin.from("application_documents").insert([{
        application_id: application.id,
        doc_type: doc.doc_type,
        storage_path: finalPath,
      }]);
    }

    // Update status to processing and record webhook sent time
    await supabaseAdmin
      .from("applications")
      .update({ status: "processing", ocr_webhook_sent_at: new Date().toISOString() })
      .eq("id", application.id);

    // Fire OpenClaw webhook (if configured)
    const openclawEndpoint = process.env.OPENCLAW_ENDPOINT;
    const openclawSecret = process.env.OPENCLAW_SECRET;

    if (openclawEndpoint && openclawSecret) {
      // Generate 24-hour signed URLs for each document
      const signedDocs = await Promise.all(
        docEntries.map(async (doc) => {
          const path = doc.storage_path.startsWith("temp/")
            ? doc.storage_path.replace(/^temp\//, `applications/${application.id}/`)
            : doc.storage_path;

          const { data } = await supabaseAdmin.storage
            .from("applications")
            .createSignedUrl(path, 24 * 60 * 60); // 24 hours

          return { type: doc.doc_type, url: data?.signedUrl ?? "" };
        })
      );

      fetch(openclawEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": openclawSecret,
        },
        body: JSON.stringify({
          application_id: application.id,
          webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co"}/api/applications/ocr-complete`,
          webhook_secret: process.env.OPENCLAW_WEBHOOK_SECRET,
          documents: signedDocs.filter((d) => d.url),
          monthly_rent: Number(property.price),
        }),
      }).catch((err) => console.error("[applications/submit] OpenClaw webhook failed:", err));
    } else {
      console.warn("[applications/submit] OPENCLAW_ENDPOINT not set — skipping OCR");
    }

    // Notify agent via email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: agent.email,
        subject: `New application — ${tenant_name} for ${property.address}`,
        html: applicationReceivedAgentEmail({
          agentName: agent.name,
          tenantName: tenant_name,
          tenantEmail: tenant_email,
          tenantPhone: tenant_phone,
          propertyAddress: `${property.address}, ${property.city}`,
          applicationId: application.id,
        }),
      }).catch((err: unknown) => console.error("[applications/submit] Agent email failed:", err));
    }

    return NextResponse.json({ success: true, application_id: application.id });
  } catch (err) {
    console.error("submit application error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
