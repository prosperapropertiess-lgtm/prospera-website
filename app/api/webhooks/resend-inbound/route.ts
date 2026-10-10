import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizePropertyPayload, downloadAndStoreImage } from "@/lib/agent-listings";

// Only these addresses are trusted to create listings by email. Anything
// else gets silently ignored — never reveal to an untrusted sender whether
// their email did anything.
const ALLOWED_SENDERS = (process.env.INBOUND_EMAIL_ALLOWED_SENDERS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

interface ReceivedEmailWebhook {
  type: string;
  data: {
    email_id: string;
    from: string;
    subject: string;
    attachments?: { id: string; filename: string; content_type: string }[];
  };
}

async function resendGet(path: string) {
  const res = await fetch(`https://api.resend.com${path}`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Resend API ${path} failed: ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  // Signature verification needs the RAW body — never parse-then-restringify.
  const payload = await req.text();
  const svixId = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  let event: ReceivedEmailWebhook;
  try {
    const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ReceivedEmailWebhook;
  } catch (err) {
    console.error("[resend-inbound] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true }); // not something we handle, ack and ignore
  }

  const { email_id, from, subject, attachments: attachmentMeta } = event.data;
  const fromAddress = (from.match(/<(.+)>/)?.[1] ?? from).toLowerCase().trim();

  if (!ALLOWED_SENDERS.includes(fromAddress)) {
    console.error(`[resend-inbound] Rejected — untrusted sender: ${fromAddress}`);
    return NextResponse.json({ ok: true }); // ack silently, don't leak anything
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ ok: true });
  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  async function replyTo(subjectLine: string, body: string) {
    await resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: fromAddress,
      subject: subjectLine,
      text: body,
    }).catch((err: unknown) => console.error("[resend-inbound] Reply failed:", err));
  }

  // Webhook payload is metadata-only — fetch the real body text.
  let email: { text?: string; html?: string };
  try {
    email = await resendGet(`/emails/receiving/${email_id}`);
  } catch (err) {
    console.error("[resend-inbound] Failed to fetch email content:", err);
    return NextResponse.json({ ok: true });
  }
  const bodyText = email.text || email.html || "";

  // AI-extract structured listing fields from the free-form email — this is
  // the whole point of email intake over the API: no rigid format required,
  // just describe the property like you would to a person.
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const extraction = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Extract property listing details from this email. Be conservative — use null for anything not clearly stated, never guess or invent a value.

Subject: ${subject}

Body:
${bodyText}

Return ONLY this JSON structure, no markdown, no explanation:
{
  "address": string or null,
  "city": string or null,
  "price": number or null,
  "bedrooms": number or null,
  "bathrooms": number or null,
  "property_type": "house" | "apartment" | "condo" | "townhouse" | "duplex" | "triplex" | "other" or null,
  "sqft": number or null,
  "description": string or null,
  "laundry_type": "none" | "in-unit" | "shared" | "coin-op" or null,
  "parking_type": "none" | "street" | "driveway" | "garage" | "underground" | "lot" or null,
  "pet_friendly": true | false or null,
  "utilities_included": true | false or null,
  "available_date": "YYYY-MM-DD" or null
}`,
    }],
  });

  const raw = extraction.content[0].type === "text" ? extraction.content[0].text.trim() : "{}";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  let fields: Record<string, unknown>;
  try {
    fields = JSON.parse(cleaned);
  } catch (err) {
    console.error("[resend-inbound] Extraction parse failed:", err, raw);
    await replyTo(`Couldn't read that one — ${subject}`, "I had trouble parsing the property details from that email. Try describing it again with the address, price, and bed/bath count clearly stated.");
    return NextResponse.json({ ok: true });
  }

  const missing = ["address", "city", "price", "bedrooms", "bathrooms"].filter((f) => !fields[f]);
  if (missing.length) {
    await replyTo(
      `Missing a few details — ${subject}`,
      `I couldn't find these in your email: ${missing.join(", ")}. Resend with those included and I'll create the listing.`
    );
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseAdmin();
  const insertPayload = normalizePropertyPayload(fields, true);
  const { data: created, error } = await supabase.from("properties").insert([insertPayload]).select().single();
  if (error) {
    console.error("[resend-inbound] Insert failed:", error);
    await replyTo(`Something went wrong — ${subject}`, "The listing couldn't be created. Prospera's team has been notified.");
    return NextResponse.json({ ok: true });
  }

  // Download and attach any image attachments.
  const imageErrors: string[] = [];
  const storedImages: string[] = [];
  if (attachmentMeta?.length) {
    try {
      const attData = await resendGet(`/emails/receiving/${email_id}/attachments`);
      for (const att of attData.data ?? []) {
        if (!att.content_type?.startsWith("image/")) continue;
        try {
          storedImages.push(await downloadAndStoreImage(att.download_url, created.id));
        } catch (err) {
          imageErrors.push(err instanceof Error ? err.message : String(err));
        }
      }
    } catch (err) {
      console.error("[resend-inbound] Failed to fetch attachments:", err);
    }
  }
  if (storedImages.length) {
    await supabase.from("properties").update({ images: storedImages }).eq("id", created.id);
  }

  await replyTo(
    `Listing created — ${created.address}`,
    `Created as a draft: ${storedImages.length} photo(s) attached.\n\nPreview: https://www.prosperaproperties.co/listings/${created.id}\n\nReply with changes, or tell me to publish it when you're ready.${imageErrors.length ? `\n\n(${imageErrors.length} photo(s) failed to attach: ${imageErrors.join("; ")})` : ""}`
  );

  return NextResponse.json({ ok: true, property_id: created.id });
}
