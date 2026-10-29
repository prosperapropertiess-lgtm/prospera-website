"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Page, PageHeader, SectionTitle, Grid, Stat, Card, Tabs, Badge, Button, EmptyState, Loading, ErrorNote, SuccessNote,
  Field, inputStyle, C, ago, type Tone,
} from "@/components/admin/kit";

type Status = "submitted" | "acknowledged" | "triage" | "vendor_assigned" | "scheduled" | "work_complete" | "verified" | "closed" | "cancelled";

const LABEL: Record<Status, string> = {
  submitted: "New",
  acknowledged: "Seen",
  triage: "Figuring it out",
  vendor_assigned: "Vendor booked",
  scheduled: "Scheduled",
  work_complete: "Fixed, check with tenant",
  verified: "Confirmed fixed",
  closed: "Closed",
  cancelled: "Cancelled",
};

const TONE: Record<Status, Tone> = {
  submitted: "red", acknowledged: "amber", triage: "amber", vendor_assigned: "blue", scheduled: "blue",
  work_complete: "amber", verified: "green", closed: "grey", cancelled: "grey",
};

// The one-tap next step for each status, where there is an obvious one.
const NEXT: Partial<Record<Status, Status>> = {
  submitted: "acknowledged",
  acknowledged: "triage",
  work_complete: "verified",
  verified: "closed",
};

const DONE: Status[] = ["verified", "closed", "cancelled"];

interface Vendor { id: string; name: string; trade: string; phone: string | null; email: string | null; active: boolean }

interface Request {
  id: string;
  category: string;
  description: string;
  status: Status;
  created_at: string;
  property_address: string;
  tenant_name: string;
  tenant_phone: string | null;
  vendors: { id: string; name: string; trade: string; phone: string | null } | null;
}

type Filter = "open" | "done" | "all";

export default function RepairsPage() {
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const [vendorPick, setVendorPick] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [addingVendor, setAddingVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({ name: "", trade: "", phone: "", email: "" });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/maintenance?status=all");
    if (!res.ok) { setRequests([]); setError("Couldn't load repairs. Refresh to try again."); return; }
    setRequests((await res.json()).requests ?? []);
  }, []);

  const loadVendors = useCallback(async () => {
    const res = await fetch("/api/admin/vendors").then((r) => r.json()).catch(() => ({ vendors: [] }));
    setVendors(res.vendors ?? []);
  }, []);

  // Deferred a tick so the first load isn't a synchronous state update inside the effect.
  useEffect(() => {
    const t = setTimeout(() => { load(); loadVendors(); }, 0);
    return () => clearTimeout(t);
  }, [load, loadVendors]);

  async function setStatus(id: string, status: Status) {
    setBusy(id);
    const res = await fetch(`/api/admin/maintenance/${id}/status`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    if (res.ok) await load(); else setError("Couldn't update that repair. Try again.");
    setBusy(null);
  }

  async function assign(id: string) {
    const vendorId = vendorPick[id];
    if (!vendorId) return;
    setBusy(id);
    const res = await fetch(`/api/admin/maintenance/${id}/assign-vendor`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vendorId }),
    });
    if (res.ok) {
      const data = await res.json();
      await load();
      if (data.vendorPortalUrl) {
        await navigator.clipboard.writeText(data.vendorPortalUrl).catch(() => {});
        setNotice("Vendor booked. Their link is copied, so paste it into a text or email to them.");
      }
    } else setError("Couldn't book that vendor. Try again.");
    setBusy(null);
  }

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/vendors", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vendorForm),
    });
    if (res.ok) {
      setVendorForm({ name: "", trade: "", phone: "", email: "" });
      setAddingVendor(false);
      setNotice("Vendor saved.");
      await loadVendors();
    } else setError("Couldn't save that vendor. Try again.");
  }

  const all = requests ?? [];
  const open = all.filter((r) => !DONE.includes(r.status));
  const shown = filter === "all" ? all : filter === "open" ? open : all.filter((r) => DONE.includes(r.status));
  const activeVendors = vendors.filter((v) => v.active);

  return (
    <Page>
      <PageHeader
        title="Repairs"
        subtitle="What tenants reported, who's fixing it, and what's done."
        actions={<Button onClick={() => setAddingVendor((v) => !v)}>{addingVendor ? "Close" : "+ Add a vendor"}</Button>}
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <SuccessNote>{notice}</SuccessNote>}

      {addingVendor && (
        <Card style={{ marginBottom: 24 }}>
          <form onSubmit={addVendor} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, alignItems: "end" }}>
            <Field label="Name"><input style={inputStyle} value={vendorForm.name} onChange={(e) => setVendorForm((f) => ({ ...f, name: e.target.value }))} required /></Field>
            <Field label="Trade"><input style={inputStyle} placeholder="Plumber" value={vendorForm.trade} onChange={(e) => setVendorForm((f) => ({ ...f, trade: e.target.value }))} required /></Field>
            <Field label="Phone"><input style={inputStyle} value={vendorForm.phone} onChange={(e) => setVendorForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
            <Field label="Email"><input style={inputStyle} type="email" value={vendorForm.email} onChange={(e) => setVendorForm((f) => ({ ...f, email: e.target.value }))} /></Field>
            <Button type="submit" variant="primary">Save vendor</Button>
          </form>
        </Card>
      )}

      {!requests ? <Loading /> : (
        <>
          <Grid min={200}>
            <Stat label="Open" value={open.length} />
            <Stat label="New, not seen yet" value={all.filter((r) => r.status === "submitted").length} tone={all.some((r) => r.status === "submitted") ? "alert" : undefined} />
            <Stat label="Fixed, check with tenant" value={all.filter((r) => r.status === "work_complete").length} />
            <Stat label="Vendors" value={activeVendors.length} />
          </Grid>

          <div style={{ marginTop: 28 }}>
            <Tabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: "open", label: "Open", count: open.length },
                { value: "done", label: "Done", count: all.length - open.length },
                { value: "all", label: "All", count: all.length },
              ]}
            />
          </div>

          {shown.length === 0 ? (
            <EmptyState title={filter === "open" ? "No open repairs" : "Nothing here"} body={filter === "open" ? "When a tenant reports something, it shows up here." : undefined} />
          ) : (
            <Card padding={0}>
              {shown.map((r, i) => {
                const expanded = openId === r.id;
                const next = NEXT[r.status];
                return (
                  <div key={r.id} style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                    <div onClick={() => setOpenId(expanded ? null : r.id)} style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", cursor: "pointer", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, fontSize: 16 }}>{r.category}</span>
                          <Badge tone={TONE[r.status]}>{LABEL[r.status]}</Badge>
                        </div>
                        <div style={{ fontSize: 14, color: C.muted, marginTop: 3 }}>{r.property_address} · {r.tenant_name}</div>
                      </div>
                      <div style={{ fontSize: 14, color: C.muted, textAlign: "right" }}>
                        {r.vendors && <div>{r.vendors.name}</div>}
                        <div>{ago(r.created_at)}</div>
                      </div>
                    </div>

                    {expanded && (
                      <div style={{ padding: "0 20px 20px" }}>
                        <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 10px", whiteSpace: "pre-wrap" }}>{r.description}</p>
                        {r.tenant_phone && <p style={{ fontSize: 14, color: C.muted, margin: "0 0 16px" }}>Tenant&apos;s phone: <a href={`tel:${r.tenant_phone}`} style={{ color: C.navy }}>{r.tenant_phone}</a></p>}

                        {!DONE.includes(r.status) && (
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
                            <select
                              style={{ ...inputStyle, width: "auto", minWidth: 240 }}
                              value={vendorPick[r.id] ?? r.vendors?.id ?? ""}
                              onChange={(e) => setVendorPick((p) => ({ ...p, [r.id]: e.target.value }))}
                            >
                              <option value="">{activeVendors.length ? "Pick a vendor…" : "Add a vendor first"}</option>
                              {activeVendors.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.trade})</option>)}
                            </select>
                            <Button variant="primary" onClick={() => assign(r.id)} disabled={busy === r.id || !vendorPick[r.id]}>
                              {r.vendors ? "Switch vendor" : "Book vendor"}
                            </Button>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {next && <Button onClick={() => setStatus(r.id, next)} disabled={busy === r.id}>Mark as {LABEL[next].toLowerCase()}</Button>}
                          {!DONE.includes(r.status) && <Button variant="ghost" onClick={() => setStatus(r.id, "cancelled")} disabled={busy === r.id}>Cancel this repair</Button>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>
          )}

          {activeVendors.length > 0 && (
            <>
              <SectionTitle>Your vendors</SectionTitle>
              <Card padding={0}>
                {activeVendors.map((v, i) => (
                  <div key={v.id} style={{ padding: "14px 20px", borderTop: i ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div><span style={{ fontWeight: 600 }}>{v.name}</span> <span style={{ color: C.muted }}>· {v.trade}</span></div>
                    <div style={{ color: C.muted, fontSize: 14 }}>{[v.phone, v.email].filter(Boolean).join(" · ") || "No contact saved"}</div>
                  </div>
                ))}
              </Card>
            </>
          )}
        </>
      )}
    </Page>
  );
}
