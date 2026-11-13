import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db, dashboardUrl, weekOf } from "@/lib/placements/core";
import { placementView } from "@/lib/placements/dashboard";
import { sendWelcome } from "@/lib/placements/onboarding";
import {
  updatePlacement, updatePrep, uploadFile, saveMetrics, recordedWeek, draftUpdate, saveUpdate, publishUpdate,
  releaseApplication, updateReview, updateStep, adminReply, regenerateLink, setAccess, retryEmail,
} from "@/lib/placements/actions";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) return err("Unauthorized", 401);
  const { id } = await params;
  const view = await placementView(id, null, { admin: true });
  if (!view) return err("Not found", 404);
  const week = req.nextUrl.searchParams.get("week") ? { start: req.nextUrl.searchParams.get("week")!, end: new Date(new Date(`${req.nextUrl.searchParams.get("week")}T12:00:00Z`).getTime() + 6 * 864e5).toISOString().slice(0, 10) } : weekOf();
  const [{ data: acct }, { data: emails }, { data: events }, { data: apps }, recorded] = await Promise.all([
    db().from("client_accounts").select("id, name, email, phone, token, last_seen_at, revoked_at, is_demo, intro_seen_at").eq("id", view.placement.account_id).single(),
    db().from("placement_emails").select("id, kind, recipient, subject, status, error, attempts, sent_at, created_at").eq("placement_id", id).order("created_at", { ascending: false }).limit(50),
    db().from("placement_events").select("kind, actor, detail, created_at").eq("placement_id", id).order("created_at", { ascending: false }).limit(100),
    view.placement.property_id
      ? db().from("applications").select("id, tenant_name, created_at, ai_score, ai_summary, stage, status").eq("property_id", view.placement.property_id).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    recordedWeek(view.placement.property_id, week.start, week.end),
  ]);
  const { data: listings } = await db().from("properties").select("id, address, status").eq("is_managed", true).order("created_at", { ascending: false }).limit(80);
  return NextResponse.json({ ...view, account: acct, link: acct ? dashboardUrl(acct.token, id) : null, emails: emails ?? [], events: events ?? [], applications: apps ?? [], week, recorded, listings: listings ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) return err("Unauthorized", 401);
  const { id } = await params;
  try {
    if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const fd = await req.formData();
      const files = fd.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
      if (!files.length) return err("Pick a file.");
      const ids = [];
      for (const f of files) ids.push(await uploadFile(id, String(fd.get("kind") ?? "document"), String(fd.get("title") ?? "") || f.name, f, fd.get("visible") === "true"));
      return NextResponse.json({ ok: true, ids });
    }
    const b = await req.json();
    let out: unknown = null;
    switch (b.action) {
      case "update": await updatePlacement(id, b.patch ?? {}); break;
      case "prep": await updatePrep(id, b.item, b.patch ?? {}); break;
      case "file_visible": await db().from("placement_files").update({ client_visible: !!b.visible }).eq("id", b.fileId).eq("placement_id", id); break;
      case "file_delete": {
        const { data: f } = await db().from("placement_files").select("storage_path").eq("id", b.fileId).eq("placement_id", id).single();
        if (f?.storage_path) await db().storage.from("placement-files").remove([f.storage_path]);
        await db().from("placement_files").delete().eq("id", b.fileId).eq("placement_id", id);
        break;
      }
      case "metrics": await saveMetrics(id, b.week, b.values ?? {}, b.notes ?? null); break;
      case "draft_update": out = await draftUpdate(id, b.week); break;
      case "save_update": out = { id: await saveUpdate(id, b.update) }; break;
      case "publish_update": out = { email: await publishUpdate(String(b.updateId)) }; break;
      case "release": out = { reviewId: await releaseApplication(id, String(b.applicationId)) }; break;
      case "review": await updateReview(String(b.reviewId), b.patch ?? {}); break;
      case "reply": await adminReply(String(b.reviewId), String(b.body ?? "")); break;
      case "step": await updateStep(String(b.stepId), b.patch ?? {}); break;
      case "regenerate_link": await regenerateLink(String(b.accountId)); break;
      case "access": await setAccess(String(b.accountId), !!b.on); break;
      case "send_welcome": out = { status: await sendWelcome(id, "admin") }; break;
      case "retry_email": out = { status: await retryEmail(String(b.emailId)) }; break;
      default: return err("Unknown action");
    }
    return NextResponse.json({ ok: true, ...(out && typeof out === "object" ? out : {}) });
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e), 500);
  }
}
