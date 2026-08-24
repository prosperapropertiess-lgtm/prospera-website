"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This route used to fire an empty POST straight to /api/onboard/create
// (no owner name/email/property address collected anywhere), which always
// failed validation. The real "Add Landlord" flow is the inline form on
// the list page — redirect there instead of leaving a dead end.
export default function NewOnboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/onboard?new=1");
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F4F1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: "3px solid rgba(15,28,40,0.10)",
        borderTopColor: "#8B2030",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
