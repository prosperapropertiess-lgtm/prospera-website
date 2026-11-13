import { syncFromProperty } from "@/lib/placements/sync";
import { NextRequest, NextResponse, after } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// The slow parts of adding a property, run after the wizard's Photos screen so
// nobody waits on them: neighbourhood lookup, neighbourhood write-up, photo
// labels, and the listing text. Each step reuses the existing admin route and
// only fills what's still empty, so nothing typed by hand is overwritten.
export const maxDuration = 300;

const ENRICH_FIELDS = "id, slug, title, description, ai_highlights, life_simulation, ai_life_intro, neighbourhood_data, neighbourhood_vibe, walk_score, transit_score, bike_score, bus_routes, photo_labels";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data } = await getSupabaseAdmin().from("properties").select(ENRICH_FIELDS).eq("id", id).maybeSingle();
  return data ? NextResponse.json(data) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const origin = req.nextUrl.origin;
  const cookie = req.headers.get("cookie") ?? "";

  after(async () => {
    const db = getSupabaseAdmin();
    const call = async (path: string, body: unknown) => {
      const res = await fetch(`${origin}${path}`, { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify(body) });
      return res.ok ? res.json() : null;
    };
    const load = async () => (await db.from("properties").select("*").eq("id", id).single()).data as Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any

    let p = await load();
    if (!p) return;
    await syncFromProperty(id);

    // 1. Neighbourhood (saves itself when given property_id) + write-up, and photo labels, side by side.
    const hasArea = p.neighbourhood_data && Object.keys(p.neighbourhood_data).length > 0;
    const unlabeled = ((p.photo_labels ?? []) as { url: string; label: string }[]).filter((x) => !x.label || x.label === "other");
    await Promise.allSettled([
      (async () => {
        if (hasArea || !p!.address) return;
        const area = await call("/api/admin/neighbourhood", { address: p!.address, city: p!.city, property_id: id });
        if (!area || p!.neighbourhood_vibe) return;
        const vibe = await call("/api/admin/generate-listing", {
          _vibe_only: true, address: p!.address, city: p!.city, neighbourhood_data: area.places,
          bus_routes: area.bus_routes ?? [], walk_score: area.walk_score, transit_score: area.transit_score,
        });
        if (vibe?.description) await db.from("properties").update({ neighbourhood_vibe: vibe.description }).eq("id", id);
      })(),
      (async () => {
        if (!unlabeled.length) return;
        const out = await call("/api/admin/ai-photo-label", { urls: unlabeled.map((x) => x.url) });
        const map = new Map(((out?.labels ?? []) as { url: string; label: string }[]).map((l) => [l.url, l.label]));
        if (!map.size) return;
        const fresh = await load();
        const labels = ((fresh?.photo_labels ?? []) as { url: string; label: string }[]).map((x) => ({ ...x, label: map.get(x.url) ?? x.label }));
        await db.from("properties").update({ photo_labels: labels }).eq("id", id);
      })(),
    ]);

    // 2. Listing text, once the neighbourhood is in so it can name real nearby places.
    p = await load();
    if (!p || p.description) return;
    const text = await call("/api/admin/generate-listing", {
      address: p.address, city: p.city, property_type: p.property_type, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
      sqft: p.sqft, price: p.price, pet_friendly: p.pet_friendly, pet_policy: p.pet_policy, parking: p.parking,
      parking_type: p.parking_type, laundry_type: p.laundry_type, ac: p.ac, heating_type: p.heating_type, appliances: p.appliances,
      outdoor_space: p.outdoor_space, furnished: p.furnished, utilities_included: p.utilities_included, utilities_detail: p.utilities_detail,
      neighbourhood_data: p.neighbourhood_data, bus_routes: p.bus_routes, walk_score: p.walk_score, transit_score: p.transit_score,
      neighbourhood_vibe: p.neighbourhood_vibe, lease_term: p.lease_term, available_date: p.available_date, transparency: p.transparency,
    });
    if (text?.description) {
      await db.from("properties").update({
        title: text.title || p.title, description: text.description, ai_highlights: text.highlights ?? [],
        life_simulation: text.life_simulation, ai_life_intro: text.life_intro || null,
      }).eq("id", id).is("description", null);
    }
  });

  return NextResponse.json({ started: true }, { status: 202 });
}
