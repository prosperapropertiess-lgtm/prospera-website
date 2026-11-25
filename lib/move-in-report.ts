/**
 * Move-in report — what the owner and tenant see at /inspection/[token].
 * Each session has two links: owner_token (read-only) and tenant_token
 * (can add comments + photos until comments_close_at, 7 days after finish).
 *
 * Photo URLs are re-signed from their storage path on every load, so the
 * links on the page never expire the way the 1-year URLs saved on the rows do.
 */
import { getSupabaseAdmin } from "@/lib/supabase";

export const PHOTO_BUCKET = "tenant-inspection";
export const DOC_BUCKET = "move-in-documents";
export const COMMENT_WINDOW_DAYS = 7;
const VIEW_TTL = 60 * 60 * 24; // a day is plenty for one visit

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function reportUrls(session: { owner_token: string; tenant_token: string }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://www.prosperaproperties.co";
  return { owner: `${base}/inspection/${session.owner_token}`, tenant: `${base}/inspection/${session.tenant_token}` };
}

export interface ReportPhoto { url: string; path: string }
export interface ReportItem { id: string; label: string; condition: string; notes: string | null; repair_needed: boolean; photos: ReportPhoto[] }
export interface ReportRoom { id: string; name: string; photos: ReportPhoto[]; items: ReportItem[] }
export interface ReportComment { id: string; room_name: string | null; item_label: string | null; author_name: string | null; body: string; photos: ReportPhoto[]; created_at: string }

export interface MoveInReport {
  sessionId: string;
  campaignId: string;
  role: "owner" | "tenant";
  propertyAddress: string;
  ownerName: string | null;
  tenantNames: string[];
  inspectorName: string | null;
  moveInDate: string | null;
  finishedAt: string | null;
  commentsCloseAt: string | null;
  commentsOpen: boolean;
  rooms: ReportRoom[];
  appliances: { id: string; name: string; cosmetic_condition: string; test_status: string; photos: ReportPhoto[] }[];
  keys: { item_name: string; quantity: number }[];
  meterReadings: { utility: string; reading: string }[];
  signatures: { signer_name: string; signer_role: string; signed_at: string }[];
  pdfUrl: string | null;
  comments: ReportComment[];
  photoCount: number;
}

interface CoTenant { name?: string; first_name?: string; last_name?: string }

export async function findSessionByToken(token: string) {
  if (!UUID_RE.test(token)) return null;
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("move_in_sessions")
    .select("*")
    .or(`owner_token.eq.${token},tenant_token.eq.${token}`)
    .maybeSingle();
  if (!data || data.status !== "completed") return null;
  return { session: data, role: (data.tenant_token === token ? "tenant" : "owner") as "owner" | "tenant" };
}

export function commentsOpen(session: { comments_close_at: string | null }) {
  return !!session.comments_close_at && new Date(session.comments_close_at).getTime() > Date.now();
}

export async function loadMoveInReport(token: string): Promise<MoveInReport | null> {
  const found = await findSessionByToken(token);
  if (!found) return null;
  const { session, role } = found;
  const db = getSupabaseAdmin();

  const [{ data: campaign }, { data: application }, { data: rooms }, { data: appliances }, { data: keys }, { data: signatures }, { data: docs }, { data: comments }] = await Promise.all([
    db.from("leasing_properties").select("owner_name, property:properties(title, address, city)").eq("id", session.campaign_id).single(),
    session.application_id
      ? db.from("leasing_applications").select("legal_name, co_tenants").eq("id", session.application_id).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from("move_in_rooms").select("id, name, sort_order, photos, items:move_in_items(*)").eq("session_id", session.id).order("sort_order"),
    db.from("move_in_appliances").select("id, name, cosmetic_condition, test_status, photos").eq("session_id", session.id).order("sort_order"),
    db.from("move_in_keys").select("item_name, quantity").eq("session_id", session.id).order("created_at"),
    db.from("move_in_signatures").select("signer_name, signer_role, signed_at").eq("session_id", session.id).eq("report_version", session.report_version).order("signed_at"),
    db.from("move_in_documents").select("file_path, doc_type, report_version").eq("session_id", session.id).eq("doc_type", "inspection_report").order("created_at", { ascending: false }).limit(1),
    db.from("move_in_report_comments").select("*").eq("session_id", session.id).order("created_at"),
  ]);

  const property = Array.isArray(campaign?.property) ? campaign?.property[0] : campaign?.property;
  const tenantNames: string[] = [];
  if (application?.legal_name) tenantNames.push(application.legal_name);
  for (const c of (Array.isArray(application?.co_tenants) ? application.co_tenants : []) as CoTenant[]) {
    const n = c.name || [c.first_name, c.last_name].filter(Boolean).join(" ");
    if (n) tenantNames.push(n);
  }

  // Collect every photo path once, sign them all in one call.
  const paths = new Set<string>();
  const addPaths = (photos: unknown) => { for (const p of (Array.isArray(photos) ? photos : []) as ReportPhoto[]) if (p?.path) paths.add(p.path); };
  for (const r of rooms ?? []) { addPaths(r.photos); for (const it of r.items ?? []) addPaths(it.photos); }
  for (const a of appliances ?? []) addPaths(a.photos);
  for (const c of comments ?? []) addPaths(c.photos);

  const signed = new Map<string, string>();
  const pathList = [...paths];
  for (let i = 0; i < pathList.length; i += 500) {
    const { data } = await db.storage.from(PHOTO_BUCKET).createSignedUrls(pathList.slice(i, i + 500), VIEW_TTL);
    for (const s of data ?? []) if (s.path && s.signedUrl) signed.set(s.path, s.signedUrl);
  }
  const sign = (photos: unknown): ReportPhoto[] =>
    ((Array.isArray(photos) ? photos : []) as ReportPhoto[]).map((p) => ({ path: p.path, url: signed.get(p.path) ?? p.url })).filter((p) => p.url);

  let pdfUrl: string | null = null;
  const pdfPath = docs?.[0]?.file_path;
  if (pdfPath) {
    const { data } = await db.storage.from(DOC_BUCKET).createSignedUrl(pdfPath, VIEW_TTL);
    pdfUrl = data?.signedUrl ?? null;
  }

  const reportRooms: ReportRoom[] = (rooms ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    photos: sign(r.photos),
    items: (r.items ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((it: ReportItem) => ({ id: it.id, label: it.label, condition: it.condition, notes: it.notes, repair_needed: it.repair_needed, photos: sign(it.photos) })),
  })).filter((r) => r.items.length > 0 || r.photos.length > 0);

  const reportAppliances = (appliances ?? []).map((a) => ({ ...a, photos: sign(a.photos) }));
  const photoCount =
    reportRooms.reduce((n, r) => n + r.photos.length + r.items.reduce((m, it) => m + it.photos.length, 0), 0) +
    reportAppliances.reduce((n, a) => n + a.photos.length, 0);

  return {
    sessionId: session.id,
    campaignId: session.campaign_id,
    role,
    propertyAddress: property?.address || property?.title || "Property",
    ownerName: campaign?.owner_name ?? null,
    tenantNames,
    inspectorName: session.inspector_name,
    moveInDate: session.move_in_date,
    finishedAt: session.finished_at,
    commentsCloseAt: session.comments_close_at,
    commentsOpen: commentsOpen(session),
    rooms: reportRooms,
    appliances: reportAppliances,
    keys: keys ?? [],
    meterReadings: session.meter_readings ?? [],
    signatures: signatures ?? [],
    pdfUrl,
    comments: (comments ?? []).map((c) => ({ ...c, photos: sign(c.photos) })),
    photoCount,
  };
}
