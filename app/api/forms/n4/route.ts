import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";

// ── Coordinate map ─────────────────────────────────────────────────────────────
// All y values are measured from the BOTTOM of the page (pdf-lib convention).
// Adjust these if text lands off-target after testing.

const PAGE1 = {
  tenantName:      { x: 46,  y: 634 },
  landlordName:    { x: 314, y: 634 },
  address:         { x: 46,  y: 574 },
  amountOwing:     { x: 347, y: 456 },
  terminationDate: { x: 224, y: 410 },
};

const PAGE2 = {
  rows: [
    { fromX: 46, toX: 159, chargedX: 292, paidX: 393, owingX: 487, y: 410 },
    { fromX: 46, toX: 159, chargedX: 292, paidX: 393, owingX: 487, y: 383 },
    { fromX: 46, toX: 159, chargedX: 292, paidX: 393, owingX: 487, y: 356 },
  ],
  totalOwing:    { x: 487, y: 329 },
  firstName:     { x: 50,  y: 261 },
  lastName:      { x: 50,  y: 232 },
  phone:         { x: 61,  y: 199 },
  signatureDate: { x: 355, y: 162 },
};

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tenantNames,
      landlordName,
      rentalAddress,
      amountOwing,
      terminationDate,
      rentPeriods,
      landlordFirstName,
      landlordLastName,
      landlordPhone,
      signatureDate,
      email,
      wantsHelp,
    } = body;

    // Save the lead + optional hot lead alert — non-blocking
    const origin = req.nextUrl.origin;
    const leadPromises: Promise<unknown>[] = [];

    if (email) {
      leadPromises.push(
        fetch(new URL("/api/subscribe", origin).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, type: "landlord", source: "n4_generator" }),
        }).catch(() => {})
      );
    }

    // 🔥 Hot lead alert
    if (wantsHelp && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      leadPromises.push(
        resend.emails.send({
          from: "Prospera Tools <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `🔥 HOT LEAD — N4: ${rentalAddress}`,
          html: `
            <h2 style="color:#7B1C1C">🔥 Hot Lead — Wants Help with N4</h2>
            <p><strong>Email:</strong> ${email || "not provided"}</p>
            <p><strong>Landlord:</strong> ${landlordFirstName} ${landlordLastName}</p>
            <p><strong>Phone:</strong> ${landlordPhone || "not provided"}</p>
            <p><strong>Property:</strong> ${rentalAddress}</p>
            <p><strong>Tenant(s):</strong> ${tenantNames}</p>
            <p><strong>Amount Owing:</strong> $${amountOwing}</p>
            <p><strong>Termination Date:</strong> ${terminationDate}</p>
            <hr/>
            <p style="color:#888;font-size:12px">Generated via the N4 Form Builder on prosperaproperties.co</p>
          `,
        }).catch(() => {})
      );
    }

    await Promise.all(leadPromises);

    // Read PDF directly from filesystem — bypasses middleware/coming-soon redirect
    const pdfPath = path.join(process.cwd(), "public", "forms", "N4.pdf");
    const pdfBytes = await readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const SIZE = 10;

    const draw = (
      page: ReturnType<typeof pdfDoc.getPage>,
      text: string,
      x: number,
      y: number,
      size = SIZE
    ) => {
      if (!text) return;
      page.drawText(String(text), { x, y, size, font, color: rgb(0, 0, 0) });
    };

    // ── Page 1 of form (PDF index 1 — skip the checklist at index 0) ──────────
    const p1 = pdfDoc.getPage(1);
    draw(p1, tenantNames, PAGE1.tenantName.x, PAGE1.tenantName.y);
    draw(p1, landlordName, PAGE1.landlordName.x, PAGE1.landlordName.y);
    draw(p1, rentalAddress, PAGE1.address.x, PAGE1.address.y);
    draw(p1, String(amountOwing), PAGE1.amountOwing.x, PAGE1.amountOwing.y, 11);
    draw(p1, terminationDate, PAGE1.terminationDate.x, PAGE1.terminationDate.y);

    // ── Page 2 of form (PDF index 2) ──────────────────────────────────────────
    const p2 = pdfDoc.getPage(2);

    let total = 0;
    (rentPeriods as Array<{
      from: string; to: string; charged: string; paid: string;
    }>).slice(0, 3).forEach((period, i) => {
      const row = PAGE2.rows[i];
      const charged = parseFloat(period.charged || "0");
      const paid = parseFloat(period.paid || "0");
      const owing = charged - paid;
      total += owing;

      draw(p2, period.from, row.fromX, row.y);
      draw(p2, period.to, row.toX, row.y);
      if (period.charged) draw(p2, charged.toFixed(2), row.chargedX, row.y);
      if (period.paid)    draw(p2, paid.toFixed(2),    row.paidX,    row.y);
      if (owing > 0)      draw(p2, owing.toFixed(2),   row.owingX,   row.y);
    });

    draw(p2, total.toFixed(2), PAGE2.totalOwing.x, PAGE2.totalOwing.y, 11);
    draw(p2, landlordFirstName, PAGE2.firstName.x, PAGE2.firstName.y);
    draw(p2, landlordLastName,  PAGE2.lastName.x,  PAGE2.lastName.y);
    draw(p2, landlordPhone,     PAGE2.phone.x,     PAGE2.phone.y);
    draw(p2, signatureDate,     PAGE2.signatureDate.x, PAGE2.signatureDate.y);

    const filledPdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(filledPdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="N4-Notice.pdf"',
      },
    });
  } catch (err) {
    console.error("N4 generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
