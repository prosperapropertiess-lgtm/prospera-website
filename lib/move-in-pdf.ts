/**
 * Move-In Coordinator PDF generation — pdf-lib (already a dependency, used
 * elsewhere for LTB forms). No rich-text/flow engine here, so this is a
 * manual paginated layout: a running Y cursor per page, new page whenever
 * content would run off the bottom.
 */
import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from "pdf-lib";

const PAGE_W = 612, PAGE_H = 792; // US Letter
const MARGIN = 50;
const NAVY = rgb(0x1f / 255, 0x2f / 255, 0x3a / 255);
const CRIMSON = rgb(0x8b / 255, 0x20 / 255, 0x30 / 255);
const GREY = rgb(0.4, 0.4, 0.4);
const LIGHT = rgb(0.92, 0.92, 0.9);

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN) newPage(ctx);
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function heading(ctx: Ctx, text: string) {
  ensureSpace(ctx, 40);
  ctx.y -= 8;
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 20, width: PAGE_W - MARGIN * 2, height: 26, color: NAVY });
  ctx.page.drawText(text, { x: MARGIN + 10, y: ctx.y - 14, size: 12, font: ctx.bold, color: rgb(1, 1, 1) });
  ctx.y -= 34;
}

function subheading(ctx: Ctx, text: string) {
  ensureSpace(ctx, 26);
  ctx.page.drawText(text, { x: MARGIN, y: ctx.y, size: 11, font: ctx.bold, color: NAVY });
  ctx.y -= 18;
}

function bodyLines(ctx: Ctx, text: string, opts?: { size?: number; color?: ReturnType<typeof rgb>; indent?: number }) {
  const size = opts?.size ?? 10;
  const color = opts?.color ?? rgb(0.1, 0.1, 0.1);
  const indent = opts?.indent ?? 0;
  const lines = wrapText(text, ctx.font, size, PAGE_W - MARGIN * 2 - indent);
  for (const line of lines) {
    ensureSpace(ctx, size + 6);
    ctx.page.drawText(line, { x: MARGIN + indent, y: ctx.y, size, font: ctx.font, color });
    ctx.y -= size + 5;
  }
}

async function embedPhoto(ctx: Ctx, url: string): Promise<{ img: Awaited<ReturnType<PDFDocument["embedJpg"]>>; w: number; h: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "";
    const img = contentType.includes("png") ? await ctx.doc.embedPng(bytes) : await ctx.doc.embedJpg(bytes);
    return { img, w: img.width, h: img.height };
  } catch {
    return null;
  }
}

const CONDITION_LABELS: Record<string, string> = {
  good: "Good", existing_damage: "Existing Damage", needs_attention: "Needs Attention",
  not_inspected: "Not Inspected", not_applicable: "N/A",
};
const CONDITION_COLORS: Record<string, ReturnType<typeof rgb>> = {
  good: rgb(0.05, 0.45, 0.3), existing_damage: CRIMSON, needs_attention: rgb(0.7, 0.5, 0.05),
  not_inspected: GREY, not_applicable: GREY,
};

interface RoomItem { label: string; condition: string; notes: string | null; repair_needed: boolean; photos: { url: string }[] }
interface Room { name: string; items: RoomItem[] }
interface Appliance { name: string; location: string | null; cosmetic_condition: string; test_status: string; brand: string | null; model: string | null; serial_number: string | null; photos: { url: string }[] }
interface KeyItem { item_name: string; quantity: number }
interface Signature { signer_name: string; signer_role: string; signature_data: string; signed_at: string }

export interface InspectionReportInput {
  propertyAddress: string;
  ownerName: string | null;
  tenantNames: string[];
  inspectorName: string | null;
  moveInDate: string | null;
  reportVersion: number;
  rooms: Room[];
  appliances: Appliance[];
  keys: KeyItem[];
  meterReadings: { utility: string; reading: string }[];
  signatures: Signature[];
}

const TEST_LABELS: Record<string, string> = { working: "Working", issue: "Issue Observed", not_tested: "Not Tested" };

export async function generateInspectionReportPdf(input: InspectionReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), font, bold, y: PAGE_H - MARGIN };

  // Cover
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 140, width: PAGE_W, height: 140, color: NAVY });
  ctx.page.drawText("Prospera Properties", { x: MARGIN, y: PAGE_H - 55, size: 12, font: bold, color: rgb(1, 1, 1) });
  ctx.page.drawText("Move-In Inspection Report", { x: MARGIN, y: PAGE_H - 90, size: 22, font: bold, color: rgb(1, 1, 1) });
  ctx.page.drawText(input.propertyAddress, { x: MARGIN, y: PAGE_H - 115, size: 12, font, color: rgb(0.85, 0.85, 0.85) });
  ctx.y = PAGE_H - 165;

  bodyLines(ctx, `Owner: ${input.ownerName || "—"}`, { size: 10 });
  bodyLines(ctx, `Tenant(s): ${input.tenantNames.join(", ") || "—"}`, { size: 10 });
  bodyLines(ctx, `Inspector: ${input.inspectorName || "—"}`, { size: 10 });
  bodyLines(ctx, `Move-In Date: ${input.moveInDate || "—"}`, { size: 10 });
  bodyLines(ctx, `Report Version: ${input.reportVersion}`, { size: 10 });
  ctx.y -= 10;

  for (const room of input.rooms) {
    if (room.items.length === 0) continue;
    heading(ctx, room.name);
    for (const item of room.items) {
      ensureSpace(ctx, 20);
      const label = CONDITION_LABELS[item.condition] ?? item.condition;
      const color = CONDITION_COLORS[item.condition] ?? GREY;
      ctx.page.drawText(item.label, { x: MARGIN, y: ctx.y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
      ctx.page.drawText(label, { x: PAGE_W - MARGIN - bold.widthOfTextAtSize(label, 10), y: ctx.y, size: 10, font: bold, color });
      ctx.y -= 15;
      if (item.repair_needed) bodyLines(ctx, "⚠ Repair needed", { size: 9, color: CRIMSON, indent: 10 });
      if (item.notes) bodyLines(ctx, item.notes, { size: 9, color: GREY, indent: 10 });

      for (const photo of item.photos.slice(0, 4)) {
        const embedded = await embedPhoto(ctx, photo.url);
        if (!embedded) continue;
        const targetW = 130;
        const scale = targetW / embedded.w;
        const targetH = embedded.h * scale;
        ensureSpace(ctx, targetH + 6);
        ctx.page.drawImage(embedded.img, { x: MARGIN + 10, y: ctx.y - targetH, width: targetW, height: targetH });
        ctx.y -= targetH + 8;
      }
      ctx.y -= 4;
    }
  }

  if (input.appliances.length > 0) {
    heading(ctx, "Appliances");
    for (const a of input.appliances) {
      ensureSpace(ctx, 18);
      const line = `${a.name}${a.location ? ` (${a.location})` : ""} — ${CONDITION_LABELS[a.cosmetic_condition] ?? a.cosmetic_condition} · ${TEST_LABELS[a.test_status] ?? a.test_status}`;
      bodyLines(ctx, line, { size: 10 });
      const detail = [a.brand, a.model, a.serial_number].filter(Boolean).join(" · ");
      if (detail) bodyLines(ctx, detail, { size: 9, color: GREY, indent: 10 });
    }
  }

  if (input.keys.length > 0) {
    heading(ctx, "Keys, Fobs & Remotes");
    for (const k of input.keys) bodyLines(ctx, `${k.item_name} — Qty ${k.quantity}`, { size: 10 });
  }

  if (input.meterReadings.length > 0) {
    heading(ctx, "Meter Readings");
    for (const m of input.meterReadings) bodyLines(ctx, `${m.utility}: ${m.reading}`, { size: 10 });
  }

  if (input.signatures.length > 0) {
    heading(ctx, "Signatures");
    for (const sig of input.signatures) {
      ensureSpace(ctx, 90);
      try {
        const bytes = Uint8Array.from(atob(sig.signature_data.split(",").pop() || ""), (c) => c.charCodeAt(0));
        const img = await doc.embedPng(bytes);
        const w = 160, h = (img.height / img.width) * 160;
        ctx.page.drawImage(img, { x: MARGIN, y: ctx.y - h, width: w, height: h });
        ctx.y -= h + 4;
      } catch {
        ctx.y -= 4;
      }
      ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: MARGIN + 200, y: ctx.y }, thickness: 0.5, color: LIGHT });
      ctx.y -= 12;
      bodyLines(ctx, `${sig.signer_name} — ${sig.signer_role === "tenant" ? "Tenant" : "Inspector"}`, { size: 9, color: rgb(0.1, 0.1, 0.1) });
      bodyLines(ctx, new Date(sig.signed_at).toLocaleString("en-CA"), { size: 8, color: GREY });
      ctx.y -= 10;
    }
  }

  return doc.save();
}

export interface WelcomeGuideInput {
  propertyAddress: string;
  companyName: string;
  fields: {
    garbage_instructions: string | null;
    parking_details: string | null;
    mailbox_details: string | null;
    utility_info: string | null;
    appliance_instructions: string | null;
    maintenance_contact: string | null;
    emergency_contact: string | null;
    other_notes: string | null;
  };
}

const GUIDE_SECTIONS: [keyof WelcomeGuideInput["fields"], string][] = [
  ["garbage_instructions", "Garbage & Recycling"],
  ["parking_details", "Parking & Mailbox"],
  ["mailbox_details", "Mailbox"],
  ["utility_info", "Utilities"],
  ["appliance_instructions", "Appliance Instructions"],
  ["maintenance_contact", "Maintenance & Emergency Contact"],
  ["other_notes", "Other Notes"],
];

// Internal notes are deliberately not a parameter here — this function
// only ever sees the fields a tenant/owner is meant to receive.
export async function generateWelcomeGuidePdf(input: WelcomeGuideInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), font, bold, y: PAGE_H - MARGIN };

  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 120, width: PAGE_W, height: 120, color: CRIMSON });
  ctx.page.drawText(input.companyName, { x: MARGIN, y: PAGE_H - 50, size: 12, font: bold, color: rgb(1, 1, 1) });
  ctx.page.drawText("Welcome to Your New Home", { x: MARGIN, y: PAGE_H - 82, size: 20, font: bold, color: rgb(1, 1, 1) });
  ctx.page.drawText(input.propertyAddress, { x: MARGIN, y: PAGE_H - 102, size: 11, font, color: rgb(0.95, 0.9, 0.9) });
  ctx.y = PAGE_H - 145;

  for (const [key, title] of GUIDE_SECTIONS) {
    const value = input.fields[key];
    if (!value?.trim()) continue;
    subheading(ctx, title);
    bodyLines(ctx, value);
    ctx.y -= 8;
  }

  return doc.save();
}
