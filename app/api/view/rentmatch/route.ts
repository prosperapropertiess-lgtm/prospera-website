import { NextRequest, NextResponse } from "next/server";
import { joinRentMatch } from "@/lib/rentmatch";

export const dynamic = "force-dynamic";

// POST { token }: the one-tap "send me other homes" on the confirmation screen.
// The token is the request's full id, which only the browser that sent it has.
export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || !/^[0-9a-f-]{36}$/.test(token)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const ok = await joinRentMatch(token);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Couldn't add you. Try again." }, { status: 500 });
}
