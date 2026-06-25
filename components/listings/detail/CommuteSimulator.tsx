"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Bus, Footprints } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface CommuteResult {
  driving?: { duration: string; distance: string };
  transit?: { duration: string; distance: string };
  walking?: { duration: string; distance: string };
  error?: string;
}

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  duration: string;
  distance: string;
  delay: number;
}

function ResultCard({ icon, label, duration, distance, delay }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.23, 1, 0.32, 1] }}
      className="flex-1 rounded-xl p-6 text-center min-w-[120px]"
      style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
    >
      <div className="flex justify-center mb-3" style={{ color: "#1F2F3A" }}>{icon}</div>
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold mb-1"
        style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
      >
        {duration}
      </p>
      <p
        className="text-xs"
        style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
      >
        {distance}
      </p>
    </motion.div>
  );
}

export default function CommuteSimulator({ property }: Props) {
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommuteResult | null>(null);

  const destination = `${property.address}, ${property.city}, ON`;

  async function handleCalculate() {
    if (!origin.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/listings/commute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: origin.trim(), destination }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Unable to calculate commute. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Plan Your Commute
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-6 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            Commute Simulator
          </h2>
          <p
            className="text-base text-center mb-12"
            style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            How far is this from your workplace, school, or anywhere else?
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            className="bg-white rounded-xl p-8"
            style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                placeholder="Enter your workplace or address..."
                className="flex-1 px-4 py-3 text-sm outline-none border rounded-lg"
                style={{
                  borderColor: "#D8D2C8",
                  backgroundColor: "#F7F5F2",
                  color: "#222222",
                  fontFamily: "var(--font-dm-sans)",
                }}
              />
              <button
                onClick={handleCalculate}
                disabled={loading || !origin.trim()}
                className="px-7 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 rounded-lg disabled:opacity-50"
                style={{
                  backgroundColor: "#8B2030",
                  color: "#FAF8F5",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {loading ? "Calculating..." : "Calculate"}
              </button>
            </div>

            <p
              className="text-xs mb-6"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              Destination: {destination}
            </p>

            <AnimatePresence mode="wait">
              {result?.error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-center py-4"
                  style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                >
                  {result.error}
                </motion.p>
              )}

              {result && !result.error && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  {result.driving && (
                    <ResultCard
                      icon={<Car size={22} />}
                      label="Driving"
                      duration={result.driving.duration}
                      distance={result.driving.distance}
                      delay={0}
                    />
                  )}
                  {result.transit && (
                    <ResultCard
                      icon={<Bus size={22} />}
                      label="Transit"
                      duration={result.transit.duration}
                      distance={result.transit.distance}
                      delay={0.08}
                    />
                  )}
                  {result.walking && (
                    <ResultCard
                      icon={<Footprints size={22} />}
                      label="Walking"
                      duration={result.walking.duration}
                      distance={result.walking.distance}
                      delay={0.16}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
