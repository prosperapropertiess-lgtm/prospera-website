"use client";
import { useState, useEffect } from "react";
import Tile from "@/components/admin/Tile";
import { LEASING_DESTINATIONS } from "@/lib/admin-nav";

interface LiveData {
  properties: number | null;
  leads: number | null;
  applications: number | null;
}

const COUNTS: Record<string, (live: LiveData) => { count: number | null; countLabel: string | null; alert?: boolean }> = {
  "/admin/properties": (l) => ({ count: l.properties, countLabel: "homes" }),
  "/admin/leads": (l) => ({ count: l.leads, countLabel: "this week" }),
  "/admin/applications": (l) => ({ count: l.applications, countLabel: "to review", alert: (l.applications ?? 0) > 0 }),
};

export default function LeasingHub() {
  const [live, setLive] = useState<LiveData>({ properties: null, leads: null, applications: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/home").then((r) => r.json()).then((d) => {
      setLive({
        properties: typeof d?.published === "number" ? d.published + (d.drafts ?? 0) : null,
        leads: typeof d?.leadsThisWeek === "number" ? d.leadsThisWeek : null,
        applications: typeof d?.applicationsWaiting === "number" ? d.applicationsWaiting : null,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px 100px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1F2F3A", margin: 0, letterSpacing: "-0.02em" }}>Leasing</h1>
          <p style={{ fontSize: 14, color: "#666666", margin: "4px 0 0" }}>Listings, applications, leads, and new landlords</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {LEASING_DESTINATIONS.map((dest) => {
            const dyn = COUNTS[dest.href]?.(live);
            return (
              <Tile
                key={dest.href}
                href={dest.href}
                name={dest.name}
                icon={dest.icon}
                count={loading ? null : dyn?.count ?? null}
                countLabel={dyn?.countLabel ?? null}
                alert={!loading && !!dyn?.alert}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
