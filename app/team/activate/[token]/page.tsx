"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NAVY, MUTED, BORDER, Primary, Note } from "../../ui";

export default function Activate() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) { setError("Use at least 8 characters."); return; }
    if (pw !== pw2) { setError("The two passwords don't match."); return; }
    setBusy(true); setError(null);
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "activate", token, password: pw }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error ?? "Couldn't set up your account."); return; }
    router.replace("/team/availability");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[26px] font-bold" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>Welcome to the team</div>
          <div className="text-sm mt-1" style={{ color: MUTED }}>Pick a password. Next, you&apos;ll add the times you&apos;re free.</div>
        </div>
        {error && <div className="mb-4"><Note tone="error">{error}</Note></div>}
        <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }} htmlFor="pw">New password</label>
        <input id="pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full rounded-xl border px-4 py-3.5 text-base bg-white" style={{ borderColor: BORDER }} />
        <label className="block text-sm font-semibold mt-4 mb-2" style={{ color: NAVY }} htmlFor="pw2">Type it again</label>
        <input id="pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="w-full rounded-xl border px-4 py-3.5 text-base bg-white" style={{ borderColor: BORDER }} />
        <div className="mt-6"><Primary type="submit" disabled={busy}>{busy ? "Setting up…" : "Set up my account"}</Primary></div>
      </form>
    </div>
  );
}
