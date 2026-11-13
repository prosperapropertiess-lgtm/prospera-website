import Link from "next/link";
import { NAVY, BORDER, MUTED, heading, Shell } from "@/components/flow/FlowUI";

export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const statusUrl = id ? `/apply/status/${id}` : null;

  return (
    <Shell>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 view-pop" style={{ backgroundColor: NAVY }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={heading}>Application sent.</h1>
      <p className="text-base mb-8" style={{ color: "#333" }}>
        Thanks for applying. We&apos;ll review your application and get back to you within 2–3 business days.
      </p>

      {statusUrl && (
        <div className="rounded-xl border bg-white p-5 mb-8" style={{ borderColor: BORDER }}>
          <p className="text-lg font-semibold mb-1" style={{ color: NAVY }}>Check where it&apos;s at</p>
          <p className="text-sm mb-4" style={{ color: "#333" }}>Save this link. It shows your application&apos;s status any time.</p>
          <Link href={statusUrl}
            className="block w-full text-center px-6 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
            Track my application
          </Link>
        </div>
      )}

      <p className="text-sm" style={{ color: MUTED }}>
        Questions? Call or text (519) 697-1227, or email{" "}
        <a href="mailto:hello@prosperaproperties.co" className="underline" style={{ color: NAVY }}>hello@prosperaproperties.co</a>.
      </p>
    </Shell>
  );
}
