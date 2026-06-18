import { getSupabaseAdmin } from "@/lib/supabase";
import { TenantTokensClient } from "./TenantTokensClient";

export const dynamic = "force-dynamic";

interface TokenRecord {
  id: string;
  token: string;
  tenant_name: string;
  property_id: string;
  created_at: string;
}

export default async function AdminTenantsPage() {
  const adminSecret = process.env.ADMIN_API_SECRET ?? "";

  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("tenant_access")
    .select("id, token, tenant_name, property_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const initialTokens = (data ?? []) as TokenRecord[];

  return <TenantTokensClient adminSecret={adminSecret} initialTokens={initialTokens} />;
}
