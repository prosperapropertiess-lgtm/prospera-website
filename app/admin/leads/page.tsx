"use client";
import { useEffect, useState } from "react";
import { Page, PageHeader, Card, Tabs, Badge, Button, EmptyState, Loading, ErrorNote, inputStyle, C, ago, humanize, type Tone } from "@/components/admin/kit";

interface Lead {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  message: string | null;
  type: string | null;
  source: string | null;
  property: string | null;
  created_at: string;
  _table: "contact" | "subscriber";
}

type Filter = "all" | "contacts" | "subscribers";

const TYPE_TONE: Record<string, Tone> = { landlord: "blue", tenant: "green" };

// Turns stored source tags ("blog:/blog/foo-bar", "service:/services/air…") into plain words.
function whereFrom(l: Lead): string {
  const s = l.source ?? (l._table === "subscriber" ? "newsletter popup" : "website form");
  if (s.startsWith("blog:")) return `Blog: ${humanize(s.split("/").pop())}`;
  if (s.startsWith("service:")) return `Service page: ${humanize(s.split("/").pop())}`;
  if (s === "direct") return "Website form";
  return humanize(s);
}

function displayName(l: Lead): string {
  return l.name && !/^(n\/a|na|-|—)$/i.test(l.name.trim()) ? l.name : l.email;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads?source=all&limit=200")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setLeads(d.leads ?? []))
      .catch(() => { setLeads([]); setError(true); });
  }, []);

  async function remove(l: Lead) {
    if (!confirm(`Remove ${displayName(l)} from leads?`)) return;
    setRemoving(l.id);
    const res = await fetch("/api/admin/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id, table: l._table }),
    });
    if (res.ok) setLeads((prev) => prev?.filter((x) => x.id !== l.id) ?? null);
    setRemoving(null);
  }

  const all = leads ?? [];
  const q = search.trim().toLowerCase();
  const shown = all
    .filter((l) => filter === "all" || (filter === "contacts" ? l._table === "contact" : l._table === "subscriber"))
    .filter((l) => !q || [l.email, l.name, l.city, l.message].some((v) => (v ?? "").toLowerCase().includes(q)));

  return (
    <Page width={1000}>
      <PageHeader title="Leads" subtitle="People who reached out on the website or joined the newsletter." />
      {error && <ErrorNote>Couldn&apos;t load leads. Refresh to try again.</ErrorNote>}

      {!leads ? <Loading /> : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <Tabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "Everyone", count: all.length },
                { value: "contacts", label: "Sent a message", count: all.filter((l) => l._table === "contact").length },
                { value: "subscribers", label: "Newsletter", count: all.filter((l) => l._table === "subscriber").length },
              ]}
            />
            <input style={{ ...inputStyle, maxWidth: 280 }} placeholder="Search name, email or message" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {shown.length === 0 ? <EmptyState title="No leads here" /> : (
            <Card padding={0}>
              {shown.map((l, i) => (
                <div key={`${l._table}-${l.id}`} style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                  <div
                    onClick={() => setOpen(open === l.id ? null : l.id)}
                    style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "center", cursor: "pointer" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{displayName(l)}</span>
                        {l.type && <Badge tone={TYPE_TONE[l.type] ?? "grey"}>{humanize(l.type)}</Badge>}
                      </div>
                      <div style={{ fontSize: 14, color: C.muted, marginTop: 3 }}>
                        {whereFrom(l)}{l.city ? ` · ${l.city}` : ""} · {ago(l.created_at)}
                      </div>
                    </div>
                    <Button href={`mailto:${l.email}`} size="sm">Email</Button>
                  </div>
                  {open === l.id && (
                    <div style={{ padding: "0 20px 18px", fontSize: 15, color: C.text }}>
                      <div style={{ color: C.muted, fontSize: 14, marginBottom: 8 }}>
                        {l.email}{l.phone ? ` · ${l.phone}` : ""}{l.property ? ` · About: ${l.property}` : ""}
                      </div>
                      {l.message ? <p style={{ margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{l.message}</p> : <p style={{ margin: "0 0 14px", color: C.faint }}>No message.</p>}
                      <Button size="sm" variant="danger" onClick={() => remove(l)} disabled={removing === l.id}>Remove</Button>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </Page>
  );
}
