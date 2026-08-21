"use client";
import { useState, useEffect, useCallback } from "react";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";

const STATUSES = ["submitted", "acknowledged", "triage", "vendor_assigned", "scheduled", "work_complete", "verified", "closed", "cancelled"] as const;
type Status = typeof STATUSES[number];

const STATUS_LABELS: Record<Status, string> = {
  submitted: "New",
  acknowledged: "Acknowledged",
  triage: "In Triage",
  vendor_assigned: "Vendor Assigned",
  scheduled: "Scheduled",
  work_complete: "Awaiting Verification",
  verified: "Verified",
  closed: "Closed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  submitted: { bg: "#FEF3C7", text: "#92400E" },
  acknowledged: { bg: "#DBEAFE", text: "#1E40AF" },
  triage: { bg: "#EDE9FE", text: "#5B21B6" },
  vendor_assigned: { bg: "#E0E7FF", text: "#3730A3" },
  scheduled: { bg: "#CFFAFE", text: "#0E7490" },
  work_complete: { bg: "#FFEDD5", text: "#9A3412" },
  verified: { bg: "#D1FAE5", text: "#065F46" },
  closed: { bg: "#F3F4F6", text: "#374151" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B" },
};

// Forward-only next step per status, for a "quick advance" button
const NEXT_STATUS: Partial<Record<Status, Status>> = {
  submitted: "acknowledged",
  acknowledged: "triage",
  work_complete: "verified",
  verified: "closed",
};

interface Vendor {
  id: string; name: string; trade: string; phone: string | null; email: string | null; active: boolean;
}

interface MaintenanceRequest {
  id: string;
  category: string;
  description: string;
  troubleshooting_steps: string;
  ai_diagnosis: string;
  status: Status;
  admin_notes: string | null;
  scheduled_at: string | null;
  created_at: string;
  property_address: string;
  tenant_name: string;
  tenant_phone: string | null;
  vendors: { id: string; name: string; trade: string; phone: string | null } | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [vendorPick, setVendorPick] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({ name: "", trade: "", phone: "", email: "" });

  const load = useCallback(async (status: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/maintenance?status=${status}`).then((r) => r.json()).catch(() => ({ requests: [] }));
    setRequests(res.requests ?? []);
    setLoading(false);
  }, []);

  const loadVendors = useCallback(async () => {
    const res = await fetch("/api/admin/vendors").then((r) => r.json()).catch(() => ({ vendors: [] }));
    setVendors(res.vendors ?? []);
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);
  useEffect(() => { loadVendors(); }, [loadVendors]);

  async function updateStatus(id: string, status: Status) {
    setBusyId(id);
    const res = await fetch(`/api/admin/maintenance/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load(filter);
    setBusyId(null);
  }

  async function assignVendor(id: string) {
    const vendorId = vendorPick[id];
    if (!vendorId) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/maintenance/${id}/assign-vendor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });
    if (res.ok) {
      const data = await res.json();
      await load(filter);
      if (data.vendorPortalUrl) {
        await navigator.clipboard.writeText(data.vendorPortalUrl).catch(() => {});
        setCopiedUrl(data.vendorPortalUrl);
        setTimeout(() => setCopiedUrl(null), 4000);
      }
    }
    setBusyId(null);
  }

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorForm.name.trim() || !vendorForm.trade.trim()) return;
    const res = await fetch("/api/admin/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorForm),
    });
    if (res.ok) {
      setVendorForm({ name: "", trade: "", phone: "", email: "" });
      setShowAddVendor(false);
      await loadVendors();
    }
  }

  const counts = {
    open: requests.filter((r) => !["closed", "cancelled"].includes(r.status)).length,
    new: requests.filter((r) => r.status === "submitted").length,
    awaitingVerify: requests.filter((r) => r.status === "work_complete").length,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 100px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0, letterSpacing: "-0.02em" }}>Maintenance</h1>
            <p style={{ fontSize: 14, color: TEXT_SEC, margin: "4px 0 0" }}>Requests, dispatch, and vendors</p>
          </div>
          <button
            onClick={() => setShowAddVendor(true)}
            style={{ backgroundColor: NAVY, color: "#FAF8F5", border: "none", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            + Add Vendor
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Open requests", value: counts.open, alert: false },
            { label: "New", value: counts.new, alert: counts.new > 0 },
            { label: "Awaiting verification", value: counts.awaitingVerify, alert: counts.awaitingVerify > 0 },
            { label: "Active vendors", value: vendors.filter((v) => v.active).length, alert: false },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 30, fontWeight: 700, color: s.alert ? ACCENT : NAVY, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: TEXT_MUT, margin: "6px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: filter === s ? "none" : `1px solid ${BORDER}`,
                backgroundColor: filter === s ? NAVY : "#FFFFFF",
                color: filter === s ? "#FAF8F5" : TEXT_SEC,
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {s === "all" ? "All" : STATUS_LABELS[s as Status]}
            </button>
          ))}
        </div>

        {copiedUrl && (
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, backgroundColor: "#DCFCE7", color: "#166534", fontSize: 13 }}>
            Vendor portal link copied to clipboard — send it to the vendor.
          </div>
        )}

        {/* List */}
        {loading ? (
          <p style={{ color: TEXT_MUT, fontSize: 14 }}>Loading...</p>
        ) : requests.length === 0 ? (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 40, textAlign: "center" }}>
            <p style={{ color: TEXT_MUT, fontSize: 14 }}>No requests{filter !== "all" ? ` with status "${STATUS_LABELS[filter as Status]}"` : ""}.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.map((r) => {
              const expanded = expandedId === r.id;
              const colors = STATUS_COLORS[r.status];
              const nextStatus = NEXT_STATUS[r.status];
              return (
                <div key={r.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                  <div
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer", flexWrap: "wrap" }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{r.category}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, backgroundColor: colors.bg, color: colors.text, textTransform: "capitalize" }}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0 }}>{r.property_address} · {r.tenant_name}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {r.vendors && <span style={{ fontSize: 12, color: TEXT_MUT }}>{r.vendors.name}</span>}
                      <span style={{ fontSize: 12, color: TEXT_MUT, whiteSpace: "nowrap" }}>{timeAgo(r.created_at)}</span>
                    </div>
                  </div>

                  {expanded && (
                    <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${BORDER}` }}>
                      <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, margin: "16px 0" }}>{r.description}</p>

                      {r.tenant_phone && (
                        <p style={{ fontSize: 12, color: TEXT_MUT, marginBottom: 16 }}>Tenant phone: {r.tenant_phone}</p>
                      )}

                      {/* Vendor assignment */}
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                        <select
                          value={vendorPick[r.id] ?? r.vendors?.id ?? ""}
                          onChange={(e) => setVendorPick((p) => ({ ...p, [r.id]: e.target.value }))}
                          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: BG, color: TEXT, fontSize: 13 }}
                        >
                          <option value="">Select a vendor…</option>
                          {vendors.filter((v) => v.active).map((v) => (
                            <option key={v.id} value={v.id}>{v.name} — {v.trade}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignVendor(r.id)}
                          disabled={busyId === r.id || !vendorPick[r.id]}
                          style={{ padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: ACCENT, color: "#FAF8F5", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !vendorPick[r.id] ? 0.5 : 1 }}
                        >
                          {r.vendors ? "Reassign & copy link" : "Assign & copy link"}
                        </button>
                      </div>

                      {/* Status controls */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {nextStatus && (
                          <button
                            onClick={() => updateStatus(r.id, nextStatus)}
                            disabled={busyId === r.id}
                            style={{ padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: NAVY, color: "#FAF8F5", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                          >
                            Mark {STATUS_LABELS[nextStatus]}
                          </button>
                        )}
                        {!["closed", "cancelled"].includes(r.status) && (
                          <button
                            onClick={() => updateStatus(r.id, "cancelled")}
                            disabled={busyId === r.id}
                            style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: "transparent", color: TEXT_SEC, fontSize: 13, cursor: "pointer" }}
                          >
                            Cancel request
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add vendor modal */}
      {showAddVendor && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 20 }}>Add Vendor</h2>
            <form onSubmit={addVendor} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Name" value={vendorForm.name} onChange={(e) => setVendorForm((f) => ({ ...f, name: e.target.value }))}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: BG, fontSize: 14 }} />
              <input placeholder="Trade (e.g. Plumber, Electrician)" value={vendorForm.trade} onChange={(e) => setVendorForm((f) => ({ ...f, trade: e.target.value }))}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: BG, fontSize: 14 }} />
              <input placeholder="Phone (optional)" value={vendorForm.phone} onChange={(e) => setVendorForm((f) => ({ ...f, phone: e.target.value }))}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: BG, fontSize: 14 }} />
              <input placeholder="Email (optional)" value={vendorForm.email} onChange={(e) => setVendorForm((f) => ({ ...f, email: e.target.value }))}
                style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: BG, fontSize: 14 }} />
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowAddVendor(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: "transparent", color: TEXT_SEC, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", backgroundColor: ACCENT, color: "#FAF8F5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Save vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
