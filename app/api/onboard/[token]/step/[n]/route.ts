import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createOwnerInNotion, createPropertyInNotion, createTenantInNotion, createRentTrackerSeries } from "@/lib/notion";
import {
  onboardEmail1Welcome,
  onboardEmail3AgreementSigned,
  onboardEmail4KeysReceived,
  onboardEmail5InspectionDone,
  onboardEmail6TenantsNotified,
  onboardEmail7FinancialSetup,
  onboardEmail8Welcome,
  onboardTenantIntroEmail,
} from "@/lib/emails";
import { updateNotionPage } from "@/lib/notion";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.prosperaproperties.co";

async function sendEmail(to: string, subject: string, html: string, cc?: string[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[onboard] RESEND_API_KEY not set — email skipped:", subject);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const result = await resend.emails.send({
    from: "Ebin | Prospera Properties <hello@prosperaproperties.co>",
    to,
    ...(cc ? { cc } : {}),
    subject,
    html,
  });
  console.log("[onboard] email sent:", subject, "→", to, result.data?.id ?? result.error);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; n: string }> }
) {
  const { token, n } = await params;
  const step = parseInt(n, 10);

  // Steps 2, 3, 6, 7, 9, 10 are Ebin's — require admin auth
  const ebinSteps = [2, 3, 6, 7, 9, 10];
  if (ebinSteps.includes(step)) {
    if (!(await isAdminAuthenticated(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const sb = getSupabaseAdmin();
  const { data: session, error: fetchErr } = await sb
    .from("onboarding_sessions")
    .select("*")
    .eq("token", token)
    .single();

  if (fetchErr || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  // ── Step 2: Owner Basic Info ─────────────────────────────────
  if (step === 2) {
    const { owner_name, owner_email, owner_phone } = body;
    if (!owner_name || !owner_email) {
      return NextResponse.json({ error: "owner_name and owner_email required" }, { status: 400 });
    }

    // Create Notion owner record
    let notionOwnerId: string | null = null;
    try {
      notionOwnerId = await createOwnerInNotion({ name: owner_name, email: owner_email, phone: owner_phone });
    } catch (e) {
      console.error("Notion owner create failed:", e);
    }

    await sb.from("onboarding_sessions").update({
      owner_name,
      owner_email,
      owner_phone: owner_phone || null,
      notion_owner_id: notionOwnerId,
      current_step: 3,
      step2_completed_at: new Date().toISOString(),
    }).eq("token", token);

    return NextResponse.json({ ok: true, next_step: 3, notion_owner_id: notionOwnerId });
  }

  // ── Step 3: Property Details ─────────────────────────────────
  if (step === 3) {
    const {
      property_address,
      property_city,
      property_type,
      num_units,
      approx_monthly_rent,
      fee_structure,
      fee_amount,
      property_notes,
    } = body;

    if (!property_address) {
      return NextResponse.json({ error: "property_address required" }, { status: 400 });
    }

    // Create Notion property record
    let notionPropertyId: string | null = null;
    try {
      notionPropertyId = await createPropertyInNotion({
        address: property_address,
        city: property_city,
        type: property_type,
        units: num_units,
        monthlyRent: approx_monthly_rent,
        ownerId: session.notion_owner_id || "",
        notes: property_notes,
      });
    } catch (e) {
      console.error("Notion property create failed:", e);
    }

    await sb.from("onboarding_sessions").update({
      property_address,
      property_city: property_city || null,
      property_type: property_type || null,
      num_units: num_units || null,
      approx_monthly_rent: approx_monthly_rent || null,
      fee_structure: fee_structure || null,
      fee_amount: fee_amount || null,
      property_notes: property_notes || null,
      notion_property_id: notionPropertyId,
      current_step: 4,
      step3_completed_at: new Date().toISOString(),
    }).eq("token", token);

    // Send Email 1 to owner (welcome + lease upload link)
    if (session.owner_email) {
      try {
        const html = onboardEmail1Welcome({
          ownerName: session.owner_name || "there",
          propertyAddress: property_address,
          dashboardUrl: `${BASE_URL}/onboard/${token}`,
        });
        await sendEmail(
          session.owner_email,
          "Your Prospera setup is live — here's your first step",
          html,
          ["prosperapropertiess@gmail.com"]
        );
      } catch (e) {
        console.error("Email 1 failed:", e);
      }
    }

    return NextResponse.json({ ok: true, next_step: 4, notion_property_id: notionPropertyId });
  }

  // ── Step 4: Owner Details Form (owner-submitted) ─────────────
  if (step === 4) {
    // body is the full details JSON from the owner
    const parsedLease = session.lease_parsed_data ?? {};
    const tenants: Array<Record<string, unknown>> = Array.isArray(parsedLease.tenants) ? parsedLease.tenants : [];

    // Create Notion tenant records + rent tracker
    for (const tenant of tenants) {
      try {
        const tenantId = await createTenantInNotion({
          name: String(tenant.name || "Tenant"),
          email: tenant.email ? String(tenant.email) : undefined,
          phone: tenant.phone ? String(tenant.phone) : undefined,
          unit: tenant.unit ? String(tenant.unit) : undefined,
          monthlyRent: parsedLease.monthlyRent ? Number(parsedLease.monthlyRent) : undefined,
          leaseStart: parsedLease.leaseStart ? String(parsedLease.leaseStart) : undefined,
          leaseEnd: parsedLease.leaseEnd ? String(parsedLease.leaseEnd) : undefined,
          securityDeposit: parsedLease.securityDeposit ? Number(parsedLease.securityDeposit) : undefined,
          propertyId: session.notion_property_id || "",
        });

        if (session.notion_property_id && parsedLease.monthlyRent && parsedLease.leaseStart) {
          await createRentTrackerSeries({
            tenantId,
            propertyId: session.notion_property_id,
            amountDue: Number(parsedLease.monthlyRent),
            leaseStart: String(parsedLease.leaseStart),
            leaseEnd: parsedLease.leaseEnd ? String(parsedLease.leaseEnd) : undefined,
            tenantName: String(tenant.name || "Tenant"),
          });
        }
      } catch (e) {
        console.error("Notion tenant create failed:", e);
      }
    }

    await sb.from("onboarding_sessions").update({
      details: body,
      current_step: 5,
      step4_completed_at: new Date().toISOString(),
    }).eq("token", token);

    return NextResponse.json({ ok: true, next_step: 5 });
  }

  // ── Step 5: Management Agreement (owner-submitted) ────────────
  if (step === 5) {
    const { signed_name, ip } = body;

    const signedAt = new Date().toISOString();

    await sb.from("onboarding_sessions").update({
      agreement_signed_at: signedAt,
      agreement_ip: ip || null,
      agreement_name: signed_name || null,
      current_step: 6,
    }).eq("token", token);

    // Send Email 3 to owner (agreement confirmed + book meeting)
    if (session.owner_email) {
      try {
        const html = onboardEmail3AgreementSigned({
          ownerName: session.owner_name || "there",
          propertyAddress: session.property_address || "your property",
          signedAt,
        });
        await sendEmail(
          session.owner_email,
          "Agreement confirmed — let's meet at the property",
          html,
          ["prosperapropertiess@gmail.com"]
        );
      } catch (e) {
        console.error("Email 3 failed:", e);
      }
    }

    // Alert Ebin
    const ebinEmail = process.env.EBIN_EMAIL || "prosperapropertiess@gmail.com";
    try {
      await sendEmail(
        ebinEmail,
        `${session.owner_name || "Owner"} signed the management agreement`,
        `<p><strong>${session.owner_name}</strong> signed the management agreement for <strong>${session.property_address}</strong> at ${new Date(signedAt).toLocaleString("en-CA")}.</p>
         <p>Their details form has been submitted. Ready for keys handover.</p>
         <p><a href="${BASE_URL}/admin/onboard/${token}">View checklist →</a></p>`
      );
    } catch (e) {
      console.error("Ebin alert failed:", e);
    }

    return NextResponse.json({ ok: true, next_step: 6 });
  }

  // ── Step 6: Keys & Access ─────────────────────────────────────
  if (step === 6) {
    await sb.from("onboarding_sessions").update({
      step6_data: { ...body, _completed_at: new Date().toISOString() },
      current_step: 7,
    }).eq("token", token);

    // Email 4 — keys received
    if (session.owner_email) {
      try {
        const html = onboardEmail4KeysReceived({
          ownerName: session.owner_name || "there",
          propertyAddress: session.property_address || "your property",
          keyCount: body.num_keys ? Number(body.num_keys) : undefined,
        });
        await sendEmail(session.owner_email, "Keys received — your property is secure with us 🔑", html, ["prosperapropertiess@gmail.com"]);
      } catch (e) { console.error("Email 4 failed:", e); }
    }

    return NextResponse.json({ ok: true, next_step: 7 });
  }

  // ── Step 7: Inspection ────────────────────────────────────────
  if (step === 7) {
    const step8At = new Date().toISOString();

    await sb.from("onboarding_sessions").update({
      step7_data: body,
      current_step: 9,
      step8_completed_at: step8At,
    }).eq("token", token);

    // Email 5 — inspection done
    if (session.owner_email) {
      try {
        const issues = body.issues ? String(body.issues).split("\n").filter(Boolean) : [];
        const nextInspection = new Date();
        nextInspection.setDate(nextInspection.getDate() + 90);
        const html = onboardEmail5InspectionDone({
          ownerName: session.owner_name || "there",
          propertyAddress: session.property_address || "your property",
          condition: body.overall_condition ? String(body.overall_condition) : "Good",
          issueCount: issues.length,
          nextInspectionDate: nextInspection.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }),
        });
        await sendEmail(
          session.owner_email,
          issues.length > 0
            ? `Initial inspection done — ${issues.length} item${issues.length > 1 ? "s" : ""} noted 📋`
            : "Initial inspection done — all clear 📋",
          html,
          ["prosperapropertiess@gmail.com"]
        );
      } catch (e) { console.error("Email 5 failed:", e); }
    }

    // ── Step 8 auto-logic: send tenant intro letters ──────────────
    const parsedLease = session.lease_parsed_data ?? {};
    const tenants: Array<Record<string, unknown>> = Array.isArray(parsedLease.tenants)
      ? parsedLease.tenants
      : [];

    let tenantEmailsSent = 0;
    for (const tenant of tenants) {
      const tenantEmail = tenant.email ? String(tenant.email) : null;
      if (!tenantEmail) continue;
      try {
        const html = onboardTenantIntroEmail({
          tenantName: String(tenant.name || "Resident"),
          propertyAddress: session.property_address || "your property",
          startDate: new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }),
        });
        await sendEmail(
          tenantEmail,
          `Important: your property is now managed by Prospera Properties`,
          html,
          ["prosperapropertiess@gmail.com"]
        );
        tenantEmailsSent++;
      } catch (e) { console.error(`Tenant intro email failed for ${tenantEmail}:`, e); }
    }

    // Email 6 — tenants notified (to owner)
    if (session.owner_email) {
      try {
        const html = onboardEmail6TenantsNotified({
          ownerName: session.owner_name || "there",
          propertyAddress: session.property_address || "your property",
          tenantCount: tenantEmailsSent || tenants.length,
        });
        await sendEmail(session.owner_email, "Your tenants have been notified ✅", html, ["prosperapropertiess@gmail.com"]);
      } catch (e) { console.error("Email 6 failed:", e); }
    }

    return NextResponse.json({ ok: true, next_step: 9, tenants_notified: tenantEmailsSent });
  }

  // ── Step 9: Financial Setup ───────────────────────────────────
  if (step === 9) {
    await sb.from("onboarding_sessions").update({
      step9_data: body,
      current_step: 10,
    }).eq("token", token);

    // Email 7 — financial setup confirmed
    if (session.owner_email) {
      try {
        const feeDesc = session.fee_structure === "10% of gross"
          ? "10% of gross rent"
          : session.fee_amount
          ? `$${Number(session.fee_amount).toFixed(0)}/month flat`
          : "as agreed";

        const leaseStart = session.lease_parsed_data?.leaseStart;
        const rentDate = leaseStart
          ? new Date(leaseStart).toLocaleDateString("en-CA", { month: "long", day: "numeric" })
          : "the 1st of each month";

        const html = onboardEmail7FinancialSetup({
          ownerName: session.owner_name || "there",
          propertyAddress: session.property_address || "your property",
          rentCollectionDate: rentDate,
          feeDescription: feeDesc,
        });
        await sendEmail(session.owner_email, "Financial setup complete — here's what happens next 💰", html, ["prosperapropertiess@gmail.com"]);
      } catch (e) { console.error("Email 7 failed:", e); }
    }

    return NextResponse.json({ ok: true, next_step: 10 });
  }

  // ── Step 10: Welcome & Handover ───────────────────────────────
  if (step === 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const accessToken = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    // Create owner_access row for dashboard
    const ownerNames = session.owner_name || "Owner";
    const notionOwnerIds = session.notion_owner_id ? [session.notion_owner_id] : [];

    const { error: accessErr } = await sb.from("owner_access").insert({
      token: accessToken,
      owner_names: ownerNames,
      notion_owner_ids: notionOwnerIds,
    });

    if (accessErr) console.error("owner_access insert failed:", accessErr);

    const completedAt = new Date().toISOString();

    await sb.from("onboarding_sessions").update({
      owner_access_token: accessToken,
      current_step: 10,
      status: "complete",
      completed_at: completedAt,
    }).eq("token", token);

    // Mark Notion owner as Active
    if (session.notion_owner_id) {
      try {
        await updateNotionPage(session.notion_owner_id, {
          Status: { select: { name: "Active" } },
        });
      } catch (e) { console.error("Notion owner status update failed:", e); }
    }

    // Email 8 — welcome + dashboard link
    if (session.owner_email) {
      try {
        const parsedLease = session.lease_parsed_data ?? {};
        const tenants: Array<Record<string, unknown>> = Array.isArray(parsedLease.tenants) ? parsedLease.tenants : [];
        const leaseStart = parsedLease.leaseStart;
        const rentDate = leaseStart
          ? new Date(String(leaseStart)).toLocaleDateString("en-CA", { month: "long", day: "numeric" })
          : "the 1st";

        const html = onboardEmail8Welcome({
          ownerName: session.owner_name || "there",
          propertyAddress: session.property_address || "your property",
          tenantCount: tenants.length,
          rentCollectionDate: rentDate,
          dashboardUrl: `${BASE_URL}/owners/${accessToken}`,
        });
        await sendEmail(session.owner_email, "You're officially with Prospera Properties 🎉", html, ["prosperapropertiess@gmail.com"]);
      } catch (e) { console.error("Email 8 failed:", e); }
    }

    return NextResponse.json({ ok: true, access_token: accessToken });
  }

  return NextResponse.json({ error: `Step ${step} not handled` }, { status: 400 });
}
