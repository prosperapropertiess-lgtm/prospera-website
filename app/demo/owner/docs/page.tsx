import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import { DEMO_OWNER, OWNER_DOCUMENTS } from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const TYPE_ICON: Record<string, string> = {
  Lease: "description",
  Inspection: "fact_check",
  Statement: "receipt_long",
  Tax: "calculate",
  Legal: "gavel",
};

const TYPE_COLOR: Record<string, string> = {
  Lease: NAVY,
  Inspection: "#1B6B45",
  Statement: "#1a56a5",
  Tax: "#B45309",
  Legal: BURGUNDY,
};

export default function OwnerDocsPage() {
  const grouped: Record<string, typeof OWNER_DOCUMENTS> = {};
  for (const d of OWNER_DOCUMENTS) {
    if (!grouped[d.type]) grouped[d.type] = [];
    grouped[d.type].push(d);
  }

  return (
    <DemoShell mode="owner" name={DEMO_OWNER.name} initials={DEMO_OWNER.initials}>

      <Link href="/demo/owner" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, marginBottom: "8px", letterSpacing: "-0.01em" }}>Documents</h1>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, marginBottom: "28px" }}>
        {OWNER_DOCUMENTS.length} files · Securely stored
      </p>

      {Object.entries(grouped).map(([type, docs]) => (
        <div key={type} style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: TYPE_COLOR[type] }}>{TYPE_ICON[type] ?? "folder"}</span>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700 }}>{type}s</p>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", boxShadow: CARD_SHADOW }}>
            {docs.map((d, i) => (
              <div
                key={d.id}
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  borderBottom: i < docs.length - 1 ? `1px solid ${BORDER}` : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${TYPE_COLOR[type]}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: TYPE_COLOR[type] }}>{TYPE_ICON[type] ?? "folder"}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 700, color: NAVY, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED }}>{d.date} · {d.size}</p>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: MUTED, flexShrink: 0 }}>download</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ background: "rgba(31,47,58,0.04)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px 18px", textAlign: "center", marginTop: "8px" }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, lineHeight: 1.6 }}>
          New statements are posted by the 10th of each month. Tax summaries are available each January.
        </p>
      </div>
    </DemoShell>
  );
}
