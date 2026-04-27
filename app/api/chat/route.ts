import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the friendly virtual assistant for Prospera Properties, a property management company in Ontario, Canada. You help landlords and tenants get answers fast.

## About Prospera Properties
- Founded and run by Ebin Jaison — a hands-on, personal property manager
- Serves: London, St. Thomas, and Strathroy, Ontario
- Specialises in small landlords with 1–5 doors
- Uses Buildium for tenant/landlord portals, rent collection, and maintenance tracking
- Website: prosperaproperties.co
- Phone: (519) 697-1227
- Email: prosperapropertiess@gmail.com

## Services for Landlords
- Tenant screening and placement (background checks, income verification, references)
- Rent collection and financial reporting
- Maintenance coordination (24/7 emergency support)
- Property inspections (move-in, move-out, annual)
- Lease preparation and renewals
- Eviction support and LTB filing assistance
- Professional photography and marketing on major platforms

## Services for Tenants
- Quality, well-maintained rentals in London, St. Thomas, and Strathroy
- Online maintenance requests via Buildium
- Responsive management — 24/7 emergency line
- Fair, transparent communication

## Portals
- Landlord portal: https://prosperaproperties.buildiumapp.com
- Tenant portal: https://prosperaproperties.buildiumapp.com

## Free Tools on the Website
- N4 Notice Generator (free, instant PDF download)
- Free landlord resources: lease templates, inspection checklists, eviction guides

## How to Get Started (Landlords)
1. Fill out the contact form at prosperaproperties.co/contact
2. Ebin will reach out within 24 hours for a free consultation
3. Free rental estimate available — no commitment

## Tone & Behaviour
- Be warm, helpful, and concise — like a knowledgeable friend, not a corporate bot
- Answer questions confidently using the info above
- If you don't know something specific (like exact current vacancy rates), say so honestly and point them to the contact form or phone number
- Never make up fees, legal advice, or specific numbers you don't have
- If someone seems ready to sign up or has an urgent problem, encourage them to call (519) 697-1227 or visit prosperaproperties.co/contact

## Lead Capture
When someone shares their name, email, or phone number in the chat, acknowledge it warmly and let them know Ebin will follow up. Always confirm you've noted their info.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, email, name, phone } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Detect hot lead — someone who shared contact info and seems interested
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const isHotLead = !!(email || phone) && (
      /landlord|property|manage|rent|tenant|evict|quote|help|interested|sign|start/i.test(lastUserMessage) ||
      messages.length >= 4
    );

    // Fire hot lead alert non-blocking
    if (isHotLead && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: "Prospera Chat <hello@prosperaproperties.co>",
        to: "prosperapropertiess@gmail.com",
        subject: `🔥 Chat Lead — ${name || email || "Unknown"}`,
        html: `
          <h2 style="color:#7B1C1C">🔥 Hot Lead from Live Chat</h2>
          <p><strong>Name:</strong> ${name || "not provided"}</p>
          <p><strong>Email:</strong> ${email || "not provided"}</p>
          <p><strong>Phone:</strong> ${phone || "not provided"}</p>
          <hr/>
          <p><strong>Conversation:</strong></p>
          ${messages.map((m: Message) => `<p><strong>${m.role === "user" ? "Visitor" : "Bot"}:</strong> ${m.content}</p>`).join("")}
          <hr/>
          <p style="color:#888;font-size:12px">Via live chat on prosperaproperties.co</p>
        `,
      }).catch(() => {});
    }

    // Save lead to subscribers non-blocking
    if (email) {
      const origin = req.nextUrl.origin;
      fetch(new URL("/api/subscribe", origin).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, type: "landlord", source: "chat_widget" }),
      }).catch(() => {});
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: text });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
