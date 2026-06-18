import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { onboardEmail8Welcome } from "@/lib/emails";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? "ebinjaison02@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = onboardEmail8Welcome({
    ownerName: "Randy Lahey",
    propertyAddress: "27 Horton Street, St. Thomas",
    tenantCount: 2,
    rentCollectionDate: "July 1",
    dashboardUrl: "https://www.prosperaproperties.co/owners/demo",
    checkInDate: "July 18, 2026",
  });

  const { error } = await resend.emails.send({
    from: "Ebin at Prospera <hello@prosperaproperties.co>",
    to: [to],
    subject: "[TEST] You're officially with Prospera Properties 🎉",
    html,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ sent: true, to });
}
