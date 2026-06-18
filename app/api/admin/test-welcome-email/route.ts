import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { onboardEmail1Welcome } from "@/lib/emails";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? "ebinjaison02@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = onboardEmail1Welcome({
    ownerName: "Randy Lahey",
    propertyAddress: "27 Horton Street, St. Thomas",
    dashboardUrl: "https://www.prosperaproperties.co/onboard/demo",
  });

  const { error } = await resend.emails.send({
    from: "Ebin at Prospera <hello@prosperaproperties.co>",
    to: [to],
    subject: "[TEST] Welcome to Prospera — let's get started",
    html,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ sent: true, to });
}
