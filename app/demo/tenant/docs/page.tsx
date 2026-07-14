import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import { DEMO_TENANT, TENANT_DOCUMENTS } from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const TYPE_ICON: Record<string, string> = { Lease: "description", Checklist: "fact_check", Guide: "home", Info: "info" };
const TYPE_COLOR: Record<string, string> = { Lease: NAVY, Checklist: "#1B6B45", Guide: "#1a56a5", Info: "#B45309" };

export default function TenantDocsPage() {
  return (
    <DemoShell mode="tenant" name={DEMO_TENANT.name} initials={DEMO_TENANT.initials}>

      <Link href="/demo/tenant" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, marginBottom: "8px", letterSpacing: "-0.01em" }}>Documents</h1>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, marginBottom: "28px" }}>Your lease and home information</p>

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", boxShadow: CARD_SHADOW }}>
        {TENANT_DOCUMENTS.map((d, i) => (
          <div key={d.id} style={{ padding: "16px", display: "flex", alignItems: "center", gap: "14px", borderBottom: i < TENANT_DOCUMENTS.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${TYPE_COLOR[d.type]}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: TYPE_COLOR[d.type] }}>{TYPE_ICON[d.type] ?? "folder"}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "2px" }}>{d.name}</p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED }}>{d.date}</p>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: MUTED }}>download</span>
          </div>
        ))}
      </div>
    </DemoShell>
  );
}
