import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ingest } from "@/lib/market/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// POST { tabs: [{ name, grid: string[][] }], dryRun?, sourceUrl? }
// For an agent that already has Sheet access. Same validation pipeline as the scheduled read.
// Auth: admin session, or "Authorization: Bearer <MARKET_IMPORT_SECRET>".
export async function POST(req: NextRequest) {
  const secret = process.env.MARKET_IMPORT_SECRET;
  const bearerOk = !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!bearerOk && !await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const tabs = body?.tabs;
  const valid = Array.isArray(tabs) && tabs.every((t: unknown) => {
    const x = t as { name?: unknown; grid?: unknown };
    return typeof x.name === "string" && Array.isArray(x.grid) && x.grid.every((r) => Array.isArray(r));
  });
  if (!valid) return NextResponse.json({ error: "Send { tabs: [{ name, grid }] } with every grid as rows of text." }, { status: 400 });

  const clean = (tabs as { name: string; grid: unknown[][] }[]).map((t) => ({ name: t.name, grid: t.grid.map((r) => r.map((c) => (c == null ? "" : String(c)))) }));
  try {
    return NextResponse.json({ ok: true, result: await ingest({ tabs: clean, trigger: bearerOk ? "agent" : "manual-import", dryRun: !!body.dryRun, sourceUrl: body.sourceUrl }) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 422 });
  }
}
