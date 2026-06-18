"use client";
import { useState } from "react";
import Link from "next/link";

const BG = "#0B1219";
const NAV = "#070D13";
const SURFACE = "#111C27";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const ACCENT = "#C4374A";
const INPUT_BG = "#0D1825";

interface TokenRecord {
  id: string;
  token: string;
  tenant_name: string;
  property_id: string;
  created_at: string;
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

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
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
      }}
    />
  );
}

export function TenantTokensClient({ adminSecret, initialTokens }: Props) {
  const [notionTenantId, setNotionTenantId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; portalUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenRecord[]>(initialTokens);

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
        body: JSON.stringify({ notionTenantId, tenantName, propertyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate token");
      } else {
        setResult(data);
        setNotionTenantId("");
        setTenantName("");
        setPropertyId("");
        // Reload tokens
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG }}>
      <div style={{ padding: "16px 24px", backgroundColor: NAV, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/admin" style={{ color: TEXT_SEC, fontSize: "13px", textDecoration: "none" }}>← Admin</Link>
        <span style={{ color: BORDER }}>|</span>
        <span style={{ color: TEXT, fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>Tenant Portals</span>
      </div>

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
            <div>
              <Label>Notion Tenant ID</Label>
              <Input value={notionTenantId} onChange={setNotionTenantId} placeholder="e.g. abc123def456..." />
            </div>
            <div>
              <Label>Tenant Name</Label>
              <Input value={tenantName} onChange={setTenantName} placeholder="e.g. John Smith" />
            </div>
            <div>
              <Label>Notion Property ID</Label>
              <Input value={propertyId} onChange={setPropertyId} placeholder="e.g. 19d44116874346b3..." />
            </div>

            <button
              type="submit"
              disabled={loading || !notionTenantId || !tenantName || !propertyId}
              style={{
                background: ACCENT,
                color: TEXT,
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "14px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                alignSelf: "flex-start",
              }}
            >
              {loading ? "Generating..." : "Generate portal link"}
            </button>
          </form>

          {error && (
            <p style={{ color: "#f87171", fontSize: "13px", fontFamily: "var(--font-dm-sans)", marginTop: "16px" }}>
              {error}
            </p>
          )}

          {result && (
            <div style={{ marginTop: "24px", background: INPUT_BG, border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ color: "#34d399", fontSize: "12px", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                Portal created
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
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "6px",
                    padding: "6px 14px",
                    color: copied === "new" ? "#34d399" : TEXT,
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
                        background: "rgba(255,255,255,0.06)",
                        border: `1px solid ${BORDER}`,
                        borderRadius: "6px",
                        padding: "4px 10px",
                        color: copied === t.id ? "#34d399" : TEXT_SEC,
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
