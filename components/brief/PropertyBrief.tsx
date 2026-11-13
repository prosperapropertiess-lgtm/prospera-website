// The one-page property brief. Renter version for emailing after viewings,
// printing for neighbours, and sharing; agent version adds access details.
import { briefSections, availableLine, fullAddress, type PropertyRow, type Line } from "@/lib/property-brief";
import BriefActions from "./BriefActions";

const NAVY = "#1F2F3A";
const BORDER = "#D8D2C8";
const MUTED = "#666666";

function Section({ title, lines }: { title: string; lines: Line[] }) {
  if (!lines.length) return null;
  return (
    <section className="brief-block">
      <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MUTED }}>{title}</h2>
      <dl className="rounded-xl border bg-white" style={{ borderColor: BORDER }}>
        {lines.map((l, i) => (
          <div key={l.label} className={`flex gap-4 px-4 py-2.5 ${i ? "border-t" : ""}`} style={{ borderColor: BORDER }}>
            <dt className="w-36 shrink-0 text-sm" style={{ color: MUTED }}>{l.label}</dt>
            <dd className="text-sm font-medium" style={{ color: "#222" }}>{l.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function PropertyBrief({ p, links, agent, shareUrl, agentUrl }: {
  p: PropertyRow;
  links: { viewing: string; apply: string; listing: string; qr: string };
  agent?: boolean;
  shareUrl: string;
  agentUrl?: string;
}) {
  const s = briefSections(p);
  const photos = ((p.images ?? []) as string[]).slice(0, 5);
  const intro = (p.description as string | null)?.split(/\n\s*\n/)[0]?.trim();

  return (
    <div className="min-h-screen brief-page" style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <BriefActions shareUrl={shareUrl} agentUrl={agentUrl} agent={agent} title={`${fullAddress(p)} property brief`} />

      <main className="brief-sheet max-w-3xl mx-auto px-5 sm:px-8 py-8 grid gap-6">
        {agent && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: NAVY, color: "#FAF8F5" }}>
            <b>Agent brief.</b> Includes access details. Don&apos;t share this version with renters.
          </div>
        )}

        <header className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>Prospera Properties</span>
            <span className="text-sm" style={{ color: MUTED }}>Property brief</span>
          </div>
          {photos[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[0]} alt="" className="w-full h-64 sm:h-80 object-cover rounded-2xl" />
          )}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm mb-1" style={{ color: MUTED }}>Considering living here?</p>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight capitalize" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>{fullAddress(p)}</h1>
              <p className="text-base mt-1" style={{ color: "#333" }}>{p.city}, Ontario · {availableLine(p)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: NAVY }}>${Number(p.price).toLocaleString()}<span className="text-base font-normal" style={{ color: MUTED }}>/month</span></p>
              {s.monthly > Number(p.price) && <p className="text-sm" style={{ color: MUTED }}>About ${Math.round(s.monthly).toLocaleString()} with utilities</p>}
            </div>
          </div>
          {intro && <p className="text-base leading-relaxed" style={{ color: "#333" }}>{intro}</p>}
        </header>

        {agent && (
          <Section title="Showing and access (agents only)" lines={[
            { label: "Right now", value: p.occupancy === "occupied" ? "Occupied. Give the tenant notice before every showing." : p.occupancy === "vacant" ? "Vacant" : "Not recorded" },
            { label: "Getting in", value: p.access_instructions || "Not recorded. Ask Ebin before the showing." },
            ...(p.showing_notes ? [{ label: "Notes", value: p.showing_notes as string }] : []),
          ]} />
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          <Section title="The home" lines={s.home} />
          <Section title="Inside" lines={s.inside} />
        </div>
        <Section title="What it costs to live here" lines={s.costs} />
        <div className="grid sm:grid-cols-2 gap-6">
          <Section title="Parking and outside" lines={s.outside} />
          <Section title="Good to know" lines={s.rules} />
        </div>
        {p.renter_notes && (
          <section className="brief-block">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MUTED }}>Also worth knowing</h2>
            <p className="rounded-xl border bg-white px-4 py-3 text-sm leading-relaxed whitespace-pre-line" style={{ borderColor: BORDER, color: "#222" }}>{p.renter_notes}</p>
          </section>
        )}
        <Section title="Around the neighbourhood" lines={s.nearby} />

        {photos.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 brief-block">
            {photos.slice(1).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="w-full h-28 object-cover rounded-xl" />
            ))}
          </div>
        )}

        <section className="brief-block rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center" style={{ backgroundColor: NAVY, color: "#FAF8F5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={links.qr} alt="QR code to request a viewing" className="w-28 h-28 rounded-lg bg-white p-2 shrink-0" />
          <div className="grid gap-2 text-sm">
            <p className="text-lg font-semibold">Want to see it, or live here?</p>
            <p style={{ color: "rgba(250,248,245,0.8)" }}>Scan the code or visit the link to request a viewing. Already seen it? Apply online in about 5 minutes.</p>
            <p><span style={{ color: "rgba(250,248,245,0.6)" }}>Viewing:</span> <a href={links.viewing} className="underline">{links.viewing.replace("https://www.", "")}</a></p>
            <p><span style={{ color: "rgba(250,248,245,0.6)" }}>Apply:</span> <a href={links.apply} className="underline">{links.apply.replace("https://www.", "").replace(/\/apply\/.*/, "/apply")}</a></p>
            <p style={{ color: "rgba(250,248,245,0.8)" }}>Questions? Call or text (519) 697-1227.</p>
          </div>
        </section>

        <p className="text-xs text-center" style={{ color: MUTED }}>
          Know someone who might like to live here? Pass this along. Details are as provided by the owner and can change. Prospera Properties, London, Ontario.
        </p>
      </main>

      <style>{`
        @media print {
          @page { size: letter; margin: 0.45in; }
          html, body, .brief-page { background: #fff !important; }
          body * { visibility: hidden; }
          .brief-sheet, .brief-sheet * { visibility: visible; }
          .brief-actions { display: none !important; }
          .brief-sheet { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; max-width: none !important; gap: 14px !important; }
          .brief-block { break-inside: avoid; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
