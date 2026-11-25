/**
 * Tenant comments on a finished move-in report. Only the tenant link can
 * post, only until comments_close_at (7 days after finish). Each comment
 * can carry up to 5 photos. Ebin gets an email for every one.
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { findSessionByToken, commentsOpen, PHOTO_BUCKET } from "@/lib/move-in-report";

const MAX_PHOTOS = 5;
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_COMMENTS = 60;
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findSessionByToken(token);
  if (!found || found.role !== "tenant") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { session } = found;
  if (!commentsOpen(session)) return NextResponse.json({ error: "The comment window for this report has closed." }, { status: 403 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  const body = String(form.get("body") ?? "").trim().slice(0, 4000);
  const authorName = String(form.get("authorName") ?? "").trim().slice(0, 120) || null;
  const itemId = String(form.get("itemId") ?? "").trim() || null;
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_PHOTOS);
  if (!body) return NextResponse.json({ error: "Write what you noticed first." }, { status: 400 });
  for (const f of files) {
    if (!f.type.startsWith("image/")) return NextResponse.json({ error: "Photos only, please." }, { status: 400 });
    if (f.size > MAX_BYTES) return NextResponse.json({ error: "One of those photos is too large (15 MB max)." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { count } = await db.from("move_in_report_comments").select("id", { count: "exact", head: true }).eq("session_id", session.id);
  if ((count ?? 0) >= MAX_COMMENTS) return NextResponse.json({ error: "This report has reached its comment limit. Call or text (519) 697-1227." }, { status: 429 });

  // The item must belong to this session — never trust the id from the form alone.
  let roomName: string | null = null;
  let itemLabel: string | null = null;
  if (itemId) {
    const { data: item } = await db.from("move_in_items").select("label, room:move_in_rooms!inner(name, session_id)").eq("id", itemId).maybeSingle();
    const room = Array.isArray(item?.room) ? item?.room[0] : item?.room;
    if (!item || room?.session_id !== session.id) return NextResponse.json({ error: "Pick a part of the home from the list." }, { status: 400 });
    roomName = room?.name ?? null;
    itemLabel = item.label;
  }

  const photos: { url: string; path: string }[] = [];
  for (const f of files) {
    const ext = (f.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
    const path = `${session.campaign_id}/tenant-comments/${session.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await db.storage.from(PHOTO_BUCKET).upload(path, await f.arrayBuffer(), { contentType: f.type, upsert: false });
    if (error) return NextResponse.json({ error: `Photo upload failed: ${error.message}` }, { status: 500 });
    const { data: signed } = await db.storage.from(PHOTO_BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
    photos.push({ url: signed?.signedUrl ?? "", path });
  }

  const { data: comment, error } = await db
    .from("move_in_report_comments")
    .insert({ session_id: session.id, item_id: itemId, room_name: roomName, item_label: itemLabel, author_name: authorName, body, photos })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Heads-up to the office. A failed email never fails the tenant's save.
  try {
    const { data: campaign } = await db.from("leasing_properties").select("property:properties(address, title)").eq("id", session.campaign_id).single();
    const property = Array.isArray(campaign?.property) ? campaign?.property[0] : campaign?.property;
    const address = property?.address || property?.title || "a property";
    const where = [roomName, itemLabel].filter(Boolean).join(" — ") || "General";
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: "prosperapropertiess@gmail.com",
      subject: `Tenant added a move-in comment — ${address}`,
      html: `<p><strong>${esc(authorName || "The tenant")}</strong> added a comment to the move-in report for ${esc(address)}.</p>
<p><strong>${esc(where)}</strong><br>${esc(body).replace(/\n/g, "<br>")}</p>
<p>${photos.length} photo${photos.length === 1 ? "" : "s"} attached. See it on the report: ${process.env.NEXT_PUBLIC_BASE_URL || "https://www.prosperaproperties.co"}/inspection/${session.owner_token}</p>`,
    });
  } catch (err) {
    console.error("move-in comment email failed", err);
  }

  return NextResponse.json(comment);
}
