import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  sendToOwner, ownerDecision, requestRent, rentReceived, saveSingleKey, startMoveIn, decline,
  knownOwner, ownerReportUrl, rentReference, DEFAULT_ETRANSFER_TO,
} from "@/lib/application-pipeline";

// GET: what the "Next steps" panel needs. POST: one step at a time.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data: a } = await getSupabaseAdmin().from("applications").select("property_id, monthly_rent, owner_name, owner_email, singlekey_path").eq("id", id).maybeSingle();
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const owner = a.owner_email ? { name: a.owner_name, email: a.owner_email } : await knownOwner(a.property_id);
  let singlekeyUrl: string | null = null;
  if (a.singlekey_path) singlekeyUrl = (await getSupabaseAdmin().storage.from("applications").createSignedUrl(a.singlekey_path, 3600)).data?.signedUrl ?? null;
  return NextResponse.json({ owner, ownerReportUrl: ownerReportUrl(id), rentReference: rentReference(id), etransferTo: DEFAULT_ETRANSFER_TO, rent: Number(a.monthly_rent), singlekeyUrl });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const file = (await req.formData()).get("file");
      if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Pick the SingleKey report file." }, { status: 400 });
      await saveSingleKey(id, file);
      return NextResponse.json({ ok: true });
    }
    const b = await req.json();
    switch (b.action) {
      case "send_to_owner": {
        const email = String(b.email ?? "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter the owner's email." }, { status: 400 });
        await sendToOwner(id, { name: String(b.name ?? "").trim(), email });
        break;
      }
      case "owner_approved": await ownerDecision(id, "approved", b.note ?? null, "admin"); break;
      case "owner_declined": await ownerDecision(id, "declined", b.note ?? null, "admin"); break;
      case "request_rent": {
        const amount = Number(b.amount);
        const to = String(b.to ?? "").trim();
        if (!(amount > 0) || !to) return NextResponse.json({ error: "Enter the amount and e-transfer address." }, { status: 400 });
        await requestRent(id, { amount, to });
        break;
      }
      case "rent_received": await rentReceived(id); break;
      case "start_move_in": await startMoveIn(id); break;
      case "decline": await decline(id); break;
      default: return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
