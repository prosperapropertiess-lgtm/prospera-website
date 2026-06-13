import { NextRequest } from "next/server";
import { placementProcessEmail } from "@/lib/emails";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") || "Shamseer";
  const html = placementProcessEmail(name);
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
