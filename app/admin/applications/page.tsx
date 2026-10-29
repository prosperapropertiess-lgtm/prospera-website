"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Page, PageHeader, SectionTitle, Card, Tabs, Table, td, Badge, Button, EmptyState, Loading, ErrorNote, SuccessNote,
  Field, inputStyle, C, money, ago, titleCaseAddress, type Tone,
} from "@/components/admin/kit";

interface Application {
  id: string;
  tenant_name: string;
  tenant_email: string;
  monthly_rent: number;
  ai_score: number | null;
  ai_summary: { verdict?: string; headline?: string } | null;
  status: string;
  created_at: string;
  properties: { address: string; city: string } | null;
}

interface Listing { id: string; address: string; city: string; price: number }

const VERDICT: Record<string, { label: string; tone: Tone }> = {
  strong: { label: "Strong", tone: "green" },
  worth_a_call: { label: "Worth a call", tone: "blue" },
  needs_more_info: { label: "Needs more info", tone: "amber" },
  not_a_fit: { label: "Probably not a fit", tone: "red" },
};

const OPEN = ["pending", "processing", "reviewed"];
type Filter = "open" | "approved" | "rejected" | "all";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("open");

  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState({ tenant_name: "", tenant_email: "", property_id: "" });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState("");

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setApps(Array.isArray(d) ? d : []))
      .catch(() => { setApps([]); setError(true); });
    fetch("/api/listings").then((r) => r.json()).then((d) => setListings(d.available ?? [])).catch(() => {});
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setSendError(""); setSent(""); setSending(true);
    try {
      const res = await fetch("/api/admin/applications/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setSendError(json.error ?? "Couldn't send. Try again.");
      else {
        setSent(`Sent to ${form.tenant_email} for ${json.propertyAddress}.`);
        setForm({ tenant_name: "", tenant_email: "", property_id: "" });
      }
    } catch {
      setSendError("Couldn't send. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  const all = apps ?? [];
  const shown = all.filter((a) => filter === "all" || (filter === "open" ? OPEN.includes(a.status) : a.status === filter));

  return (
    <Page>
      <PageHeader title="Applications" subtitle="Each one comes with an AI summary. You make the call." />
      {error && <ErrorNote>Couldn&apos;t load applications. Refresh to try again.</ErrorNote>}

      {!apps ? <Loading /> : (
        <>
          <Tabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: "open", label: "To review", count: all.filter((a) => OPEN.includes(a.status)).length },
              { value: "approved", label: "Approved", count: all.filter((a) => a.status === "approved").length },
              { value: "rejected", label: "Declined", count: all.filter((a) => a.status === "rejected").length },
              { value: "all", label: "All", count: all.length },
            ]}
          />
          {shown.length === 0 ? (
            <EmptyState title={filter === "open" ? "Nothing to review" : "No applications here"} body="New applications land here a minute after they're submitted." />
          ) : (
            <Table head={["Applicant", "Home", "AI summary", "Applied", ""]}>
              {shown.map((a) => {
                const v = a.ai_summary?.verdict ? VERDICT[a.ai_summary.verdict] : null;
                return (
                  <tr key={a.id}>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{a.tenant_name}</div>
                      <div style={{ fontSize: 14, color: C.muted }}>{a.tenant_email}</div>
                    </td>
                    <td style={td}>
                      <div>{titleCaseAddress(a.properties?.address)}</div>
                      <div style={{ fontSize: 14, color: C.muted }}>{money(a.monthly_rent)}/mo</div>
                    </td>
                    <td style={{ ...td, maxWidth: 380 }}>
                      {a.status === "approved" ? <Badge tone="green">Approved</Badge>
                        : a.status === "rejected" ? <Badge>Declined</Badge>
                        : v ? <Badge tone={v.tone}>{v.label}{a.ai_score ? ` · ${a.ai_score}/10` : ""}</Badge>
                        : <Badge>Being read</Badge>}
                      {a.ai_summary?.headline && <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{a.ai_summary.headline}</div>}
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap", color: C.muted }}>{ago(a.created_at)}</td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <Button href={`/admin/applications/${a.id}`} size="sm" variant={OPEN.includes(a.status) ? "primary" : "secondary"}>
                        {OPEN.includes(a.status) ? "Review" : "Open"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </>
      )}

      <SectionTitle>Send someone the application</SectionTitle>
      <Card>
        <p style={{ margin: "0 0 18px", fontSize: 15, color: C.muted }}>
          They get an email with a button straight into the form for that home. Or share{" "}
          <Link href="/apply" target="_blank" style={{ color: C.navy, fontWeight: 600 }}>prosperaproperties.co/apply</Link>.
        </p>
        <form onSubmit={sendLink} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, alignItems: "end" }}>
          <Field label="Name">
            <input style={inputStyle} value={form.tenant_name} onChange={(e) => setForm((f) => ({ ...f, tenant_name: e.target.value }))} required />
          </Field>
          <Field label="Email">
            <input style={inputStyle} type="email" value={form.tenant_email} onChange={(e) => setForm((f) => ({ ...f, tenant_email: e.target.value }))} required />
          </Field>
          <Field label="Home">
            <select style={inputStyle} value={form.property_id} onChange={(e) => setForm((f) => ({ ...f, property_id: e.target.value }))} required>
              <option value="">Pick a home…</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>{titleCaseAddress(l.address)} · {money(l.price)}/mo</option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="primary" disabled={sending}>{sending ? "Sending…" : "Send"}</Button>
        </form>
        {sendError && <div style={{ marginTop: 12 }}><ErrorNote>{sendError}</ErrorNote></div>}
        {sent && <SuccessNote>{sent}</SuccessNote>}
      </Card>
    </Page>
  );
}
