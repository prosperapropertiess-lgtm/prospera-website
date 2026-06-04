"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /admin/onboard/new immediately creates a session and redirects to the checklist
export default function NewOnboardPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/onboard/create", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.token) {
          router.replace(`/admin/onboard/${d.token}`);
        } else {
          router.replace("/admin/onboard");
        }
      })
      .catch(() => router.replace("/admin/onboard"));
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080c14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: 24, height: 24,
        border: "2px solid rgba(255,255,255,0.1)",
        borderTopColor: "#8B2030",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
