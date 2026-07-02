import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const VALID_EVENTS = ["popup_shown", "popup_closed", "popup_converted"] as const;
type PopupEvent = (typeof VALID_EVENTS)[number];

// POST /api/analytics/popup
// Body: { event: string, page: string, metadata?: object }
// No auth required — public tracking endpoint
export async function POST(req: NextRequest) {
  let body: { event?: string; page?: string; metadata?: Record<string, unknown> };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, page, metadata } = body;

  if (!event || !VALID_EVENTS.includes(event as PopupEvent)) {
    return NextResponse.json(
      { error: `event must be one of: ${VALID_EVENTS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!page || typeof page !== "string") {
    return NextResponse.json({ error: "page is required" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { error } = await db.from("popup_analytics").insert({
    event,
    page: page.slice(0, 512),
    metadata: metadata ?? null,
  });

  if (error) {
    console.error("[analytics/popup] Supabase insert error:", error);
    // Return 200 so client-side tracking never breaks the user experience
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
