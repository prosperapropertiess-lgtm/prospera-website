// Keeps the owner's placement dashboard in step with the rest of the system:
// the listing (property wizard), the application pipeline, and FieldOps.
// Everything here is best effort: a dashboard sync never blocks the main action.
import { db, event, sendLogged, dashboardUrl, NEXT_STEPS, SITE } from "./core";
import { shell, p, h1, button, esc } from "@/lib/application-emails";

/** The active placement for a listing, if one exists. */
export async function placementForProperty(propertyId: string) {
  const { data } = await db().from("placements").select("id, account_id, property_id, is_demo").eq("property_id", propertyId).in("status", ["active", "paused"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data as null | { id: string; account_id: string; property_id: string; is_demo: boolean };
}

/** A listing was created or published: link it to the owner's placement and fill in what it proves. */
export async function syncFromProperty(propertyId: string) {
  try {
    const { data: prop } = await db().from("properties").select("id, slug, address, city, status, published_at, images, floor_plan_url, price, available_date").eq("id", propertyId).maybeSingle();
    if (!prop) return;
    let pl = await placementForProperty(propertyId);
    if (!pl) {
      // Signed through onboarding before the listing existed: match on the onboarding session, then the street address.
      const { data: sess } = await db().from("onboarding_sessions").select("id").eq("property_id", propertyId).limit(1).maybeSingle();
      const street = String(prop.address ?? "").toLowerCase().split(",")[0].trim();
      const { data: cand } = await db().from("placements").select("id, account_id, property_id, is_demo, onboarding_session_id, address").is("property_id", null).in("status", ["active", "paused"]);
      const match = (cand ?? []).find((c) => (sess && c.onboarding_session_id === sess.id) || (street.length > 5 && String(c.address).toLowerCase().startsWith(street)));
      if (!match) return;
      await db().from("placements").update({ property_id: propertyId, updated_at: new Date().toISOString() }).eq("id", match.id);
      await event(match.id, "listing_linked", "system", { property_id: propertyId });
      pl = { id: match.id, account_id: match.account_id, property_id: propertyId, is_demo: match.is_demo };
    }
    const { data: cur } = await db().from("placements").select("asking_rent, target_date, cover_url").eq("id", pl.id).single();
    const images = (prop.images as string[] | null) ?? [];
    await db().from("placements").update({
      asking_rent: cur?.asking_rent ?? prop.price, target_date: cur?.target_date ?? prop.available_date,
      cover_url: cur?.cover_url ?? images[0] ?? null, updated_at: new Date().toISOString(),
    }).eq("id", pl.id);

    const { data: prep } = await db().from("placement_prep").select("item, status, links").eq("placement_id", pl.id);
    const status = (k: string) => (prep ?? []).find((r) => r.item === k)?.status;
    const today = new Date().toISOString().slice(0, 10);

    // Listing photos become the owner's photo gallery (once each).
    if (images.length) {
      const { data: have } = await db().from("placement_files").select("url").eq("placement_id", pl.id).eq("kind", "photo");
      const known = new Set((have ?? []).map((h) => h.url));
      const add = images.filter((u) => !known.has(u)).map((url, i) => ({ placement_id: pl!.id, kind: "photo", title: `Listing photo ${i + 1}`, url, client_visible: true }));
      if (add.length) await db().from("placement_files").insert(add);
      if (status("photos") !== "completed" && status("photos") !== "not_applicable") await db().from("placement_prep").upsert({ placement_id: pl.id, item: "photos", status: "completed", completed_on: today, updated_at: new Date().toISOString() }, { onConflict: "placement_id,item" });
    }
    if (prop.floor_plan_url) {
      const { data: fp } = await db().from("placement_files").select("id").eq("placement_id", pl.id).eq("url", prop.floor_plan_url).maybeSingle();
      if (!fp) await db().from("placement_files").insert({ placement_id: pl.id, kind: "floor_plan", title: "Floor plan", url: prop.floor_plan_url, client_visible: true });
      if (status("floor_plan") !== "completed") await db().from("placement_prep").upsert({ placement_id: pl.id, item: "floor_plan", status: "completed", completed_on: today, updated_at: new Date().toISOString() }, { onConflict: "placement_id,item" });
    }
    if (prop.status === "published") {
      const listing = `${SITE}/listings/${prop.slug ?? prop.id}`;
      const brief = `${SITE}/brief/${prop.slug ?? prop.id}`;
      const existing = ((prep ?? []).find((r) => r.item === "listing")?.links ?? []) as { label: string; url: string }[];
      const links = [...existing.filter((l) => l.url !== listing && l.url !== brief), { label: "Your listing on our website", url: listing }, { label: "Property brief (what renters get)", url: brief }];
      await db().from("placement_prep").upsert({
        placement_id: pl.id, item: "listing", status: "completed",
        completed_on: (prop.published_at ?? new Date().toISOString()).slice(0, 10), links, updated_at: new Date().toISOString(),
      }, { onConflict: "placement_id,item" });
      await event(pl.id, "listing_published", "system", { url: listing });
    }
  } catch (e) {
    console.error("[placements] syncFromProperty failed:", e);
  }
}

/** Tell the owner an application is waiting on their dashboard. */
export async function emailOwnerReviewReady(placementId: string, applicant: string) {
  const { data: pl } = await db().from("placements").select("id, address, is_demo, client_accounts(token, name, email)").eq("id", placementId).single();
  const a = pl?.client_accounts as unknown as { token: string; name: string; email: string | null } | null;
  if (!pl || !a?.email || pl.is_demo) return "skipped";
  const html = shell("YOUR DECISION NEEDED", `
${h1(`An applicant for ${esc(pl.address)}`)}
${p(`Hi ${esc(a.name.split(" ")[0])}, we've screened an application from <b>${esc(applicant)}</b> and it's ready for you on your dashboard.`)}
${p(`Open it to see what's verified, what's still to check, and our recommendation. Then choose <b>Approve to Proceed</b>, <b>Decline</b>, or ask us a question.`)}
${button("Review the application", `${dashboardUrl(a.token, pl.id)}#applications`)}
${p(`Ebin<br>Prospera Properties`, "0 36px 26px")}
`);
  return sendLogged({ placementId, kind: "review_ready", to: a.email, subject: `Your decision needed: applicant for ${pl.address}`, html, key: `review-ready:${placementId}:${applicant}` });
}

/** The placement review that mirrors an application, if it was released to a dashboard. */
async function reviewFor(applicationId: string) {
  const { data } = await db().from("placement_reviews").select("id, placement_id, status").eq("application_id", applicationId).order("released_at", { ascending: false }).limit(1).maybeSingle();
  return data as null | { id: string; placement_id: string; status: string };
}

async function ensureSteps(reviewId: string) {
  await db().from("placement_steps").upsert(NEXT_STEPS.map((s) => ({ review_id: reviewId, step_no: s.no, title: s.title, responsible: s.responsible, status: "pending" })), { onConflict: "review_id,step_no", ignoreDuplicates: true });
}

async function setStep(reviewId: string, stepNo: number, status: "in_progress" | "done") {
  const { data: s } = await db().from("placement_steps").select("id, status").eq("review_id", reviewId).eq("step_no", stepNo).maybeSingle();
  if (!s || s.status === "done") return;
  await db().from("placement_steps").update({ status, completed_at: status === "done" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", s.id);
}

/**
 * The application pipeline moved: mirror it on the owner's timeline.
 * Only events Admin actually confirmed: nothing is assumed done.
 */
export async function syncApplication(applicationId: string, what: "owner_approved" | "owner_declined" | "rent_requested" | "rent_received" | "screened" | "move_in" | "declined" | "lease_signed") {
  try {
    const r = await reviewFor(applicationId);
    if (!r) return;
    const now = new Date().toISOString();
    if (what === "owner_approved" && ["released", "clarification"].includes(r.status)) {
      await db().from("placement_reviews").update({ status: "approved", decided_at: now, decided_by: "Owner (recorded by Ebin)", updated_at: now }).eq("id", r.id);
    }
    if (what === "owner_declined" || what === "declined") {
      if (["released", "clarification", "approved"].includes(r.status)) await db().from("placement_reviews").update({ status: what === "declined" ? "paused" : "declined", outcome_note: what === "declined" ? "Declined after review" : null, updated_at: now }).eq("id", r.id);
      await event(r.placement_id, `application_${what}`, "system", { application_id: applicationId });
      return;
    }
    await ensureSteps(r.id);
    if (what === "owner_approved" || what === "rent_requested" || what === "rent_received") await setStep(r.id, 1, "in_progress");
    if (what === "rent_requested") await setStep(r.id, 4, "in_progress");
    if (what === "rent_received") await setStep(r.id, 4, "done");
    if (what === "screened") await setStep(r.id, 1, "done");
    if (what === "move_in") { await setStep(r.id, 1, "done"); await setStep(r.id, 2, "done"); await setStep(r.id, 3, "in_progress"); }
    if (what === "lease_signed") { await setStep(r.id, 2, "done"); await setStep(r.id, 3, "done"); }
    await event(r.placement_id, `application_${what}`, "system", { application_id: applicationId });
  } catch (e) {
    console.error("[placements] syncApplication failed:", e);
  }
}
