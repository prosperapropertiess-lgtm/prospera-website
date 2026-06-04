import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/notion";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = new URL(req.url).searchParams.get("db") ?? "list";

  // List all databases the integration can access
  if (target === "list") {
    const res = await fetch(`${NOTION_API}/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ filter: { value: "database", property: "object" }, page_size: 20 }),
    });
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
    const data = await res.json();
    const dbs = data.results.map((d: any) => ({
      id: d.id,
      title: d.title?.[0]?.plain_text ?? "(untitled)",
      url: d.url,
    }));
    return NextResponse.json({ databases: dbs });
  }

  const dbId = target === "expenses" ? DB.expenses
    : target === "rent" ? DB.rentTracker
    : target; // allow raw ID

  // Return schema only
  if (new URL(req.url).searchParams.get("schema") === "1") {
    const sr = await fetch(`${NOTION_API}/databases/${dbId}`, { headers: headers() });
    if (!sr.ok) return NextResponse.json({ error: await sr.text() }, { status: 500 });
    const sd = await sr.json();
    const schema = Object.entries(sd.properties as Record<string, any>).map(([name, val]) => ({ name, type: val.type }));
    return NextResponse.json({ db: target, schema });
  }

  // Fetch first 5 rows — no filter, just raw data
  const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ page_size: 5 }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await res.json();

  const rows = data.results.map((page: any) => {
    const props: Record<string, any> = {};
    for (const [key, val] of Object.entries(page.properties as Record<string, any>)) {
      props[key] = { type: val.type, raw: val };
    }
    return { id: page.id, properties: props };
  });

  return NextResponse.json({ db: target, count: rows.length, rows });
}
