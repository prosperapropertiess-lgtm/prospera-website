import { NextResponse } from "next/server";
import { clearLeasingSessionCookie } from "@/lib/leasing-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearLeasingSessionCookie(res);
  return res;
}
