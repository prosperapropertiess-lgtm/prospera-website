"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const PIN_LENGTH = 4;

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const submit = useCallback(async (value: string) => {
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: value }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(true);
      setShake(true);
      setLoading(false);
      setTimeout(() => setShake(false), 400);
      setTimeout(() => setPin(""), 400);
    }
  }, [router]);

  function appendDigit(d: string) {
    if (loading || pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === PIN_LENGTH) submit(next);
  }

  function backspace() {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans, sans-serif)" }}
      onClick={() => hiddenInputRef.current?.focus()}
    >
      {/* Invisible input to capture a physical keyboard */}
      <input
        ref={hiddenInputRef}
        type="tel"
        inputMode="numeric"
        value={pin}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
          setPin(digits);
          setError(false);
          if (digits.length === PIN_LENGTH) submit(digits);
        }}
        autoFocus
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
        aria-label="Enter PIN"
      />

      <div className="w-full max-w-xs text-center">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "#8B2030" }}>Prospera Properties</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-10" style={{ color: "#1F2F3A" }}>
          Enter PIN
        </h1>

        {/* Dots */}
        <div
          className="flex items-center justify-center gap-4 mb-4"
          style={{
            animation: shake ? "pin-shake 0.4s ease" : undefined,
          }}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: error ? "#8B2030" : filled ? "#1F2F3A" : "transparent",
                  border: `2px solid ${error ? "#8B2030" : "#D8D2C8"}`,
                  transition: "all 0.15s ease",
                  transform: filled ? "scale(1)" : "scale(0.85)",
                }}
              />
            );
          })}
        </div>

        <p className="text-xs mb-8" style={{ color: error ? "#8B2030" : "#999999", minHeight: 16 }}>
          {error ? "Wrong PIN — try again" : loading ? "Checking…" : " "}
        </p>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              disabled={loading}
              onClick={() => appendDigit(d)}
              className="rounded-2xl transition-transform active:scale-95"
              style={{
                aspectRatio: "1",
                fontSize: 22,
                fontWeight: 600,
                color: "#1F2F3A",
                backgroundColor: "#FFFFFF",
                border: "1px solid #D8D2C8",
                cursor: "pointer",
              }}
            >
              {d}
            </button>
          ))}
          <div />
          <button
            type="button"
            disabled={loading}
            onClick={() => appendDigit("0")}
            className="rounded-2xl transition-transform active:scale-95"
            style={{
              aspectRatio: "1",
              fontSize: 22,
              fontWeight: 600,
              color: "#1F2F3A",
              backgroundColor: "#FFFFFF",
              border: "1px solid #D8D2C8",
              cursor: "pointer",
            }}
          >
            0
          </button>
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={backspace}
            className="rounded-2xl transition-transform active:scale-95"
            style={{
              aspectRatio: "1",
              fontSize: 18,
              color: "#666666",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              opacity: pin.length === 0 ? 0.3 : 1,
            }}
          >
            ⌫
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
