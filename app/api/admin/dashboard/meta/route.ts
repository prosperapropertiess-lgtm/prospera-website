import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.META_AD_ACCOUNT_ID;

  if (!token || !accountId) {
    return NextResponse.json({ connected: false, spend: 0, impressions: 0, reach: 0 });
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${accountId}/insights?fields=spend,impressions,reach&date_preset=today&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ connected: false, spend: 0, impressions: 0, reach: 0 });
    }

    const row = data?.data?.[0] ?? {};
    return NextResponse.json({
      connected: true,
      spend: parseFloat(row.spend ?? "0"),
      impressions: parseInt(row.impressions ?? "0"),
      reach: parseInt(row.reach ?? "0"),
    });
  } catch {
    return NextResponse.json({ connected: false, spend: 0, impressions: 0, reach: 0 });
  }
}
