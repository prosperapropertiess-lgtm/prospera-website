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

  const target = new URL(req.url).searchParams.get("db") ?? "rent";
  const dbId = target === "expenses" ? DB.expenses : DB.rentTracker;

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

  // Return just the property names + values
  const rows = data.results.map((page: any) => {
    const props: Record<string, any> = {};
    for (const [key, val] of Object.entries(page.properties as Record<string, any>)) {
      props[key] = { type: val.type, raw: val };
    }
    return { id: page.id, properties: props };
  });

  return NextResponse.json({ db: target, count: rows.length, rows });
}
