"use client";
import { useState, useEffect } from "react";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const ACCENT = "#8B2030";
const INPUT_BG = "#F7F5F2";

interface TokenRecord {
  id: string;
  token: string;
  tenant_name: string;
  property_id: string;
  created_at: string;
}

interface NotionTenant {
  id: string;
  name: string;
  propertyId: string;
}

interface NotionProperty {
  id: string;
  address: string;
}

interface Props {
  adminSecret: string;
  initialTokens: TokenRecord[];
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {children}
    </label>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: INPUT_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: "8px",
  padding: "10px 14px",
  color: TEXT,
  fontSize: "14px",
  fontFamily: "var(--font-dm-sans)",
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: INPUT_BG,
  border: `1px solid ${BORDER}`,
  borderRadius: "8px",
  padding: "10px 14px",
  color: TEXT,
  fontSize: "14px",
  fontFamily: "var(--font-dm-sans)",
  outline: "none",
  boxSizing: "border-box",
};

export function TenantTokensClient({ adminSecret, initialTokens }: Props) {
  const [notionTenants, setNotionTenants] = useState<NotionTenant[]>([]);
  const [notionProperties, setNotionProperties] = useState<NotionProperty[]>([]);
  const [loadingNotion, setLoadingNotion] = useState(true);

  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; portalUrl: string; emailSent?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenRecord[]>(initialTokens);

  useEffect(() => {
    fetch("/api/admin/notion-tenants", {
      headers: { Authorization: `Bearer ${adminSecret}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setNotionTenants(data.tenants ?? []);
        setNotionProperties(data.properties ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingNotion(false));
  }, [adminSecret]);

  function handleTenantSelect(tenantId: string) {
    setSelectedTenantId(tenantId);
    const t = notionTenants.find((x) => x.id === tenantId);
    if (!t) { setTenantName(""); setSelectedPropertyId(""); return; }
    setTenantName(t.name);
    // Auto-select their property if it's in the list
    const matchedProp = notionProperties.find((p) => p.id === t.propertyId);
    if (matchedProp) setSelectedPropertyId(matchedProp.id);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/tenant-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          notionTenantId: selectedTenantId,
          tenantName,
          propertyId: selectedPropertyId,
          tenantEmail: tenantEmail || undefined,
          propertyAddress: propertyAddress || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate token");
      } else {
        setResult(data);
        setSelectedTenantId("");
        setTenantName("");
        setSelectedPropertyId("");
        setTenantEmail("");
        setPropertyAddress("");
        const listRes = await fetch("/api/admin/tenant-tokens", {
          headers: { Authorization: `Bearer ${adminSecret}` },
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          setTokens(listData.tokens ?? []);
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const canSubmit = !loading && selectedTenantId && tenantName && selectedPropertyId;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "48px", fontWeight: 300, color: TEXT, marginBottom: "8px" }}>
          Tenant Portals
        </h1>
        <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)", marginBottom: "48px" }}>
          Generate a secure portal link for a tenant.
        </p>

        {/* Generate form */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "32px", marginBottom: "40px" }}>
          <p style={{ color: TEXT, fontSize: "18px", fontFamily: "var(--font-cormorant)", fontWeight: 300, marginBottom: "24px" }}>
            Generate new token
          </p>

          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Tenant dropdown */}
            <div>
              <Label>Tenant</Label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantSelect(e.target.value)}
                  disabled={loadingNotion}
                  style={{ ...selectStyle, opacity: loadingNotion ? 0.5 : 1 }}
                >
                  <option value="">{loadingNotion ? "Loading from Notion…" : "Select tenant"}</option>
                  {notionTenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: TEXT_SEC, pointerEvents: "none", fontSize: "12px" }}>▼</span>
              </div>
            </div>

            {/* Property dropdown */}
            <div>
              <Label>Property</Label>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  disabled={loadingNotion}
                  style={{ ...selectStyle, opacity: loadingNotion ? 0.5 : 1 }}
                >
                  <option value="">{loadingNotion ? "Loading from Notion…" : "Select property"}</option>
                  {notionProperties.map((p) => (
                    <option key={p.id} value={p.id}>{p.address}</option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: TEXT_SEC, pointerEvents: "none", fontSize: "12px" }}>▼</span>
              </div>
            </div>

            <div style={{ height: "1px", background: BORDER, margin: "4px 0" }} />

            <div>
              <Label>Tenant Email — sends welcome email automatically</Label>
              <input
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                placeholder="tenant@email.com (optional)"
                style={inputStyle}
              />
            </div>
            <div>
              <Label>Property Address — shown in welcome email</Label>
              <input
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="e.g. 27 Horton St, London ON"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                background: ACCENT,
                color: "#FAF8F5",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "14px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 600,
                cursor: !canSubmit ? "not-allowed" : "pointer",
                opacity: !canSubmit ? 0.5 : 1,
                alignSelf: "flex-start",
              }}
            >
              {loading ? "Creating..." : tenantEmail ? "Create portal & send welcome email" : "Create portal link"}
            </button>
          </form>

          {error && (
            <p style={{ color: "#f87171", fontSize: "13px", fontFamily: "var(--font-dm-sans)", marginTop: "16px" }}>
              {error}
            </p>
          )}

          {result && (
            <div style={{ marginTop: "24px", background: "#F0FDF4", border: "1px solid rgba(5,150,105,0.25)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ color: "#059669", fontSize: "12px", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                Portal created {result.emailSent ? "· Welcome email sent ✓" : ""}
              </p>
              <p style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)", marginBottom: "4px" }}>Token</p>
              <p style={{ color: TEXT, fontSize: "13px", fontFamily: "monospace", marginBottom: "16px", wordBreak: "break-all" }}>
                {result.token}
              </p>
              <p style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)", marginBottom: "4px" }}>Portal URL</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <p style={{ color: TEXT, fontSize: "13px", fontFamily: "monospace", wordBreak: "break-all", flex: 1 }}>
                  {result.portalUrl}
                </p>
                <button
                  onClick={() => handleCopy(result.portalUrl, "new")}
                  style={{
                    background: "#F7F5F2",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "6px",
                    padding: "6px 14px",
                    color: copied === "new" ? "#059669" : TEXT,
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied === "new" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent tokens list */}
        <div>
          <p style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
            Recently generated
          </p>

          {tokens.length === 0 ? (
            <p style={{ color: TEXT_SEC, fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>No tokens yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tokens.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p style={{ color: TEXT, fontSize: "14px", fontFamily: "var(--font-dm-sans)", fontWeight: 500, marginBottom: "2px" }}>
                      {t.tenant_name}
                    </p>
                    <p style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "monospace" }}>{t.token}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <p style={{ color: TEXT_SEC, fontSize: "11px", fontFamily: "var(--font-dm-sans)" }}>
                      {new Date(t.created_at).toLocaleDateString("en-CA")}
                    </p>
                    <button
                      onClick={() => handleCopy(`https://prosperaproperties.co/tenants/${t.token}`, t.id)}
                      style={{
                        background: "#F7F5F2",
                        border: `1px solid ${BORDER}`,
                        borderRadius: "6px",
                        padding: "4px 10px",
                        color: copied === t.id ? "#059669" : TEXT_SEC,
                        fontSize: "11px",
                        fontFamily: "var(--font-dm-sans)",
                        cursor: "pointer",
                      }}
                    >
                      {copied === t.id ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
