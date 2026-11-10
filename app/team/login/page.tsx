"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NAVY, MUTED, BORDER, Primary, Note } from "../ui";

export default function TeamLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/agents/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error ?? "Couldn't sign in."); return; }
    router.replace("/team");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[26px] font-bold" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>Prospera FieldOps</div>
          <div className="text-sm mt-1" style={{ color: MUTED }}>Sign in to see your showings</div>
        </div>
        {error && <div className="mb-4"><Note tone="error">{error}</Note></div>}
        <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }} htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border px-4 py-3.5 text-base bg-white" style={{ borderColor: BORDER }} />
        <label className="block text-sm font-semibold mt-4 mb-2" style={{ color: NAVY }} htmlFor="pw">Password</label>
        <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border px-4 py-3.5 text-base bg-white" style={{ borderColor: BORDER }} />
        <div className="mt-6"><Primary type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Primary></div>
        <p className="text-xs text-center mt-4" style={{ color: MUTED }}>Forgot your password? Ask Ebin to resend your invite.</p>
      </form>
    </div>
  );
}
