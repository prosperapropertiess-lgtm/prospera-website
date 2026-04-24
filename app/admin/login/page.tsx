"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A55A] mb-3">Prospera Properties</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white font-light">
            Admin Panel
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#2D4A5E] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-xs text-[#7B1C1C]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0A1628] text-white text-xs uppercase tracking-widest rounded hover:bg-[#7B1C1C] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
