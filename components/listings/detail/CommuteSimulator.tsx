"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Bus, Footprints } from "lucide-react";

import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
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
    <section className="py-12 md:py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-4xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Plan Your Commute
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-4 md:mb-6 leading-tight"
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
        </div>

        <div>
          <div
            className="bg-white rounded-2xl p-6 sm:p-8"
            style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            {/* Destination badge */}
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#1F2F3A" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="5" r="2.5" stroke="#FAF8F5" strokeWidth="1.3" />
                  <path d="M6 12C6 12 1 7.5 1 5a5 5 0 0 1 10 0c0 2.5-5 7-5 7z" stroke="#FAF8F5" strokeWidth="1.3" fill="none" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                  Destination
                </p>
                <p className="text-sm font-medium" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  {destination}
                </p>
              </div>
            </div>

            {/* Input row */}
            <div className="mb-4">
              <AddressAutocomplete
                value={origin}
                onChange={(val) => setOrigin(val)}
                onPlaceSelect={(place) => setOrigin(place.formatted_address)}
                placeholder="Type your workplace, school, or any address..."
                types="establishment"
                className="w-full px-4 py-3.5 text-sm outline-none border rounded-xl"
                style={{
                  borderColor: "#D8D2C8",
                  backgroundColor: "#F7F5F2",
                  color: "#222222",
                  fontFamily: "var(--font-dm-sans)",
                }}
              />
              <p className="text-xs mt-1.5 pl-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                Select from the dropdown to get the most accurate result.
              </p>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || !origin.trim()}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80 rounded-xl disabled:opacity-40"
              style={{
                backgroundColor: "#8B2030",
                color: "#FAF8F5",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {loading ? "Calculating…" : "Calculate Commute"}
            </button>


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
        </div>
      </div>
    </section>
  );
}
