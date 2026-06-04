/**
 * Creates owner_access records for Randy & Tina and Parvez & Parveen.
 * Queries Notion to resolve owner IDs, then inserts into Supabase.
 *
 * Run with:
 *   NOTION_API_KEY=xxx SUPABASE_URL=https://hwaroazxbzgmjjasgtdb.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/seed-owner-access.ts
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!NOTION_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing: NOTION_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const OWNERS_DB = "0bcd6043067b4f18b089950994a600fb";

async function getNotionOwners(): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(`https://api.notion.com/v1/databases/${OWNERS_DB}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 50 }),
  });
  const data = await res.json() as { results: any[] };
  return data.results.map((p: any) => ({
    id: p.id.replace(/-/g, ""),
    name: p.properties?.["Owner Name"]?.title?.[0]?.plain_text ?? "(unknown)",
  }));
}

async function upsert(record: { token: string; owner_names: string; notion_owner_ids: string[] }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/owner_access`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function main() {
  console.log("Fetching Notion owners...");
  const owners = await getNotionOwners();
  console.log("Found:", owners.map(o => `${o.name} (${o.id})`).join(", "), "\n");

  const find = (s: string) => owners.find(o => o.name.toLowerCase().includes(s.toLowerCase()));

  const bundles = [
    {
      token: "randt-k9mp2xv8qn3z",
      owner_names: "Randy & Tina",
      ids: [find("Randy")?.id, find("Tina")?.id ?? find("Lahey")?.id].filter(Boolean) as string[],
    },
    {
      token: "pandp-m4xr7wk2ej5q",
      owner_names: "Parvez & Parveen",
      ids: [find("Parvez")?.id, find("Parveen")?.id].filter(Boolean) as string[],
    },
  ];

  for (const b of bundles) {
    if (!b.ids.length) {
      console.warn(`⚠ No Notion IDs found for ${b.owner_names} — skipping`);
      continue;
    }
    await upsert({ token: b.token, owner_names: b.owner_names, notion_owner_ids: b.ids });
    console.log(`✓ ${b.owner_names}`);
    console.log(`  Dashboard: https://www.prosperaproperties.co/owners/${b.token}\n`);
  }

  console.log("Done. Share the dashboard URLs directly — no login needed.");
}

main().catch(console.error);
