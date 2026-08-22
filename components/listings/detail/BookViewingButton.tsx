"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
  /** Visual variant */
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
  label?: string;
}

export default function BookViewingButton({ property, variant = "primary", className = "", label = "Book a Viewing" }: Props) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  function handleSuccess() {
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-7 py-4 text-xs font-semibold uppercase tracking-widest rounded ${className}`}
        style={{ backgroundColor: "rgba(45,122,79,0.10)", color: "#2D7A4F", border: "1px solid rgba(45,122,79,0.2)" }}
      >
        ✓ Viewing Booked
      </span>
    );
  }

  const styles: React.CSSProperties =
    variant === "primary"
      ? { backgroundColor: "#8B2030", color: "#FAF8F5" }
      : variant === "outline"
      ? { border: "1px solid #1F2F3A", color: "#1F2F3A" }
      : { border: "1px solid rgba(250,248,245,0.35)", color: "#FAF8F5" };

  return (
    <>
      {open && (
        <BookingModal
          property={property}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
      <button
        onClick={() => setOpen(true)}
        className={`px-7 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 ${className}`}
        style={styles}
      >
        {label}
      </button>
    </>
  );
}
