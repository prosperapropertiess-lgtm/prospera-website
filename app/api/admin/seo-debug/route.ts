import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGSCToken, getServiceAccountEmail } from "@/lib/google-search-console";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = getServiceAccountEmail();
  const token = await getGSCToken();

  if (!token) {
    return NextResponse.json({ step: "token", ok: false, email, error: "Could not obtain access token — check GSC_SERVICE_ACCOUNT_JSON" });
  }

  // Try listing sites to see what properties the service account can access
  const sitesRes = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const sitesBody = await sitesRes.text();

  // Try URL-prefix property
  const urlPrefixRes = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("https://www.prosperaproperties.co/")}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ startDate: "2026-04-01", endDate: "2026-05-16", dimensions: [] }),
    }
  );
  const urlPrefixBody = await urlPrefixRes.text();

  // Try domain property
  const domainRes = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("sc-domain:prosperaproperties.co")}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ startDate: "2026-04-01", endDate: "2026-05-16", dimensions: [] }),
    }
  );
  const domainBody = await domainRes.text();

  return NextResponse.json({
    step: "api",
    ok: urlPrefixRes.ok || domainRes.ok,
    email,
    tokenObtained: true,
    sites: { status: sitesRes.status, body: JSON.parse(sitesBody) },
    urlPrefix: { status: urlPrefixRes.status, body: JSON.parse(urlPrefixBody) },
    domain: { status: domainRes.status, body: JSON.parse(domainBody) },
  });
}
