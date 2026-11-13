// End-to-end check that the pieces talk to each other, against the live database.
// Uses a DEMO placement (no owner emails) and throwaway test rows, then removes them.
//
//   npx tsx --env-file=.env.local scripts/test-connections.ts
import { getSupabaseAdmin } from "@/lib/supabase";
import { syncFromProperty, syncApplication, placementForProperty } from "@/lib/placements/sync";
import { releaseApplication, ownerApprove } from "@/lib/placements/actions";
import { computeStage } from "@/lib/placements/core";

const db = getSupabaseAdmin();
const PROPERTY = "a7ec9a46-228e-482c-9a39-1d39a3291839"; // a published listing
let failures = 0;
const check = (ok: boolean, msg: string) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) failures++; };

async function main() {
  const { data: prop } = await db.from("properties").select("address, images, status").eq("id", PROPERTY).single();
  const { data: agent } = await db.from("agents").select("id").eq("is_active", true).neq("role", "specialist").limit(1).single();

  // A demo owner + placement signed before the listing was linked.
  const { data: acct } = await db.from("client_accounts").insert({ token: `zz-conn-${Date.now()}-abcdefghijkl`, name: "ZZ Connection Test", is_demo: true }).select("id").single();
  const { data: pl } = await db.from("placements").insert({ account_id: acct!.id, address: prop!.address, city: "London", is_demo: true, agreement_signed_at: new Date().toISOString() }).select("id").single();
  await db.from("placement_prep").insert(["walkthrough", "photos", "lawn_sign", "floor_plan", "listing"].map((item) => ({ placement_id: pl!.id, item })));
  const appIds: string[] = [];
  try {
    // 1. Listing → dashboard (the other demo placement for this listing is detached for the test).
    const other = await placementForProperty(PROPERTY);
    if (other) await db.from("placements").update({ property_id: null }).eq("id", other.id);
    await syncFromProperty(PROPERTY);
    const { data: linked } = await db.from("placements").select("property_id, cover_url").eq("id", pl!.id).single();
    check(linked?.property_id === PROPERTY, "publishing links the listing to the owner's placement by address");
    const { data: prep } = await db.from("placement_prep").select("item, status, links").eq("placement_id", pl!.id);
    check(prep?.find((r) => r.item === "listing")?.status === "completed", "listing marked published on the dashboard");
    check(((prep?.find((r) => r.item === "listing")?.links ?? []) as { url: string }[]).some((l) => l.url.includes("/brief/")), "property brief link added to the dashboard");
    const { count: photos } = await db.from("placement_files").select("id", { count: "exact", head: true }).eq("placement_id", pl!.id).eq("kind", "photo").eq("client_visible", true);
    check((photos ?? 0) === ((prop!.images as string[]) ?? []).length && (photos ?? 0) > 0, `listing photos in the owner's gallery (${photos})`);
    await syncFromProperty(PROPERTY);
    const { count: again } = await db.from("placement_files").select("id", { count: "exact", head: true }).eq("placement_id", pl!.id).eq("kind", "photo");
    check(again === photos, "re-syncing doesn't duplicate photos");
    check(await computeStage({ id: pl!.id, property_id: PROPERTY, agreement_signed_at: new Date().toISOString(), completed_at: null, stage_override: null }) === "marketing", "stage moves to Marketing once the listing is published");

    // 2. Application → released to owner → owner approves → pipeline mirrors on the timeline.
    const { data: app } = await db.from("applications").insert({
      agent_id: agent!.id, property_id: PROPERTY, tenant_name: "ZZ Connection Applicant", tenant_email: "zz-conn-test@example.invalid", tenant_phone: "5195550000",
      monthly_rent: 1495, monthly_income: 5400, status: "reviewed", stage: "review", move_in_date: "2026-12-01", occupants: 2,
      ai_summary: { verdict: "worth_a_call", score: 7, headline: "Test", owner_summary: "Test summary.", checks: [{ topic: "Photo ID", status: "verified", detail: "Matches" }, { topic: "Income", status: "claimed_only", detail: "States $5,400" }], questions_to_ask: [] },
    }).select("id").single();
    appIds.push(app!.id);
    const reviewId = await releaseApplication(pl!.id, app!.id);
    const { data: rv } = await db.from("placement_reviews").select("status, verified, preliminary, outstanding_checks").eq("id", reviewId).single();
    check(rv?.status === "released" && (rv.verified as unknown[]).length === 1 && (rv.preliminary as unknown[]).length === 1, "release splits verified and preliminary details from the AI review");
    const { data: a1 } = await db.from("applications").select("stage").eq("id", app!.id).single();
    check(a1?.stage === "sent_to_owner", "application pipeline shows Sent to owner");
    let dupBlocked = false;
    try { await releaseApplication(pl!.id, app!.id); } catch { dupBlocked = true; }
    check(dupBlocked, "the same application can't be released twice");

    await ownerApprove(reviewId, acct!.id, "ZZ Connection Test");
    const { data: a2 } = await db.from("applications").select("stage").eq("id", app!.id).single();
    check(a2?.stage === "owner_approved", "owner's Approve to Proceed moves the application pipeline to Owner approved");
    const steps = async () => (await db.from("placement_steps").select("step_no, status").eq("review_id", reviewId).order("step_no")).data ?? [];
    let s = await steps();
    check(s.length === 8 && s.every((x) => x.status === "pending"), "approval creates 8 steps and marks none of them done");
    check(await computeStage({ id: pl!.id, property_id: PROPERTY, agreement_signed_at: new Date().toISOString(), completed_at: null, stage_override: null }) === "verification", "stage moves to Verification after approval");

    await syncApplication(app!.id, "rent_requested");
    s = await steps();
    check(s.find((x) => x.step_no === 4)?.status === "in_progress", "rent request shows payments in progress");
    await syncApplication(app!.id, "rent_received");
    await syncApplication(app!.id, "screened");
    s = await steps();
    check(s.find((x) => x.step_no === 4)?.status === "done" && s.find((x) => x.step_no === 1)?.status === "done", "rent received and SingleKey mark payments and verification done");
    await syncApplication(app!.id, "move_in");
    s = await steps();
    check(s.find((x) => x.step_no === 2)?.status === "done" && s.find((x) => x.step_no === 3)?.status === "in_progress", "start move-in marks final approval done, lease in progress");
    check(await computeStage({ id: pl!.id, property_id: PROPERTY, agreement_signed_at: new Date().toISOString(), completed_at: null, stage_override: null }) === "lease_move_in", "stage moves to Lease & Move-In");
    await syncApplication(app!.id, "lease_signed");
    s = await steps();
    check(s.find((x) => x.step_no === 3)?.status === "done", "lease signed (FieldOps) marks the lease step done");
    check(s.filter((x) => x.step_no >= 5).every((x) => x.status === "pending"), "move-in, inspection and keys stay for Admin to confirm");

    if (other) await db.from("placements").update({ property_id: PROPERTY }).eq("id", other.id);
  } finally {
    for (const id of appIds) await db.from("applications").delete().eq("id", id);
    await db.from("placements").delete().eq("id", pl!.id);
    await db.from("client_accounts").delete().eq("id", acct!.id);
    const { data: still } = await db.from("placements").select("id").eq("property_id", PROPERTY).eq("is_demo", true);
    console.log(`cleanup done (${still?.length ?? 0} demo placement left on this listing: the one for you to try)`);
  }
  console.log(failures ? `\n${failures} FAILED` : "\nAll connections work.");
  process.exit(failures ? 1 : 0);
}
main();
