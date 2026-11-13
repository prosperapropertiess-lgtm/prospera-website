// Daily sales scorecard: counts live in Supabase (sales_scorecard), and each day is
// mirrored to one row of a Google Sheet so it can be shared, filtered and kept.

import { googleToken, serviceAccountEmail } from "@/lib/market/sheets";

export const TARGETS = [10, 20, 50] as const;

export interface ScoreDay {
  day: string; // YYYY-MM-DD, Toronto
  target: number;
  outreaches: number;
  followups: number;
}

export const SCORECARD_SHEET_ID = process.env.SCORECARD_SHEET_ID || "1vkCS2ZJUfKNrTXiFbJPf_7r7fmicaGGo7zksV4C6MjY";
const TAB = "Daily";
const HEADER = ["Date", "Target", "New outreaches", "Follow-ups", "Hit target", "Updated"];

export type SheetStatus =
  | { ok: true; url: string }
  | { ok: false; reason: string; url?: string; shareWith?: string | null };

export function sheetUrl(): string | undefined {
  return SCORECARD_SHEET_ID ? `https://docs.google.com/spreadsheets/d/${SCORECARD_SHEET_ID}/edit` : undefined;
}

async function call(path: string, auth: string, init: RequestInit = {}) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SCORECARD_SHEET_ID}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${auth}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const msg = ((await res.json().catch(() => null)) as { error?: { message?: string } } | null)?.error?.message ?? "";
    if (res.status === 403 && /has not been used|is disabled|SERVICE_DISABLED/i.test(msg)) throw new Error("The Google Sheets API is turned off for the service account's project.");
    if (res.status === 403) throw new Error("The service account can't edit the Sheet. Share it as an Editor.");
    if (res.status === 404) throw new Error("The Sheet wasn't found. Check SCORECARD_SHEET_ID.");
    throw new Error(`Google Sheets returned ${res.status}.`);
  }
  return res.json();
}

/** Writes the day into its row (matched by date in column A), adding the tab, header or row if missing. */
export async function syncDayToSheet(d: ScoreDay): Promise<SheetStatus> {
  const url = sheetUrl();
  if (!url) return { ok: false, reason: "No Sheet connected yet (SCORECARD_SHEET_ID isn't set)." };
  try {
    const auth = await googleToken("https://www.googleapis.com/auth/spreadsheets");

    const meta = (await call("?fields=sheets.properties.title", auth)) as { sheets?: { properties: { title: string } }[] };
    if (!meta.sheets?.some((s) => s.properties.title === TAB)) {
      await call(":batchUpdate", auth, { method: "POST", body: JSON.stringify({ requests: [{ addSheet: { properties: { title: TAB } } }] }) });
    }

    const col = (await call(`/values/${TAB}!A:A`, auth)) as { values?: string[][] };
    const dates = (col.values ?? []).map((r) => r[0] ?? "");
    if (dates[0] !== HEADER[0]) {
      await call(`/values/${TAB}!A1:F1?valueInputOption=RAW`, auth, { method: "PUT", body: JSON.stringify({ values: [HEADER] }) });
      if (!dates.length) dates.push(HEADER[0]); else dates[0] = HEADER[0];
    }

    const updated = new Date().toLocaleString("en-CA", { timeZone: "America/Toronto", dateStyle: "short", timeStyle: "short" });
    const row = [d.day, d.target, d.outreaches, d.followups, d.outreaches >= d.target ? "Yes" : "No", updated];
    const at = dates.indexOf(d.day);
    if (at > 0) {
      await call(`/values/${TAB}!A${at + 1}:F${at + 1}?valueInputOption=USER_ENTERED`, auth, { method: "PUT", body: JSON.stringify({ values: [row] }) });
    } else {
      await call(`/values/${TAB}!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, auth, { method: "POST", body: JSON.stringify({ values: [row] }) });
    }
    return { ok: true, url };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err), url, shareWith: serviceAccountEmail() };
  }
}
