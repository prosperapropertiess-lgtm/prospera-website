export default function SubmittedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F8FAFC",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "var(--font-dm-sans, sans-serif)",
    }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: "48px 40px",
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        {/* Checkmark */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: "#F0FDF4",
          border: "2px solid #BBF7D0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 32,
        }}>
          ✓
        </div>

        {/* Heading */}
        <h1 style={{
          margin: "0 0 12px",
          fontSize: 26,
          fontWeight: 700,
          color: "#1F2F3A",
          lineHeight: 1.25,
        }}>
          Application Received
        </h1>

        <p style={{
          margin: "0 0 32px",
          fontSize: 15,
          color: "#475569",
          lineHeight: 1.6,
        }}>
          Thanks for applying. We&apos;ll review your application and get back to you by email within 2–3 business days.
        </p>

        {/* Divider */}
        <div style={{
          borderTop: "1px solid #E2E8F0",
          paddingTop: 28,
          marginTop: 8,
        }}>
          <p style={{
            margin: 0,
            fontSize: 13,
            color: "#94A3B8",
          }}>
            Questions? Email us at{" "}
            <a
              href="mailto:hello@prosperaproperties.co"
              style={{ color: "#8B2030", textDecoration: "none" }}
            >
              hello@prosperaproperties.co
            </a>
          </p>
        </div>

        {/* Branding */}
        <p style={{
          margin: "24px 0 0",
          fontSize: 12,
          color: "#CBD5E1",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}>
          Prospera Properties
        </p>
      </div>
    </div>
  );
}
