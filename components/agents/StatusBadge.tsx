const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: "rgba(217,119,6,0.15)",  color: "#FCD34D", label: "Pending" },
  processing: { bg: "rgba(37,99,235,0.15)",  color: "#93C5FD", label: "Processing" },
  reviewed:   { bg: "rgba(109,40,217,0.15)", color: "#C4B5FD", label: "Reviewed" },
  approved:   { bg: "rgba(13,110,90,0.15)",  color: "#6EE7B7", label: "Approved" },
  rejected:   { bg: "rgba(185,28,28,0.15)",  color: "#FCA5A5", label: "Rejected" },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      backgroundColor: style.bg,
      color: style.color,
      fontSize: 12,
      fontFamily: "var(--font-dm-sans)",
      fontWeight: 500,
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}>
      {style.label}
    </span>
  );
}
