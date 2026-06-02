"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  name: string;
  city: string;
  submitted_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return "recently";
}

export default function RentActivityToast() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("rent_toast_shown")) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/rent/recent-activity");
        const json = await res.json();
        if (json.activity) {
          setActivity(json.activity);
          setVisible(true);
          sessionStorage.setItem("rent_toast_shown", "1");

          // Auto-dismiss after 7 seconds
          setTimeout(() => setVisible(false), 7000);
        }
      } catch {
        // silently fail — never show an error to the user
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && activity && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{
            position: "fixed",
            bottom: 28,
            left: 20,
            zIndex: 90,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DF",
            borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            padding: "12px 16px",
            maxWidth: 290,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          {/* Status dot — pulses twice then settles */}
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              flexShrink: 0,
              marginTop: 5,
              animation: "toast-dot-pulse 1.8s ease-out 2 forwards",
            }}
          />
          <style>{`
            @keyframes toast-dot-pulse {
              0%   { opacity: 1; transform: scale(1); }
              50%  { opacity: 0.5; transform: scale(1.4); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>

          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 13,
              color: "#1F2F3A",
              fontFamily: "var(--font-dm-sans)",
              lineHeight: 1.4,
              margin: 0,
            }}>
              <strong>{activity.name}</strong> from {activity.city} completed a rental analysis
            </p>
            <p style={{
              fontSize: 11,
              color: "#999999",
              fontFamily: "var(--font-dm-sans)",
              margin: "3px 0 0",
            }}>
              {timeAgo(activity.submitted_at)}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setVisible(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#BBBBBB",
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
