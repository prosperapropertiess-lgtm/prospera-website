import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
  /** Visual variant */
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
  label?: string;
}

// Sends people to the viewing request form (/view) with this home already picked.
export default function BookViewingButton({ property, variant = "primary", className = "", label = "Book a Viewing" }: Props) {
  const styles: React.CSSProperties =
    variant === "primary"
      ? { backgroundColor: "#8B2030", color: "#FAF8F5" }
      : variant === "outline"
      ? { border: "1px solid #1F2F3A", color: "#1F2F3A" }
      : { border: "1px solid rgba(250,248,245,0.35)", color: "#FAF8F5" };

  return (
    <a
      href={`/view?home=${property.id}`}
      className={`inline-block text-center px-7 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 ${className}`}
      style={styles}
    >
      {label}
    </a>
  );
}
