import { getSupabaseAdmin } from "@/lib/supabase";
import { PostMessageForm, type PropertyOption } from "@/components/admin/PostMessageForm";

import { Page, PageHeader, Card } from "@/components/admin/kit";

export const dynamic = "force-dynamic";

interface OwnerAccessRow {
  token: string;
  owner_names: string;
  bundle_json: { properties?: Array<{ property: { id: string; address: string } }> } | null;
}

export default async function AdminMessagesPage() {
  const sb = getSupabaseAdmin();

  // Fetch all owner_access rows
  const { data: accessRows } = await sb
    .from("owner_access")
    .select("token, owner_names")
    .order("owner_names");

  // For each token, fetch cached bundle to get property addresses
  const propertyOptions: PropertyOption[] = [];

  if (accessRows && accessRows.length > 0) {
    const tokens = accessRows.map((r: { token: string }) => r.token);

    const { data: cacheRows } = await sb
      .from("owner_data_cache")
      .select("token, bundle_json")
      .in("token", tokens);

    const cacheByToken = new Map<string, OwnerAccessRow["bundle_json"]>(
      (cacheRows ?? []).map((c: { token: string; bundle_json: unknown }) => [c.token, c.bundle_json as OwnerAccessRow["bundle_json"]])
    );

    for (const row of accessRows) {
      const bundle = cacheByToken.get(row.token);
      const properties = bundle?.properties ?? [];

      if (properties.length === 0) {
        // No cached data — add a placeholder entry so Ebin can still post
        propertyOptions.push({
          token: row.token,
          ownerName: row.owner_names,
          propertyId: "unknown",
          address: `${row.owner_names} (properties not loaded yet)`,
        });
        continue;
      }

      for (const pd of properties) {
        propertyOptions.push({
          token: row.token,
          ownerName: row.owner_names,
          propertyId: pd.property.id,
          address: pd.property.address,
        });
      }
    }
  }

  const adminSecret = process.env.ADMIN_API_SECRET ?? "";

  return (
    <Page width={760}>
      <PageHeader title="Post an update" subtitle="Write a note to an owner about their property. It shows up in their portal right away." />
      <Card>
        <PostMessageForm properties={propertyOptions} adminSecret={adminSecret} />
      </Card>
      <p style={{ marginTop: 16, fontSize: 14, color: "#666666" }}>When an owner replies, you get a copy by email.</p>
    </Page>
  );
}
