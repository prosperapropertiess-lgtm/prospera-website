import { NextRequest, NextResponse } from "next/server";
import { accountByToken, db, event } from "@/lib/placements/core";
import { ownerPlacements, placementView } from "@/lib/placements/dashboard";
import { ownerApprove, ownerDecline, ownerAsk } from "@/lib/placements/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

// The owner's dashboard. Access = their private link; every query is scoped to their account.
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const acct = await accountByToken(token);
  if (!acct) return err("This link isn't active. Ask Prospera for a new one.", 404);
  const preview = req.nextUrl.searchParams.get("preview") === "1" && (await isAdminAuthenticated(req));
  const placements = await ownerPlacements(acct.id);
  const want = req.nextUrl.searchParams.get("placement") ?? placements[0]?.id;
  const view = want ? await placementView(want, acct.id) : null;
  if (!preview) await db().from("client_accounts").update({ last_seen_at: new Date().toISOString() }).eq("id", acct.id);
  return NextResponse.json({ account: { name: acct.name, introSeen: !!acct.intro_seen_at, isDemo: acct.is_demo }, placements, view, preview });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const acct = await accountByToken(token);
  if (!acct) return err("This link isn't active.", 404);
  const b = await req.json().catch(() => ({}));
  if (b.preview) return err("This is a preview. Owners make decisions from their own link.", 403);
  try {
    switch (b.action) {
      case "intro_seen":
        await db().from("client_accounts").update({ intro_seen_at: new Date().toISOString() }).eq("id", acct.id);
        break;
      case "approve": await ownerApprove(String(b.reviewId), acct.id, acct.name); break;
      case "decline": await ownerDecline(String(b.reviewId), acct.id, acct.name, String(b.reason ?? ""), String(b.comments ?? "").slice(0, 2000)); break;
      case "ask": await ownerAsk(String(b.reviewId), acct.id, acct.name, String(b.body ?? "")); break;
      case "viewed": {
        const { data: pl } = await db().from("placements").select("id").eq("id", String(b.placementId)).eq("account_id", acct.id).maybeSingle();
        if (pl) await event(pl.id, "owner_viewed", `owner:${acct.name}`);
        break;
      }
      default: return err("Unknown action");
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
}
