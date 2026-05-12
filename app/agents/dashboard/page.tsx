"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyCard from "@/components/agents/PropertyCard";
import ApplicationRow from "@/components/agents/ApplicationRow";

interface Agent { id: string; name: string; email: string; }
interface Property {
  id: string; address: string; city: string; price: number;
  bedrooms: number; bathrooms: number; sqft: number | null;
  description: string; images: string[] | null;
  application_count: number; apply_link: string;
}
interface Application {
  id: string; tenant_name: string; tenant_email: string;
  status: string; ai_score: number | null; monthly_rent: number;
  created_at: string; properties: { address: string; city: string } | null;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, propsRes, appsRes] = await Promise.all([
          fetch("/api/agents/me"),
          fetch("/api/agents/properties"),
          fetch("/api/agents/applications"),
        ]);

        if (!meRes.ok) { router.push("/agents/login"); return; }

        const [me, props, apps] = await Promise.all([
          meRes.json(), propsRes.json(), appsRes.json(),
        ]);

        setAgent(me);
        setProperties(props.properties ?? []);
        setApplications(apps.applications ?? []);
      } catch {
        router.push("/agents/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function signOut() {
    await fetch("/api/agents/login", { method: "DELETE" });
    router.push("/agents/login");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0B1219", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0B1219" }}>
      {/* Top bar */}
      <div style={{
        borderBottom: "1px solid rgba(250,248,245,0.08)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>
            Agent Portal
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 400, color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Prospera Properties
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            {agent?.name}
          </p>
          <button
            onClick={signOut}
            style={{
              padding: "7px 14px",
              backgroundColor: "transparent",
              border: "1px solid rgba(250,248,245,0.15)",
              borderRadius: 6,
              color: "rgba(250,248,245,0.5)",
              fontSize: 12,
              fontFamily: "var(--font-dm-sans)",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Available Properties */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 400, color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
              Available Properties
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              {properties.length} {properties.length === 1 ? "property" : "properties"} ready to market
            </p>
          </div>

          {properties.length === 0 ? (
            <div style={{
              backgroundColor: "#111C27",
              border: "1px solid rgba(250,248,245,0.06)",
              borderRadius: 12,
              padding: "40px 24px",
              textAlign: "center",
            }}>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                No properties available right now. Check back soon.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}>
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} agentId={agent?.id ?? ""} />
              ))}
            </div>
          )}
        </section>

        {/* Applications */}
        <section>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 400, color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
              Your Applications
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              {applications.length} total application{applications.length !== 1 ? "s" : ""}
            </p>
          </div>

          {applications.length === 0 ? (
            <div style={{
              backgroundColor: "#111C27",
              border: "1px solid rgba(250,248,245,0.06)",
              borderRadius: 12,
              padding: "40px 24px",
              textAlign: "center",
            }}>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                No applications yet. Share your application links to get started.
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: "#111C27",
              border: "1px solid rgba(250,248,245,0.06)",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(250,248,245,0.08)" }}>
                    {["Applicant", "Property", "Status", "Score", "Date", ""].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "rgba(250,248,245,0.35)",
                        fontFamily: "var(--font-dm-sans)",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <ApplicationRow key={app.id} application={app} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
