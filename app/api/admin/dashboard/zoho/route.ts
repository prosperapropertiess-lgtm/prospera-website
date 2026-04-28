import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAccessToken } from "@/lib/zoho";

const ZOHO_API = "https://www.zohoapis.ca/crm/v2";

export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Zoho-oauthtoken ${token}` };

    const [contactsRes, dealsRes] = await Promise.all([
      fetch(`${ZOHO_API}/Contacts?fields=id&per_page=200`, { headers }),
      fetch(`${ZOHO_API}/Deals?fields=Stage&per_page=200`, { headers }),
    ]);

    const contactsData = await contactsRes.json();
    const dealsData = await dealsRes.json();

    const totalContacts = contactsData?.info?.count ?? contactsData?.data?.length ?? 0;
    const deals: { Stage: string }[] = dealsData?.data ?? [];
    const closedWon = deals.filter((d) => d.Stage === "Closed Won").length;
    const inPipeline = deals.filter((d) => d.Stage !== "Closed Won" && d.Stage !== "Closed Lost").length;

    return NextResponse.json({ totalContacts, closedWon, inPipeline });
  } catch (err) {
    console.error("Zoho dashboard error:", err);
    return NextResponse.json({ totalContacts: 0, closedWon: 0, inPipeline: 0 });
  }
}
