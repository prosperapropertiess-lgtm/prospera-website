export default function UnsubscribeConfirmedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F7F5F2",
        fontFamily: "var(--font-dm-sans, -apple-system, sans-serif)",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "#1F2F3A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1F2F3A",
            margin: "0 0 12px",
            fontFamily: "var(--font-cormorant, serif)",
          }}
        >
          You&rsquo;ve been unsubscribed.
        </h1>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 28px" }}>
          You won&rsquo;t receive any more emails from Prospera Properties.
          If this was a mistake, reply to any previous email or reach out directly.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 28px",
            backgroundColor: "#1F2F3A",
            color: "#FAF8F5",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Back to Prospera
        </a>
      </div>
    </div>
  );
}
