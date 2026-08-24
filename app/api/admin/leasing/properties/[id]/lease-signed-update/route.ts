/**
 * POST /api/admin/leasing/properties/[id]/lease-signed-update — the
 * mid-process owner update fired once the lease is marked signed in the
 * Move-In & Closeout checklist.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { ownerLeaseSignedEmail, type CloseoutTenant } from "@/lib/emails";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();

  const { data: lp, error } = await db
    .from("leasing_properties")
    .select("owner_name, owner_email, move_in_data, property:properties(title, address)")
    .eq("id", id)
    .single();
  if (error || !lp) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (!lp.owner_email) return NextResponse.json({ error: "Set the owner's email on the Overview tab first" }, { status: 400 });

  const { data: applications } = await db
    .from("leasing_applications")
    .select("legal_name, co_tenants")
    .eq("campaign_id", id)
    .eq("stage", "APPROVED")
    .order("decision_at", { ascending: false })
    .limit(1);
  const approved = applications?.[0] ?? null;

  const tenantNames = [approved?.legal_name].filter(Boolean) as string[];
  const coTenants = (approved?.co_tenants ?? []) as CloseoutTenant[];
  for (const t of coTenants) if (t.name) tenantNames.push(t.name);
  if (tenantNames.length === 0) tenantNames.push("the tenant");

  const md = (lp.move_in_data ?? {}) as Record<string, unknown>;
  const propertyAddress = (lp.property as { title?: string; address?: string } | null)?.address
    ?? (lp.property as { title?: string; address?: string } | null)?.title
    ?? "your property";

  try {
    await resend.emails.send({
      from: "Ebin | Prospera Properties <hello@prosperaproperties.co>",
      to: lp.owner_email,
      cc: ["prosperapropertiess@gmail.com"],
      subject: `Lease signed — ${propertyAddress}`,
      html: ownerLeaseSignedEmail({
        ownerName: lp.owner_name || "there",
        propertyAddress,
        tenantNames,
        moveInDate: (md.move_in_date as string) || null,
      }),
    });
  } catch (emailErr) {
    console.error("Lease signed owner email failed:", emailErr);
    return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
  }

  await db.from("leasing_properties").update({
    move_in_data: { ...md, lease_signed_update_sent_at: new Date().toISOString() },
  }).eq("id", id);

  return NextResponse.json({ ok: true });
}
