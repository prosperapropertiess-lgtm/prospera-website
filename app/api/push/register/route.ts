import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { expo_push_token, user_type, user_token, platform } = await req.json();

    if (!expo_push_token || !user_type || !user_token || !platform) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Upsert — if this device already registered, update the token
    const { error } = await supabaseAdmin
      .from("push_tokens")
      .upsert(
        {
          expo_push_token,
          user_type,
          user_token,
          platform,
        },
        { onConflict: "expo_push_token" }
      );

    if (error) {
      console.error("Push token registration error:", error);
      return NextResponse.json({ error: "Failed to register" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push register error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
