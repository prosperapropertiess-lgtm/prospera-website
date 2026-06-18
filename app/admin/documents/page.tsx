import { getSupabaseAdmin } from "@/lib/supabase";
import { DocumentUploadForm, type PropertyOption } from "@/components/admin/DocumentUploadForm";

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
          address: `${row.owner_names} (no cached properties)`,
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
    <div style={{ minHeight: "100vh", background: "#F7F5F2", padding: "40px 24px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "24px",
            fontWeight: 700,
            color: "#1F2F3A",
            marginBottom: "8px",
          }}
        >
          Upload Document
        </h1>
        <p style={{ color: "#9AA5B1", fontSize: "14px", marginBottom: "32px" }}>
          Upload leases, inspection reports, and notices to an owner&apos;s portal.
        </p>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <DocumentUploadForm properties={propertyOptions} adminSecret={adminSecret} />
        </div>

        <p style={{ marginTop: "24px", fontSize: "12px", color: "#C8BFB5" }}>
          Documents are visible to the owner immediately in their property portal.
        </p>
      </div>
    </div>
  );
}
