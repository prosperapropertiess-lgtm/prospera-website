import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateTenantToken, getTenantMessages, getTenantInfo } from "@/lib/tenant-data";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EBIN_EMAIL = "prosperapropertiess@gmail.com";
const FROM = "Ebin at Prospera <ebin@prosperaproperties.co>";

const LAURA_SYSTEM = `You are Laura, the friendly AI assistant for Prospera Properties, a property management company in Ontario.
A tenant is messaging about their rental. Be warm and helpful. Answer if you can.
If it's about maintenance, tell them to use the Maintenance section in their portal.
If it's an emergency (flood, fire, no heat in winter, gas leak), say: "This sounds like an emergency. Please call Ebin directly at (519) 697-1227 right now." and flag it.
If you cannot answer confidently, say: "I've noted your message and Ebin will follow up with you shortly."
Keep responses under 120 words. Be conversational, not corporate.`;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const access = await validateTenantToken(token);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await getTenantMessages(token);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  let body: { token?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, content } = body;
  if (!token || !content) {
    return NextResponse.json({ error: "Missing token or content" }, { status: 400 });
  }

  const access = await validateTenantToken(token);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  const { data: userMessage, error: insertError } = await sb
    .from("tenant_messages")
    .insert({
      tenant_id: access.notion_tenant_id,
      token,
      author: "tenant",
      author_name: access.tenant_name,
      content,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const aiResponse = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: LAURA_SYSTEM,
    messages: [{ role: "user", content }],
  });

  const aiText = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";

  const { data: aiMessage, error: aiInsertError } = await sb
    .from("tenant_messages")
    .insert({
      tenant_id: access.notion_tenant_id,
      token,
      author: "ai",
      author_name: "Laura",
      content: aiText,
    })
    .select()
    .single();

  if (aiInsertError) return NextResponse.json({ error: aiInsertError.message }, { status: 500 });

  const needsEscalation = aiText.includes("Ebin will follow up") || aiText.toLowerCase().includes("emergency");
  if (needsEscalation) {
    const info = await getTenantInfo(access.notion_tenant_id);
    await getResend().emails.send({
      from: FROM,
      to: EBIN_EMAIL,
      subject: `Tenant Message Needs Follow-Up — ${access.tenant_name}`,
      html: `<p><strong>Tenant:</strong> ${access.tenant_name}</p>
<p><strong>Property:</strong> ${info?.propertyAddress ?? access.property_id}</p>
<p><strong>Tenant message:</strong> ${content}</p>
<p><strong>Laura's response:</strong> ${aiText}</p>`,
    });
  }

  return NextResponse.json({ userMessage, aiMessage });
}
