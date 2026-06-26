import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { placementProcessEmail } from "@/lib/emails";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { to, name } = await req.json();
    if (!to || !name) return NextResponse.json({ error: "to and name required" }, { status: 400 });

    const html = placementProcessEmail(name);

    // Attach PDFs if they exist in /public/downloads/
    const attachments: { filename: string; content: Buffer }[] = [];
    const files = [
      { filename: "Prospera-Lease-Addendum.pdf", path: "lease-addendum.pdf" },
      { filename: "Prospera-Sample-Screening-Report.pdf", path: "sample-screening-report.pdf" },
    ];
    for (const f of files) {
      const filePath = path.join(process.cwd(), "public", "downloads", f.path);
      if (fs.existsSync(filePath)) {
        attachments.push({ filename: f.filename, content: fs.readFileSync(filePath) });
      }
    }

    const { data, error } = await getResend().emails.send({
      from: "Ebin at Prospera <hello@prosperaproperties.co>",
      to,
      cc: ["prosperapropertiess@gmail.com"],
      subject: "How we handle tenant placement — Prospera Properties",
      html,
      attachments: attachments.length ? attachments : undefined,
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
