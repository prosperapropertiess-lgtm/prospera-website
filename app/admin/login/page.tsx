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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Prospera Properties</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light" style={{ color: "#1F2F3A" }}>
            Admin Panel
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border space-y-5" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full px-4 py-3 border rounded text-sm outline-none focus:border-[#1F2F3A] transition-colors"
              style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white text-xs uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
