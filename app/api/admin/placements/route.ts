import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db, computeStage, STAGES, dashboardUrl } from "@/lib/placements/core";
import { createPlacement, sendWelcome } from "@/lib/placements/onboarding";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await db().from("placements").select("*, client_accounts(id, name, email, token, last_seen_at, revoked_at, is_demo)").order("created_at", { ascending: false });
  const rows = await Promise.all((data ?? []).map(async (p) => {
    const stage = await computeStage(p);
    const { count: pending } = await db().from("placement_reviews").select("id", { count: "exact", head: true }).eq("placement_id", p.id).in("status", ["released", "clarification"]);
    const a = p.client_accounts as unknown as { name: string; email: string | null; token: string; last_seen_at: string | null; revoked_at: string | null };
    return { id: p.id, address: p.address, city: p.city, status: p.status, is_demo: p.is_demo, stage, stageLabel: STAGES.find((s) => s.key === stage)?.label, owner: a?.name, email: a?.email, lastSeen: a?.last_seen_at, welcome: p.welcome_sent_at, waitingOnOwner: pending ?? 0, link: a ? dashboardUrl(a.token, p.id) : null, next_action: p.next_action };
  }));
  const { data: props } = await db().from("properties").select("id, address, city, price, available_date").eq("is_managed", true).order("created_at", { ascending: false }).limit(60);
  return NextResponse.json({ placements: rows, properties: props ?? [] });
}

// Add a client and property, record the signed agreement, create the dashboard, and (optionally) send the welcome.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim(), address = String(b.address ?? "").trim();
  if (!name || !address) return NextResponse.json({ error: "Owner name and property address are required." }, { status: 400 });
  if (!b.demo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email ?? ""))) return NextResponse.json({ error: "Enter the owner's email." }, { status: 400 });
  try {
    const r = await createPlacement({
      name, email: b.email || null, phone: b.phone || null, address, city: b.city || null, propertyId: b.property_id || null,
      askingRent: b.asking_rent ? Number(b.asking_rent) : null, targetDate: b.target_date || null,
      agreementSignedAt: b.signed_at ? new Date(b.signed_at).toISOString() : new Date().toISOString(), isDemo: !!b.demo, actor: "admin",
    });
    let welcome: string | null = null;
    if (b.send_welcome && !b.demo) welcome = await sendWelcome(r.placementId, "admin").catch((e) => `failed: ${e instanceof Error ? e.message : e}`);
    return NextResponse.json({ ok: true, ...r, welcome });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
