import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";

// Positions extracted directly from the PDF's AcroForm widget rectangles.
// x, y = bottom-left of the field box. Text is drawn at x+2, y+5 (small inset).
const COORDS = {
  // Page 1 (PDF page index 1)
  tenantName:      { page: 1, x: 30,  y: 672 },  // box: x=28 y=665 h=37
  landlordName:    { page: 1, x: 310, y: 672 },  // box: x=308 y=665 h=37
  address:         { page: 1, x: 30,  y: 618 },  // box: x=28 y=611 h=37
  amountOwing:     { page: 1, x: 379, y: 510 },  // box: x=377 y=505 h=20
  terminationDate: { page: 1, x: 183, y: 444 },  // box: x=181 y=439 h=19

  // Page 2 (PDF page index 2) — rent arrears table
  rows: [
    { page: 2, fromX: 30,  toX: 138, chargedX: 246, paidX: 354, owingX: 462, y: 467 }, // row 1: y=462 h=20
    { page: 2, fromX: 30,  toX: 138, chargedX: 246, paidX: 354, owingX: 462, y: 442 }, // row 2: y=437 h=20
    { page: 2, fromX: 30,  toX: 138, chargedX: 246, paidX: 354, owingX: 462, y: 417 }, // row 3: y=412 h=20
  ],

  totalOwing:    { page: 2, x: 450, y: 392 },  // box: x=448 y=387 h=20
  firstName:     { page: 2, x: 27,  y: 322 },  // box: x=25 y=317 h=20
  lastName:      { page: 2, x: 27,  y: 286 },  // box: x=25 y=281 h=21
  phone:         { page: 2, x: 27,  y: 250 },  // box: x=25 y=245 h=20
  signatureDate: { page: 2, x: 284, y: 193 },  // box: x=282 y=188 h=20
};

const BLACK = rgb(0, 0, 0);
const SIZE  = 10;

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

    // Load PDF
    const pdfPath = path.join(process.cwd(), "public", "forms", "N4-clean.pdf");
    const pdfBytes = await readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();

    const draw = (pageIdx: number, text: string, x: number, y: number, size = SIZE) => {
      if (!text) return;
      pages[pageIdx].drawText(String(text), { x, y, size, font, color: BLACK });
    };

    // ── Page 1 ─────────────────────────────────────────────────────────────────
    draw(COORDS.tenantName.page,      tenantNames,        COORDS.tenantName.x,      COORDS.tenantName.y);
    draw(COORDS.landlordName.page,    landlordName,       COORDS.landlordName.x,    COORDS.landlordName.y);
    draw(COORDS.address.page,         rentalAddress,      COORDS.address.x,         COORDS.address.y);
    draw(COORDS.amountOwing.page,     String(amountOwing),COORDS.amountOwing.x,     COORDS.amountOwing.y);
    draw(COORDS.terminationDate.page, terminationDate,    COORDS.terminationDate.x, COORDS.terminationDate.y);

    // ── Rent period rows ───────────────────────────────────────────────────────
    let total = 0;
    (rentPeriods as Array<{ from: string; to: string; charged: string; paid: string }>)
      .slice(0, 3)
      .forEach((period, i) => {
        const row = COORDS.rows[i];
        const charged = parseFloat(period.charged || "0");
        const paid    = parseFloat(period.paid    || "0");
        const owing   = charged - paid;
        total += owing;

        draw(row.page, period.from, row.fromX,    row.y);
        draw(row.page, period.to,   row.toX,      row.y);
        if (period.charged) draw(row.page, charged.toFixed(2), row.chargedX, row.y);
        if (period.paid)    draw(row.page, paid.toFixed(2),    row.paidX,    row.y);
        if (owing > 0)      draw(row.page, owing.toFixed(2),   row.owingX,   row.y);
      });

    // ── Signature page ─────────────────────────────────────────────────────────
    draw(COORDS.totalOwing.page,    total.toFixed(2), COORDS.totalOwing.x,    COORDS.totalOwing.y);
    draw(COORDS.firstName.page,     landlordFirstName,COORDS.firstName.x,     COORDS.firstName.y);
    draw(COORDS.lastName.page,      landlordLastName, COORDS.lastName.x,      COORDS.lastName.y);
    draw(COORDS.phone.page,         landlordPhone,    COORDS.phone.x,         COORDS.phone.y);
    draw(COORDS.signatureDate.page, signatureDate,    COORDS.signatureDate.x, COORDS.signatureDate.y);

    // Remove interactive form fields so the output is a clean flat PDF
    pdfDoc.getForm().flatten();

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
