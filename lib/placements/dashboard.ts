// What an owner sees for one placement. Only client-visible files, only
// released applications, only published weekly updates. Never internal notes.
import { db, computeStage, PREP_ITEMS, STAGES } from "./core";

const BUCKET = "placement-files";

async function signed(paths: string[]) {
  if (!paths.length) return {} as Record<string, string>;
  const { data } = await db().storage.from(BUCKET).createSignedUrls(paths, 3600);
  return Object.fromEntries((data ?? []).filter((d) => d.path && d.signedUrl).map((d) => [d.path!, d.signedUrl]));
}

export async function ownerPlacements(accountId: string) {
  const { data } = await db().from("placements").select("id, address, city, cover_url, status, is_demo").eq("account_id", accountId).neq("status", "cancelled").order("created_at");
  return (data ?? []) as { id: string; address: string; city: string | null; cover_url: string | null; status: string; is_demo: boolean }[];
}

export async function placementView(placementId: string, accountId: string | null, opts: { admin?: boolean } = {}) {
  let q = db().from("placements").select("*").eq("id", placementId);
  if (accountId) q = q.eq("account_id", accountId);
  const { data: pl } = await q.maybeSingle();
  if (!pl) return null;

  const [{ data: prep }, { data: files }, { data: metrics }, { data: updates }, { data: reviews }, stage] = await Promise.all([
    db().from("placement_prep").select("*").eq("placement_id", pl.id),
    (opts.admin ? db().from("placement_files").select("*").eq("placement_id", pl.id) : db().from("placement_files").select("*").eq("placement_id", pl.id).eq("client_visible", true)).order("created_at"),
    db().from("placement_metrics").select("*").eq("placement_id", pl.id).order("week_start", { ascending: false }),
    (opts.admin ? db().from("placement_updates").select("*").eq("placement_id", pl.id) : db().from("placement_updates").select("*").eq("placement_id", pl.id).eq("status", "published")).order("week_start", { ascending: false }),
    db().from("placement_reviews").select("*").eq("placement_id", pl.id).order("released_at", { ascending: false }),
    computeStage(pl),
  ]);

  const reviewIds = (reviews ?? []).map((r) => r.id);
  const [{ data: steps }, { data: messages }] = await Promise.all([
    reviewIds.length ? db().from("placement_steps").select("*").in("review_id", reviewIds).order("step_no") : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    reviewIds.length ? db().from("placement_messages").select("*").eq("placement_id", pl.id).order("created_at") : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);

  const urls = await signed((files ?? []).map((f) => f.storage_path).filter(Boolean) as string[]);
  const fileOut = (files ?? []).map((f) => ({ id: f.id, kind: f.kind, title: f.title, client_visible: f.client_visible, created_at: f.created_at, url: f.storage_path ? urls[f.storage_path] ?? null : f.url }));

  const latest = [pl.updated_at, ...(prep ?? []).map((r) => r.updated_at), ...(updates ?? []).map((u) => u.published_at ?? u.updated_at), ...(metrics ?? []).map((m) => m.updated_at), ...(reviews ?? []).map((r) => r.updated_at)]
    .filter(Boolean).sort().pop();

  // A cover picked from uploaded photos is stored as "file:<id>" and signed fresh each time.
  const coverFile = typeof pl.cover_url === "string" && pl.cover_url.startsWith("file:") ? (files ?? []).find((f) => f.id === pl.cover_url.slice(5)) : null;
  const cover = coverFile?.storage_path ? urls[coverFile.storage_path] ?? (await signed([coverFile.storage_path]))[coverFile.storage_path] ?? null : pl.cover_url?.startsWith("file:") ? null : pl.cover_url;

  return {
    placement: {
      id: pl.id, address: pl.address, city: pl.city, cover_url: cover, asking_rent: pl.asking_rent, target_date: pl.target_date,
      status: pl.status, is_demo: pl.is_demo, next_action: pl.next_action, next_action_owner: pl.next_action_owner, next_action_due: pl.next_action_due,
      agreement_signed_at: pl.agreement_signed_at, property_id: pl.property_id, completed_at: pl.completed_at, stage_override: pl.stage_override,
      welcome_sent_at: pl.welcome_sent_at, account_id: pl.account_id,
    },
    stage,
    stageIndex: STAGES.findIndex((s) => s.key === stage),
    latestUpdate: latest ?? null,
    prep: PREP_ITEMS.map((i) => {
      const r = (prep ?? []).find((x) => x.item === i.key);
      return { key: i.key, label: i.label, status: r?.status ?? "not_started", completed_on: r?.completed_on ?? null, notes: r?.notes ?? null, links: r?.links ?? [], files: fileOut.filter((f) => i.fileKind && f.kind === i.fileKind) };
    }),
    files: fileOut,
    metrics: metrics ?? [],
    updates: updates ?? [],
    reviews: (reviews ?? []).map((r) => ({
      ...r,
      // Admin-only notes on the decision stay internal; owners see their own decision and reason.
      steps: (steps ?? []).filter((s) => s.review_id === r.id).map((s) => ({ ...s, files: fileOut.filter((f) => ((s.file_ids as string[]) ?? []).includes(f.id)) })),
      messages: (messages ?? []).filter((m) => m.review_id === r.id),
    })),
  };
}

export type PlacementView = NonNullable<Awaited<ReturnType<typeof placementView>>>;
