import { getSupabaseAdmin } from "@/lib/supabase";
import { DocumentUploadForm, type PropertyOption } from "@/components/admin/DocumentUploadForm";

import { Page, PageHeader, Card } from "@/components/admin/kit";

export const dynamic = "force-dynamic";

interface OwnerAccessRow {
  token: string;
  owner_names: string;
}

interface BundleJson {
  properties?: Array<{ property: { id: string; address: string } }>;
}

export default async function AdminDocumentsPage() {
  const sb = getSupabaseAdmin();

  const { data: accessRows } = await sb
    .from("owner_access")
    .select("token, owner_names")
    .order("owner_names");

  const propertyOptions: PropertyOption[] = [];

  if (accessRows && accessRows.length > 0) {
    const tokens = (accessRows as OwnerAccessRow[]).map((r) => r.token);

    const { data: cacheRows } = await sb
      .from("owner_data_cache")
      .select("token, bundle_json")
      .in("token", tokens);

    const cacheByToken = new Map<string, BundleJson | null>(
      (cacheRows ?? []).map((c: { token: string; bundle_json: unknown }) => [
        c.token,
        c.bundle_json as BundleJson | null,
      ])
    );

    for (const row of accessRows as OwnerAccessRow[]) {
      const bundle = cacheByToken.get(row.token);
      const properties = bundle?.properties ?? [];

      if (properties.length === 0) {
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
      <PageHeader title="Share a document" subtitle="Add a lease, inspection report or notice to an owner's portal. They can see it right away." />
      <Card>
        <DocumentUploadForm properties={propertyOptions} adminSecret={adminSecret} />
      </Card>
    </Page>
  );
}
