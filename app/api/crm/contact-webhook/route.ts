/**
 * HubSpot Contact Webhook
 * HubSpot fires this endpoint when a contact is created OR when
 * contact_type is set/changed on a contact.
 *
 * Register this URL in HubSpot (include the token query param):
 *   HubSpot → Settings → Integrations → Private Apps → [your app]
 *   → Webhooks → Create subscription
 *   Event type: contact.creation  +  contact.propertyChange (property: contact_type)
 *   Target URL: https://www.prosperaproperties.co/api/crm/contact-webhook?token=<HUBSPOT_WEBHOOK_SECRET>
 *
 * The HUBSPOT_WEBHOOK_SECRET value is in Vercel env vars.
 * Run: vercel env ls production | grep HUBSPOT_WEBHOOK_SECRET
 * Then pull the value: vercel env pull .env.local --yes && grep HUBSPOT_WEBHOOK_SECRET .env.local
 *
 * This immediately enrolls the contact in the right sequence —
 * no waiting for the hourly hubspot-sync cron.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SEQUENCES } from "@/lib/email-sequences";

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

// Verify the token query param matches our secret
function verifyToken(req: NextRequest): boolean {
  const secret = process.env.HUBSPOT_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[contact-webhook] HUBSPOT_WEBHOOK_SECRET not set");
    return false;
  }
  const token = req.nextUrl.searchParams.get("token");
  return token === secret;
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

  if (!verifyToken(req)) {
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
