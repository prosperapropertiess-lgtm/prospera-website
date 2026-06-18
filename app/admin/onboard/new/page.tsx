"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewOnboardPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/onboard/create", {
      method: "POST",
      headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
    })
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
      background: "#F5F4F1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 32,
          height: 32,
          border: "3px solid rgba(15,28,40,0.10)",
          borderTopColor: "#8B2030",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ margin: 0, fontSize: 14, color: "rgba(15,28,40,0.60)", fontWeight: 500 }}>
          Creating onboarding…
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
