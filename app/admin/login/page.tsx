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
    <div className="min-h-screen bg-[#060E1C] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A55A] mb-3">Prospera Properties</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-white font-light">
            Admin Panel
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#112035] p-8 rounded-xl space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#8899AA] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full px-4 py-3 border border-[#1E3050] rounded text-sm text-[#FAF8F5] outline-none focus:border-[#1A1A1A] transition-colors"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-xs text-[#C5A55A]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#8B1A1A] text-white text-xs uppercase tracking-widest rounded hover:bg-[#C5A55A] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
