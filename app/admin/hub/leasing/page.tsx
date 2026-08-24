"use client";
import { useState, useEffect } from "react";
import Tile from "@/components/admin/Tile";
import { LEASING_DESTINATIONS } from "@/lib/admin-nav";

interface LiveData {
  properties: number | null;
  leads: number | null;
  activeCampaigns: number | null;
  uncontactedLeads: number | null;
  applicationsAwaitingDecision: number | null;
}

const IN_PROGRESS_APP_STAGES = ["LINK_SENT", "PRELIMINARY_SUBMITTED", "UNDER_REVIEW", "AWAITING_DOCUMENTS", "VERIFIED"];

const COUNTS: Record<string, (live: LiveData) => { count: number | null; countLabel: string | null; alert?: boolean }> = {
  "/admin/leasing": (l) => ({ count: l.activeCampaigns, countLabel: "open now" }),
  "/admin/leasing/verification": (l) => ({ count: l.applicationsAwaitingDecision, countLabel: "in progress", alert: (l.applicationsAwaitingDecision ?? 0) > 0 }),
  "/admin/properties": (l) => ({ count: l.properties, countLabel: "homes" }),
  "/admin/leads": (l) => ({ count: l.leads, countLabel: "total" }),
};

export default function LeasingHub() {
  const [live, setLive] = useState<LiveData>({ properties: null, leads: null, activeCampaigns: null, uncontactedLeads: null, applicationsAwaitingDecision: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [propsRes, leadsRes, leasingRes, appsRes] = await Promise.allSettled([
        fetch("/api/admin/properties/list").then((r) => r.json()),
        fetch("/api/admin/leads").then((r) => r.json()),
        fetch("/api/admin/leasing/command").then((r) => r.json()),
        fetch("/api/admin/leasing/applications").then((r) => r.json()),
      ]);
      setLive({
        properties: propsRes.status === "fulfilled" && Array.isArray(propsRes.value) ? propsRes.value.length : null,
        leads: leadsRes.status === "fulfilled" && typeof leadsRes.value?.total === "number" ? leadsRes.value.total : null,
        activeCampaigns: leasingRes.status === "fulfilled" ? (leasingRes.value?.metrics?.active_campaigns ?? leasingRes.value?.active_campaigns ?? null) : null,
        uncontactedLeads: leasingRes.status === "fulfilled" ? (leasingRes.value?.metrics?.uncontacted_leads ?? leasingRes.value?.uncontacted_leads ?? null) : null,
        applicationsAwaitingDecision: appsRes.status === "fulfilled" && Array.isArray(appsRes.value)
          ? appsRes.value.filter((a: { stage: string }) => IN_PROGRESS_APP_STAGES.includes(a.stage)).length
          : null,
      });
      setLoading(false);
    }
    load();
  }, []);

  const uncontacted = live.uncontactedLeads ?? 0;

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px 100px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1F2F3A", margin: 0, letterSpacing: "-0.02em" }}>Leasing</h1>
          <p style={{ fontSize: 14, color: "#666666", margin: "4px 0 0" }}>Fill vacancies — leads, showings, applications, new landlords</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {LEASING_DESTINATIONS.map((dest) => {
            const dyn = COUNTS[dest.href]?.(live);
            const isRentals = dest.href === "/admin/leasing";
            return (
              <Tile
                key={dest.href}
                href={dest.href}
                name={dest.name}
                icon={dest.icon}
                count={loading ? null : dyn?.count ?? null}
                countLabel={isRentals && !loading && uncontacted > 0 ? `${uncontacted} leads waiting` : dyn?.countLabel ?? null}
                alert={isRentals && !loading && uncontacted > 0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
