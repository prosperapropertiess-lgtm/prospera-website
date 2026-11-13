// Creating a client's dashboard when their placement agreement is signed,
// then (only once it exists and opens) sending the welcome email.
import { db, newToken, dashboardUrl, event, sendLogged, PREP_ITEMS, ADMIN_EMAIL } from "./core";
import { welcomeEmail } from "./emails";

export interface NewPlacement {
  name: string;
  email: string | null;
  phone?: string | null;
  address: string;
  city?: string | null;
  propertyId?: string | null;
  onboardingSessionId?: string | null;
  askingRent?: number | null;
  targetDate?: string | null;
  agreementSignedAt?: string | null;
  isDemo?: boolean;
  actor: string;
}

/** One account per owner email (one private link), one placement per property. Safe to call twice. */
export async function createPlacement(n: NewPlacement) {
  if (n.onboardingSessionId) {
    const { data: existing } = await db().from("placements").select("id, account_id").eq("onboarding_session_id", n.onboardingSessionId).maybeSingle();
    if (existing) return { placementId: existing.id as string, accountId: existing.account_id as string, created: false };
  }

  let accountId: string | null = null;
  if (n.email && !n.isDemo) {
    const { data: acct } = await db().from("client_accounts").select("id").ilike("email", n.email.trim()).eq("is_demo", false).maybeSingle();
    accountId = acct?.id ?? null;
  }
  if (!accountId) {
    const { data: acct, error } = await db().from("client_accounts").insert({
      token: newToken(), name: n.name.trim(), email: n.email?.trim().toLowerCase() || null, phone: n.phone ?? null, is_demo: !!n.isDemo,
    }).select("id").single();
    if (error || !acct) throw new Error(`Couldn't create the client account: ${error?.message}`);
    accountId = acct.id;
  }

  // Pull what we already know about the home from the property record, if there is one.
  let cover: string | null = null, rent = n.askingRent ?? null, target = n.targetDate ?? null, city = n.city ?? null;
  if (n.propertyId) {
    const { data: prop } = await db().from("properties").select("images, price, available_date, city").eq("id", n.propertyId).maybeSingle();
    cover = (prop?.images as string[] | null)?.[0] ?? null;
    rent = rent ?? (prop?.price ? Number(prop.price) : null);
    target = target ?? prop?.available_date ?? null;
    city = city ?? prop?.city ?? null;
  }

  const { data: pl, error } = await db().from("placements").insert({
    account_id: accountId, property_id: n.propertyId ?? null, onboarding_session_id: n.onboardingSessionId ?? null,
    address: n.address.trim(), city, cover_url: cover, asking_rent: rent, target_date: target,
    agreement_signed_at: n.agreementSignedAt ?? new Date().toISOString(), is_demo: !!n.isDemo,
    next_action: "Book the property walkthrough and photos", next_action_owner: "Prospera",
  }).select("id").single();
  if (error || !pl) throw new Error(`Couldn't create the placement: ${error?.message}`);

  await db().from("placement_prep").insert(PREP_ITEMS.map((i) => ({ placement_id: pl.id, item: i.key })));
  await event(pl.id, "created", n.actor, { agreement_signed_at: n.agreementSignedAt ?? null });
  return { placementId: pl.id as string, accountId: accountId!, created: true };
}

/** Sends the welcome only after checking the dashboard really opens, and only once per placement. */
export async function sendWelcome(placementId: string, actor: string) {
  const { data: pl } = await db().from("placements").select("id, address, account_id, welcome_sent_at, client_accounts(token, name, email, is_demo, revoked_at)").eq("id", placementId).single();
  const acct = pl?.client_accounts as unknown as { token: string; name: string; email: string | null; is_demo: boolean; revoked_at: string | null } | null;
  if (!pl || !acct) throw new Error("Placement not found");
  if (!acct.email) throw new Error("No owner email on file.");
  if (acct.revoked_at) throw new Error("This owner's access is turned off.");

  const url = dashboardUrl(acct.token, placementId);
  const check = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!check?.ok) throw new Error("The dashboard didn't open, so the welcome email wasn't sent. Try again in a minute.");

  const { count } = await db().from("placements").select("id", { count: "exact", head: true }).eq("account_id", pl.account_id);
  const { subject, html } = welcomeEmail({ first: acct.name.split(/\s+/)[0], address: pl.address, url, multiple: (count ?? 1) > 1 });
  const status = await sendLogged({ placementId, kind: "welcome", to: acct.email, subject, html, key: `welcome:${placementId}`, cc: [ADMIN_EMAIL] });
  if (status === "sent") {
    await db().from("placements").update({ welcome_sent_at: new Date().toISOString() }).eq("id", placementId);
    await event(placementId, "welcome_sent", actor, { to: acct.email });
  }
  return status;
}
