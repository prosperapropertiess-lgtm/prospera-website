import { createClient } from "@supabase/supabase-js";

const STATUS_INFO: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  pending:    { label: "Received", desc: "We have your application and it's in the queue.", color: "#92400E", bg: "#FEF3C7" },
  processing: { label: "Under Review", desc: "Your documents are being verified. This usually takes 1–2 business days.", color: "#1E40AF", bg: "#DBEAFE" },
  reviewed:   { label: "Decision Pending", desc: "Your file has been reviewed. A final decision is being made.", color: "#5B21B6", bg: "#EDE9FE" },
  approved:   { label: "Approved", desc: "Congratulations — your application has been approved! Check your email for next steps.", color: "#065F46", bg: "#D1FAE5" },
  rejected:   { label: "Not Approved", desc: "Unfortunately we were unable to move forward with your application at this time.", color: "#991B1B", bg: "#FEE2E2" },
};

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: application } = await supabase
    .from("applications")
    .select("tenant_name, status, created_at, properties(address, city)")
    .eq("id", applicationId)
    .maybeSingle();

  const FONT = "var(--font-dm-sans, sans-serif)";

  if (!application) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
          <h1 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700, color: "#1F2F3A" }}>Application not found</h1>
          <p style={{ margin: 0, fontSize: 14, color: "#64748B" }}>Double-check your link or contact us at hello@prosperaproperties.co</p>
        </div>
      </div>
    );
  }

  const info = STATUS_INFO[application.status] ?? STATUS_INFO.pending;
  const property = application.properties as unknown as { address: string; city: string } | null;

  const steps = ["pending", "processing", "reviewed", "approved"];
  const currentStep = steps.indexOf(application.status === "rejected" ? "reviewed" : application.status);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT }}>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: "40px", maxWidth: 520, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Application Status</p>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#1F2F3A" }}>{application.tenant_name}</h1>
          {property && (
            <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>{property.address}, {property.city}</p>
          )}
        </div>

        {/* Status badge */}
        <div style={{
          padding: "16px 20px",
          backgroundColor: info.bg,
          borderRadius: 10,
          marginBottom: 28,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: info.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{info.label}</p>
          <p style={{ margin: 0, fontSize: 14, color: info.color, opacity: 0.8, lineHeight: 1.5 }}>{info.desc}</p>
        </div>

        {/* Progress steps */}
        {application.status !== "rejected" && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {["Received", "Verifying", "Decision", "Approved"].map((label, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      {i > 0 && <div style={{ flex: 1, height: 2, backgroundColor: i <= currentStep ? "#1F2F3A" : "#E2E8F0" }} />}
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: done ? "#1F2F3A" : "#F1F5F9",
                        border: active ? "2px solid #1F2F3A" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: done ? "#FFFFFF" : "#94A3B8",
                      }}>
                        {done && i < currentStep ? "✓" : i + 1}
                      </div>
                      {i < 3 && <div style={{ flex: 1, height: 2, backgroundColor: i < currentStep ? "#1F2F3A" : "#E2E8F0" }} />}
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 10, color: done ? "#1F2F3A" : "#94A3B8", fontWeight: done ? 600 : 400, textAlign: "center" }}>{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 20, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#94A3B8" }}>
            Submitted {new Date(application.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
            {" · "}Questions? <a href="mailto:hello@prosperaproperties.co" style={{ color: "#8B2030", textDecoration: "none" }}>hello@prosperaproperties.co</a>
          </p>
        </div>

        <p style={{ margin: "20px 0 0", fontSize: 11, color: "#E2E8F0", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
          Prospera Properties
        </p>
      </div>
    </div>
  );
}
