import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadMoveInReport, type ReportPhoto } from "@/lib/move-in-report";
import DownloadAllPhotos from "./DownloadAllPhotos";
import TenantComments from "./TenantComments";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Move-In Inspection Report | Prospera Properties", robots: { index: false, follow: false } };

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BG = "#F7F5F2";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const MUTED = "#666666";
const GREEN = "#2D7A4F";
const AMBER = "#B45309";

const CONDITION: Record<string, { label: string; color: string }> = {
  good: { label: "Good", color: GREEN },
  existing_damage: { label: "Existing Damage", color: BURGUNDY },
  needs_attention: { label: "Needs Attention", color: AMBER },
  not_applicable: { label: "N/A", color: MUTED },
  not_inspected: { label: "Not Checked", color: MUTED },
};
const TESTED: Record<string, string> = { working: "Working", issue: "Issue Observed", not_tested: "Not Tested" };

function fmtDate(d: string | null) {
  if (!d) return "—";
  const date = d.length === 10 ? new Date(`${d}T12:00:00`) : new Date(d);
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Photos({ photos, size = 140 }: { photos: ReportPhoto[]; size?: number }) {
  if (!photos.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))`, gap: 8, marginTop: 10 }}>
      {photos.map((p) => (
        <a key={p.path} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", aspectRatio: "4 / 3", borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}`, backgroundColor: BG }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </a>
      ))}
    </div>
  );
}

function Card({ children, id }: { children: React.ReactNode; id?: string }) {
  return <section id={id} style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22, marginBottom: 18, scrollMarginTop: 16 }}>{children}</section>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 19, fontWeight: 700, color: TEXT, margin: "0 0 12px", fontFamily: "var(--font-cormorant)" }}>{children}</h2>;
}

export default async function InspectionReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await loadMoveInReport(token);
  if (!report) notFound();

  const flagged = report.rooms.flatMap((r) =>
    r.items.filter((it) => it.condition === "existing_damage" || it.condition === "needs_attention" || it.repair_needed).map((it) => ({ room: r.name, item: it })),
  );
  const itemCount = report.rooms.reduce((n, r) => n + r.items.length, 0);

  const allPhotos = [
    ...report.rooms.flatMap((r) => [
      ...r.photos.map((p, i) => ({ url: p.url, name: `${r.name} - ${i + 1}` })),
      ...r.items.flatMap((it) => it.photos.map((p, i) => ({ url: p.url, name: `${r.name} - ${it.label} - ${i + 1}` }))),
    ]),
    ...report.appliances.flatMap((a) => a.photos.map((p, i) => ({ url: p.url, name: `Appliances - ${a.name} - ${i + 1}` }))),
  ];

  const commentTargets = report.rooms.flatMap((r) => r.items.map((it) => ({ id: it.id, label: `${r.name} — ${it.label}` })));

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-dm-sans, sans-serif)", color: TEXT }}>
      <header style={{ backgroundColor: NAVY, color: "#FAF8F5" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 26px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 8px" }}>Prospera Properties · Move-In Inspection</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px", fontFamily: "var(--font-cormorant)", lineHeight: 1.2 }}>{report.propertyAddress}</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: 0 }}>Move-in date: {fmtDate(report.moveInDate)}</p>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* Summary */}
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 16 }}>
            <Stat label="Items checked" value={String(itemCount)} />
            <Stat label="Items to note" value={String(flagged.length)} warn={flagged.length > 0} />
            <Stat label="Photos" value={String(report.photoCount)} />
            <Stat label="Keys handed over" value={String(report.keys.reduce((n, k) => n + k.quantity, 0))} />
          </div>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 4px" }}>Tenant(s): {report.tenantNames.join(", ") || "—"}</p>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 4px" }}>Owner: {report.ownerName || "—"}</p>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 16px" }}>Inspected by {report.inspectorName || "—"} · Signed {fmtDate(report.finishedAt)}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {report.pdfUrl && (
              <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: BURGUNDY, color: "#FAF8F5", padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Download Signed PDF
              </a>
            )}
            <DownloadAllPhotos photos={allPhotos} fileName={`Move-In Photos - ${report.propertyAddress}`} />
          </div>
        </Card>

        {report.role === "tenant" && (
          <TenantComments token={token} open={report.commentsOpen} closesAt={report.commentsCloseAt} targets={commentTargets} existing={report.comments} />
        )}
        {report.role === "owner" && report.comments.length > 0 && (
          <Card>
            <H2>Tenant Comments</H2>
            {report.comments.map((c) => (
              <div key={c.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 0" }}>
                <p style={{ fontSize: 13, color: MUTED, margin: "0 0 4px" }}>{[c.room_name, c.item_label].filter(Boolean).join(" — ") || "General"} · {fmtDate(c.created_at)}</p>
                <p style={{ fontSize: 15, margin: 0, whiteSpace: "pre-wrap" }}>{c.body}</p>
                <Photos photos={c.photos} size={110} />
              </div>
            ))}
          </Card>
        )}

        {/* Items to note — what matters most, first */}
        {flagged.length > 0 && (
          <Card>
            <H2>Items to Note ({flagged.length})</H2>
            <p style={{ fontSize: 14, color: MUTED, margin: "0 0 8px" }}>Existing damage or anything that needs attention, recorded on move-in day.</p>
            {flagged.map(({ room, item }) => (
              <div key={item.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{room} — {item.label}</span>
                  <ConditionBadge condition={item.condition} />
                </div>
                {item.repair_needed && <p style={{ fontSize: 13, color: BURGUNDY, fontWeight: 600, margin: "6px 0 0" }}>Repair needed</p>}
                {item.notes && <p style={{ fontSize: 14, color: TEXT, margin: "6px 0 0" }}>{item.notes}</p>}
                <Photos photos={item.photos} size={160} />
              </div>
            ))}
          </Card>
        )}

        {/* Jump list */}
        <nav style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {report.rooms.map((r) => (
            <a key={r.id} href={`#${slug(r.name)}`} style={{ fontSize: 13, fontWeight: 600, color: NAVY, border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", borderRadius: 8, padding: "8px 12px", textDecoration: "none" }}>{r.name}</a>
          ))}
        </nav>

        {/* Room by room */}
        {report.rooms.map((r) => (
          <Card key={r.id} id={slug(r.name)}>
            <H2>{r.name}</H2>
            <Photos photos={r.photos} />
            {r.items.map((it) => (
              <div key={it.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 15 }}>{it.label}</span>
                  <ConditionBadge condition={it.condition} />
                </div>
                {it.notes && <p style={{ fontSize: 14, color: MUTED, margin: "4px 0 0" }}>{it.notes}</p>}
                <Photos photos={it.photos} size={110} />
              </div>
            ))}
          </Card>
        ))}

        {report.appliances.length > 0 && (
          <Card>
            <H2>Appliances</H2>
            {report.appliances.map((a) => (
              <div key={a.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15 }}>{a.name}</span>
                  <span style={{ fontSize: 13, color: MUTED }}>{CONDITION[a.cosmetic_condition]?.label ?? a.cosmetic_condition} · {TESTED[a.test_status] ?? a.test_status}</span>
                </div>
                <Photos photos={a.photos} size={110} />
              </div>
            ))}
          </Card>
        )}

        {(report.keys.length > 0 || report.meterReadings.length > 0) && (
          <Card>
            {report.keys.length > 0 && (
              <>
                <H2>Keys, Fobs &amp; Remotes</H2>
                {report.keys.map((k, i) => <p key={i} style={{ fontSize: 15, margin: "0 0 6px" }}>{k.item_name} — {k.quantity}</p>)}
              </>
            )}
            {report.meterReadings.length > 0 && (
              <div style={{ marginTop: report.keys.length ? 18 : 0 }}>
                <H2>Meter Readings</H2>
                {report.meterReadings.map((m, i) => <p key={i} style={{ fontSize: 15, margin: "0 0 6px" }}>{m.utility}: {m.reading}</p>)}
              </div>
            )}
          </Card>
        )}

        <Card>
          <H2>Signatures</H2>
          {report.signatures.map((s, i) => (
            <p key={i} style={{ fontSize: 15, margin: "0 0 6px" }}>
              {s.signer_name} <span style={{ color: MUTED }}>— {s.signer_role === "tenant" ? "Tenant" : "Inspector"}, {fmtDate(s.signed_at)}</span>
            </p>
          ))}
        </Card>

        <p style={{ fontSize: 13, color: MUTED, textAlign: "center", marginTop: 24 }}>Questions about this report? Call or text (519) 697-1227.</p>
      </main>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ backgroundColor: BG, borderRadius: 10, padding: "12px 14px" }}>
      <p style={{ fontSize: 24, fontWeight: 700, color: warn ? AMBER : NAVY, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{label}</p>
    </div>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const c = CONDITION[condition] ?? { label: condition, color: MUTED };
  return <span style={{ fontSize: 13, fontWeight: 700, color: c.color, whiteSpace: "nowrap" }}>{c.label}</span>;
}
