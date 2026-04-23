import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { error } = await supabase.from("subscribers").insert([
      {
        email,
        name: name || null,
        type: "waitlist",
        source: "coming_soon",
      },
    ]);

    if (error) {
      // If it's a duplicate email, treat it as success
      if (error.code === "23505") {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
