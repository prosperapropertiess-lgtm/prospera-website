"use client";
import Tile from "@/components/admin/Tile";
import { PROPERTY_MGMT_DESTINATIONS } from "@/lib/admin-nav";

export default function PropertyManagementHub() {
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px 100px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1F2F3A", margin: 0, letterSpacing: "-0.02em" }}>Property Management</h1>
          <p style={{ fontSize: 14, color: "#666666", margin: "4px 0 0" }}>Tenants, maintenance, and the money</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {PROPERTY_MGMT_DESTINATIONS.map((dest) => (
            <Tile key={dest.href} href={dest.href} name={dest.name} icon={dest.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
