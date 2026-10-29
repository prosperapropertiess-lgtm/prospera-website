"use client";
import { useState, useEffect } from "react";
import { Page, PageHeader, SectionTitle, Card, Button, EmptyState, ErrorNote, SuccessNote, Field, inputStyle, C, shortDate } from "@/components/admin/kit";

interface TokenRecord {
  id: string;
  token: string;
  tenant_name: string;
  property_id: string;
  created_at: string;
}

interface NotionTenant { id: string; name: string; propertyId: string }
interface NotionProperty { id: string; address: string }

interface Props {
  adminSecret: string;
  initialTokens: TokenRecord[];
}

const portalUrl = (token: string) => `https://www.prosperaproperties.co/tenants/${token}`;

export function TenantTokensClient({ adminSecret, initialTokens }: Props) {
  const [tenants, setTenants] = useState<NotionTenant[]>([]);
  const [properties, setProperties] = useState<NotionProperty[]>([]);
  const [loadingNotion, setLoadingNotion] = useState(true);

  const [tenantId, setTenantId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ portalUrl: string; emailSent?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenRecord[]>(initialTokens);

  const auth = { Authorization: `Bearer ${adminSecret}` };

  useEffect(() => {
    fetch("/api/admin/notion-tenants", { headers: { Authorization: `Bearer ${adminSecret}` } })
      .then((r) => r.json())
      .then((d) => { setTenants(d.tenants ?? []); setProperties(d.properties ?? []); })
      .catch(() => setError("Couldn't load tenants from Notion. Refresh to try again."))
      .finally(() => setLoadingNotion(false));
  }, [adminSecret]);

  function pickTenant(id: string) {
    setTenantId(id);
    const t = tenants.find((x) => x.id === id);
    if (t && properties.some((p) => p.id === t.propertyId)) setPropertyId(t.propertyId);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === tenantId);
    const property = properties.find((p) => p.id === propertyId);
    if (!tenant || !property) return;
    setSaving(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/admin/tenant-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({
          notionTenantId: tenant.id,
          tenantName: tenant.name,
          propertyId: property.id,
          tenantEmail: email || undefined,
          propertyAddress: property.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Couldn't create the link. Try again."); return; }
      setResult(data);
      setTenantId(""); setPropertyId(""); setEmail("");
      const list = await fetch("/api/admin/tenant-tokens", { headers: auth });
      if (list.ok) setTokens((await list.json()).tokens ?? []);
    } catch {
      setError("Couldn't create the link. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const propertyName = (id: string) => properties.find((p) => p.id === id)?.address;

  return (
    <Page width={900}>
      <PageHeader title="Tenant portals" subtitle="Each tenant gets a private link for repairs, documents and messages." />
      {error && <ErrorNote>{error}</ErrorNote>}

      <Card>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: C.navy, margin: "0 0 18px" }}>Give a tenant their link</h2>
        <form onSubmit={create} style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <Field label="Tenant">
              <select style={inputStyle} value={tenantId} onChange={(e) => pickTenant(e.target.value)} disabled={loadingNotion} required>
                <option value="">{loadingNotion ? "Loading from Notion…" : "Pick a tenant…"}</option>
                {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Home">
              <select style={inputStyle} value={propertyId} onChange={(e) => setPropertyId(e.target.value)} disabled={loadingNotion} required>
                <option value="">Pick a home…</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Their email" hint="Optional. If you add it, we email them the link with a short welcome.">
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <div><Button type="submit" variant="primary" disabled={saving || !tenantId || !propertyId}>{saving ? "Creating…" : "Create link"}</Button></div>
        </form>
        {result && (
          <SuccessNote>
            Link ready{result.emailSent ? " and emailed" : ""}: <strong>{result.portalUrl}</strong>{" "}
            <button onClick={() => copy(result.portalUrl, "new")} style={{ marginLeft: 8, background: "none", border: "none", color: C.green, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
              {copied === "new" ? "Copied" : "Copy"}
            </button>
          </SuccessNote>
        )}
      </Card>

      <SectionTitle>Tenants with a link</SectionTitle>
      {tokens.length === 0 ? <EmptyState title="No links yet" /> : (
        <Card padding={0}>
          {tokens.map((t, i) => (
            <div key={t.id} style={{ padding: "16px 20px", borderTop: i ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{t.tenant_name}</div>
                <div style={{ fontSize: 14, color: C.muted }}>{propertyName(t.property_id) ?? "Home not found in Notion"} · made {shortDate(t.created_at)}</div>
              </div>
              <Button size="sm" onClick={() => copy(portalUrl(t.token), t.id)}>{copied === t.id ? "Copied" : "Copy link"}</Button>
              <Button size="sm" href={portalUrl(t.token)} target="_blank">Open</Button>
            </div>
          ))}
        </Card>
      )}
    </Page>
  );
}
