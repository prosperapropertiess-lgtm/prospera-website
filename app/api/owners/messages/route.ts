import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Ebin at Prospera <ebin@prosperaproperties.co>";
const EBIN_EMAIL = "prosperapropertiess@gmail.com";

export interface PropertyMessage {
  id: string;
  author: "ebin" | "owner";
  author_name: string;
  content: string;
  message_type: string;
  created_at: string;
}

async function validateToken(token: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("owner_access")
    .select("token")
    .eq("token", token)
    .single();
  return !!data;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const token = searchParams.get("token");

  if (!propertyId || !token) {
    return NextResponse.json({ error: "Missing propertyId or token" }, { status: 400 });
  }

  const valid = await validateToken(token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data: messages, error } = await getSupabaseAdmin()
    .from("property_messages")
    .select("id, author, author_name, content, message_type, created_at")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { propertyId, token, content, authorName } = body as {
    propertyId: string;
    token: string;
    content: string;
    authorName: string;
  };

  if (!propertyId || !token || !content || !authorName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const valid = await validateToken(token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data: message, error } = await getSupabaseAdmin()
    .from("property_messages")
    .insert({
      property_id: propertyId,
      token,
      author: "owner",
      author_name: authorName,
      content,
      message_type: "general",
    })
    .select("id, author, author_name, content, message_type, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://prosperaproperties.co"}/owners/${token}/${propertyId}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: EBIN_EMAIL,
    subject: `New message from ${authorName} — your property`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1F2F3A;">
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">New message from ${authorName}</h2>
        <p style="font-size: 14px; color: #5A6A7A; margin-bottom: 24px;">${new Date().toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</p>
        <div style="background: #F7F5F2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">${content}</p>
        </div>
        <a href="${propertyUrl}" style="display: inline-block; background: #8B2030; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
          View property page →
        </a>
      </div>
    `,
  });

  return NextResponse.json({ message });
}
