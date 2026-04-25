"use client";

import { useState } from "react";

const ESTIMATES: Record<string, Record<number, { low: number; high: number }>> = {
  London: {
    1: { low: 1350, high: 1800 },
    2: { low: 1650, high: 2300 },
    3: { low: 2100, high: 2950 },
    4: { low: 2600, high: 3600 },
  },
  "St. Thomas": {
    1: { low: 1150, high: 1400 },
    2: { low: 1400, high: 1700 },
    3: { low: 1800, high: 2100 },
    4: { low: 2200, high: 2700 },
  },
  Sarnia: {
    1: { low: 950, high: 1250 },
    2: { low: 1250, high: 1600 },
    3: { low: 1600, high: 1950 },
    4: { low: 2000, high: 2400 },
  },
};

export default function RentEstimator() {
  const [city, setCity] = useState("");
  const [beds, setBeds] = useState<number | "">("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ low: number; high: number } | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "done">("idle");

  function estimate() {
    if (!city || !beds) return;
    const cityData = ESTIMATES[city];
    if (!cityData) return;
    const range = cityData[beds as number] || cityData[4];
    setResult(range);
  }

  async function captureEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setEmailStatus("loading");
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "landlord", preferred_city: city, source: "rent_estimator" }),
    });
    setEmailStatus("done");
    setEmailSubmitted(true);
  }

  return (
    <div id="rent-estimator" className="p-8 md:p-12" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
          Free Tool
        </p>
        <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}>
          What Could Your Property Rent For?
        </h2>
        <p className="text-sm mb-8" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
          Get an instant estimate based on current market rents in your city.
        </p>

        {/* Inputs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setResult(null); }}
            className="flex-1 px-4 py-3 text-sm outline-none border"
            style={{ borderColor: "#E8E4DF", backgroundColor: "white", color: city ? "#0A1628" : "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}
          >
            <option value="">Select city</option>
            <option value="London">London, ON</option>
            <option value="St. Thomas">St. Thomas, ON</option>
            <option value="Sarnia">Sarnia, ON</option>
          </select>

          <select
            value={beds}
            onChange={(e) => { setBeds(e.target.value ? Number(e.target.value) : ""); setResult(null); }}
            className="flex-1 px-4 py-3 text-sm outline-none border"
            style={{ borderColor: "#E8E4DF", backgroundColor: "white", color: beds !== "" ? "#0A1628" : "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}
          >
            <option value="">Bedrooms</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>

          <button
            onClick={estimate}
            disabled={!city || beds === ""}
            className="px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: "#0A1628", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Estimate
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="border bg-white p-6 mt-2" style={{ borderColor: "#E8E4DF" }}>
            <div className="flex items-baseline gap-3 mb-3">
              <p className="text-5xl font-light" style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}>
                ${result.low.toLocaleString()} – ${result.high.toLocaleString()}
              </p>
              <span className="text-sm" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>/month</span>
            </div>
            <p className="text-xs mb-6" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              Estimated range for a {beds}-bedroom in {city} based on Q1 2026 market data. Actual rent depends on unit condition, inclusions, and location within the city.
            </p>

            {emailSubmitted ? (
              <p className="text-sm" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                ✓ We'll send you a detailed analysis and keep you updated on {city} market trends.
              </p>
            ) : (
              <form onSubmit={captureEmail}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                  Want a detailed breakdown for your specific property?
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="flex-1 px-4 py-3 text-sm outline-none border"
                    style={{ borderColor: "#E8E4DF", backgroundColor: "#FAF8F5", color: "#0A1628", fontFamily: "var(--font-dm-sans)" }}
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === "loading"}
                    className="px-6 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {emailStatus === "loading" ? "..." : "Get Analysis"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
