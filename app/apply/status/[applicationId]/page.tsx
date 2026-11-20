import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Shell, heading, NAVY, BURGUNDY, BORDER, MUTED } from "@/components/flow/FlowUI";
import { infoRequestLink } from "@/lib/application-info-request";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Your application | Prospera Properties" }, robots: { index: false } };

// One page for the applicant from "submitted" to "keys": where they are, and what (if anything) they need to do.
const STEPS = ["Application received", "We review it", "Owner's go-ahead", "First month's rent", "Screening", "Approved, lease and keys"];

function where(stage: string | null, status: string): number {
  if (status === "approved" || stage === "move_in") return 5;
  return { review: 1, sent_to_owner: 2, owner_approved: 3, rent_requested: 3, rent_received: 4, screened: 4 }[stage ?? "review"] ?? 1;
}

const money = (n: number) => `$${Number(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function ApplicationStatusPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const db = getSupabaseAdmin();
  const ok = /^[0-9a-f-]{36}$/.test(applicationId);
  const { data: a } = ok ? await db.from("applications").select("id, tenant_name, status, stage, created_at, rent_amount_due, rent_etransfer_to, rent_reference, properties(address, city)").eq("id", applicationId).maybeSingle() : { data: null };

  if (!a) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-3" style={heading}>We couldn&apos;t find that application</h1>
        <p className="text-base" style={{ color: "#333" }}>Try the link in your email again, or call or text (519) 697-1227.</p>
      </Shell>
    );
  }

  const { data: req } = await db.from("application_info_requests").select("id, doc_types, questions").eq("application_id", a.id).is("completed_at", null).is("cancelled_at", null).order("sent_at", { ascending: false }).limit(1).maybeSingle();
  const home = a.properties as unknown as { address: string; city: string } | null;
  const first = a.tenant_name.trim().split(/\s+/)[0];
  const declined = a.status === "rejected" || a.stage === "declined" || a.stage === "owner_declined";
  const at = where(a.stage, a.status);

  let next: { title: string; body: React.ReactNode; you: boolean; action?: { label: string; href: string } };
  if (declined) next = { you: false, title: "We weren't able to move forward", body: "Thank you for applying. This home won't be going ahead with your application. You're welcome to apply for another of our homes." };
  else if (req) next = { you: true, title: "We need a little more from you", body: "Send a few more details so we can finish reviewing your application.", action: { label: "Send the details", href: infoRequestLink(req.id) } };
  else if (a.stage === "rent_requested") next = {
    you: true, title: "Send the first month's rent", body: (
      <div className="grid gap-2 mt-1">
        {[["Amount", a.rent_amount_due ? money(a.rent_amount_due) : "See your email"], ["Interac e-Transfer to", a.rent_etransfer_to ?? "See your email"], ["Message / reference", a.rent_reference ?? ""]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-white border px-4 py-3" style={{ borderColor: BORDER }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>{k}</div>
            <div className="text-base font-bold mt-0.5" style={{ color: "#222" }}>{v}</div>
          </div>
        ))}
        <p className="text-sm" style={{ color: MUTED }}>Put the reference in the e-Transfer message so we can match it to you.</p>
      </div>
    ),
  };
  else next = {
    you: false,
    title: ["", "We're reviewing your application", "The owner is looking at your application", "Good news: the owner gave the go-ahead", "Watch for an email from SingleKey", "You're approved"][at],
    body: ["", "We're checking your documents. We'll email you if we need anything else.", "We've sent the owner a summary. We'll email you as soon as they decide.", "We'll email you the payment details for the first month's rent shortly.", a.stage === "screened" ? "Your screening is back. We'll confirm your approval soon." : "It's a short screening that takes about 10 minutes. Once it's back, we confirm your approval.", "Next: we send your lease to sign and book your move-in and key pickup."][at],
  };

  return (
    <Shell>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>Your application{home ? ` · ${home.address}, ${home.city}` : ""}</p>
      <h1 className="text-3xl font-bold mb-6" style={heading}>Hi {first}</h1>

      <div className="rounded-xl border p-5 mb-8" style={{ borderColor: next.you ? BURGUNDY : BORDER, background: next.you ? "#FFF" : "#FFF" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: MUTED }}>{next.you ? "Your next step" : "What's happening"}</p>
        <p className="text-xl font-bold mb-1" style={{ color: NAVY }}>{next.title}</p>
        <div className="text-base" style={{ color: "#333" }}>{next.body}</div>
        {next.action && (
          <a href={next.action.href} className="block text-center w-full mt-4 px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded" style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>{next.action.label}</a>
        )}
      </div>

      {!declined && (
        <ol className="grid gap-0">
          {STEPS.map((s, i) => {
            const done = i < at || (i === 5 && at === 5), current = i === at && at < 5;
            return (
              <li key={s} className="flex items-center gap-3 py-2.5">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: done ? NAVY : "#FFF", color: done ? "#FFF" : current ? NAVY : MUTED, border: `2px solid ${done || current ? NAVY : BORDER}` }}>{done ? "✓" : i + 1}</span>
                <span className="text-base" style={{ color: done || current ? NAVY : MUTED, fontWeight: current ? 700 : 500 }}>{s}</span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="text-sm mt-8" style={{ color: MUTED }}>
        Applied {new Date(a.created_at).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}. Bookmark this page to check in anytime. Questions? Call or text <a href="tel:5196971227" className="underline">(519) 697-1227</a>.
      </p>
    </Shell>
  );
}
