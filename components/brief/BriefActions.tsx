"use client";
import { useState } from "react";

const NAVY = "#1F2F3A";
const BORDER = "#D8D2C8";

/** Top bar on screen only: download as PDF (browser print), copy the share link. */
export default function BriefActions({ shareUrl, agentUrl, agent, title }: { shareUrl: string; agentUrl?: string; agent?: boolean; title: string }) {
  const [copied, setCopied] = useState("");
  const copy = async (url: string, which: string) => {
    try { await navigator.clipboard.writeText(url); setCopied(which); setTimeout(() => setCopied(""), 2000); } catch {}
  };
  return (
    <div className="brief-actions sticky top-0 z-10 bg-white border-b" style={{ borderColor: BORDER }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { document.title = title; window.print(); }}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
          Download PDF
        </button>
        <button type="button" onClick={() => copy(shareUrl, "renter")} className="px-4 py-2.5 text-sm font-medium rounded border" style={{ borderColor: BORDER, color: NAVY }}>
          {copied === "renter" ? "Copied" : "Copy renter link"}
        </button>
        {agentUrl && (
          <button type="button" onClick={() => copy(agentUrl, "agent")} className="px-4 py-2.5 text-sm font-medium rounded border" style={{ borderColor: BORDER, color: NAVY }}>
            {copied === "agent" ? "Copied" : "Copy agent link"}
          </button>
        )}
        {agent && <span className="text-sm ml-auto" style={{ color: "#8B2030" }}>Agent version</span>}
      </div>
    </div>
  );
}
