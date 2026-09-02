"use client";
import { useState } from "react";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

export default function ShareBar({ property }: Props) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : `https://www.prosperaproperties.co/listings/${property.id}`;
  const title = `${property.title}, ${property.city}, ON | $${property.price?.toLocaleString()}/mo`;
  const text = `Check out this ${property.bedrooms} bed, ${property.bathrooms} bath rental in ${property.city} for $${property.price?.toLocaleString()}/mo`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const shares = [
    {
      label: "Copy Link",
      action: copyLink,
      icon: copied ? (
        <svg width="16" height="16" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
      ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      ),
      activeLabel: "Copied!",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>,
    },
  ];

  return (
    <section className="py-5 px-5 sm:px-8" style={{ borderBottom: "1px solid #E8E4DE" }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-widest font-medium shrink-0" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          Share
        </span>
        <div className="flex items-center gap-2">
          {shares.map((s) =>
            "action" in s && s.action ? (
              <button
                key={s.label}
                onClick={s.action}
                title={s.label}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg text-xs transition-all hover:opacity-70"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: copied && s.activeLabel ? "#4ade80" : "#333333" }}
              >
                {s.icon}
                <span className="hidden sm:inline">{copied && s.activeLabel ? s.activeLabel : s.label}</span>
              </button>
            ) : (
              <a
                key={s.label}
                href={"href" in s ? s.href : "#"}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-lg text-xs transition-all hover:opacity-70"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: "#333333" }}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}
