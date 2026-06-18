import { getSupabaseAdmin } from "@/lib/supabase";
import { PostMessageForm, type PropertyOption } from "@/components/admin/PostMessageForm";

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
          Post Property Update
        </h1>
        <p style={{ color: "#9AA5B1", fontSize: "14px", marginBottom: "32px" }}>
          Post a message to an owner&apos;s property feed. They&apos;ll see it next time they visit their portal.
        </p>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <PostMessageForm properties={propertyOptions} adminSecret={adminSecret} />
        </div>

        <p style={{ marginTop: "24px", fontSize: "12px", color: "#C8BFB5" }}>
          Messages are visible to the owner immediately. Email notifications are sent to the owner on their reply; Ebin gets a copy when owners write back.
        </p>
      </div>
    </div>
  );
}
