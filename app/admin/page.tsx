"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, SectionTitle, Grid, Stat, Card, Badge, Button, EmptyState, Loading, ErrorNote, C, ago, humanize, titleCaseAddress, type Tone } from "@/components/admin/kit";

interface HomeData {
  applications: { id: string; tenant_name: string; status: string; created_at: string; ai_summary: { verdict?: string; headline?: string } | null; properties: { address: string; title: string | null } | null }[];
  applicationsWaiting: number;
  leads: { id: string; name: string | null; email: string; type: string | null; created_at: string }[];
  leadsThisWeek: number;
  openRepairs: number;
  published: number;
  drafts: number;
  moveInsInProgress: number;
  errors: string[];
}

const VERDICT: Record<string, { label: string; tone: Tone }> = {
  strong: { label: "Strong", tone: "green" },
  worth_a_call: { label: "Worth a call", tone: "blue" },
  needs_more_info: { label: "Needs more info", tone: "amber" },
  not_a_fit: { label: "Probably not a fit", tone: "red" },
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function AdminHome() {
  const [data, setData] = useState<HomeData | null>(null);
  const [failed, setFailed] = useState(false);
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    fetch("/api/admin/home").then((r) => (r.ok ? r.json() : Promise.reject())).then(setData).catch(() => setFailed(true));
  }, []);

  return (
    <Page>
      <PageHeader
        title={greeting()}
        subtitle={today}
        actions={<Button href="/admin/properties/new" variant="primary">+ Add a listing</Button>}
      />

      {failed && <ErrorNote>Couldn&apos;t load today&apos;s numbers. Refresh to try again.</ErrorNote>}
      {data?.errors?.length ? <ErrorNote>Some numbers may be off: {data.errors.join("; ")}</ErrorNote> : null}
      {!data && !failed && <Loading />}

      {data && (
        <>
          <Grid min={200}>
            <Stat label="Applications to review" value={data.applicationsWaiting} href="/admin/applications" tone={data.applicationsWaiting ? "alert" : undefined} />
            <Stat label="New leads this week" value={data.leadsThisWeek} href="/admin/leads" />
            <Stat label="Open repairs" value={data.openRepairs} href="/admin/maintenance" tone={data.openRepairs ? "alert" : undefined} />
            <Stat label="Live listings" value={data.published} hint={data.drafts ? `${data.drafts} draft${data.drafts === 1 ? "" : "s"}` : undefined} href="/admin/properties" />
            <Stat label="Move-ins in progress" value={data.moveInsInProgress} href="/admin/move-in-coordinator" />
          </Grid>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
            <div>
              <SectionTitle right={<Link href="/admin/applications" style={{ fontSize: 14, color: C.muted }}>See all</Link>}>Applications waiting on you</SectionTitle>
              {data.applications.length === 0 ? (
                <EmptyState title="Nothing to review" body="New applications show up here with an AI summary." />
              ) : (
                <Card padding={0}>
                  {data.applications.map((a, i) => {
                    const v = a.ai_summary?.verdict ? VERDICT[a.ai_summary.verdict] : null;
                    return (
                      <Link key={a.id} href={`/admin/applications/${a.id}`} style={{ display: "block", padding: "16px 20px", borderTop: i ? `1px solid ${C.border}` : "none", textDecoration: "none", color: C.text }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{a.tenant_name}</div>
                          {v ? <Badge tone={v.tone}>{v.label}</Badge> : <Badge>{humanize(a.status)}</Badge>}
                        </div>
                        <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
                          {titleCaseAddress(a.properties?.address)} · {ago(a.created_at)}
                        </div>
                        {a.ai_summary?.headline && <div style={{ fontSize: 14, color: C.text, marginTop: 6 }}>{a.ai_summary.headline}</div>}
                      </Link>
                    );
                  })}
                </Card>
              )}
            </div>

            <div>
              <SectionTitle right={<Link href="/admin/leads" style={{ fontSize: 14, color: C.muted }}>See all</Link>}>New leads</SectionTitle>
              {data.leads.length === 0 ? (
                <EmptyState title="No new leads this week" />
              ) : (
                <Card padding={0}>
                  {data.leads.map((l, i) => (
                    <div key={l.id} style={{ padding: "16px 20px", borderTop: i ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{l.name && l.name !== "N/A" ? l.name : l.email}</div>
                        <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{humanize(l.type)} · {ago(l.created_at)}</div>
                      </div>
                      <Button href={`mailto:${l.email}`} size="sm">Email</Button>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
