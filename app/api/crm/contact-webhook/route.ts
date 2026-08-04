/**
 * HubSpot Contact Webhook
 * HubSpot fires this endpoint when a contact is created OR when
 * contact_type is set/changed on a contact.
 *
 * Register this URL in your HubSpot app:
 *   HubSpot → Settings → Integrations → Private Apps → [your app]
 *   → Webhooks → Create subscription
 *   Event type: contact.creation  +  contact.propertyChange (property: contact_type)
 *   Target URL: https://www.prosperaproperties.co/api/crm/contact-webhook
 *
 * This immediately enrolls the contact in the right sequence —
 * no waiting for the hourly hubspot-sync cron.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SEQUENCES } from "@/lib/email-sequences";
import crypto from "crypto";

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const WEBHOOK_SECRET = process.env.HUBSPOT_WEBHOOK_SECRET; // set this in Vercel

// Verify the webhook signature from HubSpot
function verifySignature(req: NextRequest, body: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("[contact-webhook] HUBSPOT_WEBHOOK_SECRET not set — skipping signature check");
    return true; // allow through in dev; tighten in prod
  }
  const signature = req.headers.get("x-hubspot-signature-v3") ?? "";
  const timestamp = req.headers.get("x-hubspot-request-timestamp") ?? "";
  const method = "POST";
  const url = `https://www.prosperaproperties.co/api/crm/contact-webhook`;

  // HubSpot v3: HMAC-SHA256 of method + url + body + timestamp
  const sourceString = method + url + body + timestamp;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(sourceString).digest("base64");

  return signature === expected;
}

interface HubSpotWebhookEvent {
  objectId: number;       // HubSpot contact ID
  subscriptionType: string;
  propertyName?: string;
  propertyValue?: string;
}

async function fetchContactFromHubSpot(hubspotId: number): Promise<{
  email: string | null;
  name: string | null;
  contactType: string | null;
} | null> {
  if (!HUBSPOT_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${hubspotId}?properties=email,firstname,lastname,contact_type`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const p = data.properties ?? {};
    const name = [p.firstname, p.lastname].filter(Boolean).join(" ").trim() || null;
    return {
      email: p.email?.trim().toLowerCase() ?? null,
      name,
      contactType: p.contact_type ?? null,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  if (!verifySignature(req, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let events: HubSpotWebhookEvent[];
  try {
    const parsed = JSON.parse(body);
    events = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  let enrolled = 0;
  let skipped = 0;

  for (const event of events) {
    const hubspotId = event.objectId;
    if (!hubspotId) continue;

    // Only act on contact creation or contact_type property changes
    const isCreation = event.subscriptionType === "contact.creation";
    const isTypeChange =
      event.subscriptionType === "contact.propertyChange" &&
      event.propertyName === "contact_type";

    if (!isCreation && !isTypeChange) {
      skipped++;
      continue;
    }

    // Fetch full contact details from HubSpot
    const contact = await fetchContactFromHubSpot(hubspotId);
    if (!contact?.email || !contact.contactType) {
      skipped++;
      continue;
    }

    // Skip if no sequence exists for this type
    if (!SEQUENCES[contact.contactType]) {
      skipped++;
      continue;
    }

    // Upsert contact into our local table
    await sb.from("hubspot_contacts").upsert(
      {
        hubspot_id:   hubspotId,
        email:        contact.email,
        name:         contact.name,
        contact_type: contact.contactType,
        synced_at:    new Date().toISOString(),
      },
      { onConflict: "hubspot_id" }
    );

    // Check if already enrolled
    const { data: existing } = await sb
      .from("email_sequence_state")
      .select("id, contact_type")
      .eq("hubspot_id", hubspotId)
      .maybeSingle();

    if (isTypeChange && existing) {
      // Contact type changed — if they're already in a different sequence,
      // reset to the new one from the beginning
      if (existing.contact_type !== contact.contactType) {
        await sb.from("email_sequence_state").update({
          contact_type:   contact.contactType,
          sequence_index: 0,
          next_send_at:   new Date().toISOString(), // send first email today
          completed:      false,
          unsubscribed:   false,
          enrolled_at:    new Date().toISOString(),
        }).eq("id", existing.id);
        enrolled++;
      } else {
        skipped++;
      }
      continue;
    }

    if (existing) {
      skipped++;
      continue; // already enrolled, leave it alone
    }

    // New enrollment — first email fires immediately (next_send_at = now)
    const { error } = await sb.from("email_sequence_state").insert({
      hubspot_id:     hubspotId,
      email:          contact.email,
      contact_type:   contact.contactType,
      sequence_index: 0,
      next_send_at:   new Date().toISOString(),
      enrolled_at:    new Date().toISOString(),
    });

    if (error) {
      console.error(`[contact-webhook] enroll error for ${hubspotId}:`, error.message);
    } else {
      enrolled++;
    }
  }

  return NextResponse.json({ enrolled, skipped });
}
