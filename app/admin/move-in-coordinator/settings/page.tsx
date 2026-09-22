"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";
const GREEN = "#2D7A4F";

const inputStyle: React.CSSProperties = { fontSize: 15, padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, backgroundColor: BG, color: TEXT, fontFamily: "inherit", width: "100%", boxSizing: "border-box" };

interface Settings { google_review_link: string | null; message_template: string | null; follow_up_delay_days: number }

export default function MoveInReviewSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/leasing/move-in-review-settings").then((r) => r.json()).then(setSettings);
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/leasing/move-in-review-settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) { setSettings(await res.json()); setSaved(true); }
  }

  if (!settings) return <div style={{ minHeight: "100vh", backgroundColor: BG }} />;

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 60px" }}>
        <Link href="/admin/move-in-coordinator" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Move-In Coordinator</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "10px 0 24px" }}>Review Request Settings</h1>

        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUT, textTransform: "uppercase", margin: "0 0 8px" }}>Google Review Link</p>
          <input value={settings.google_review_link ?? ""} onChange={(e) => setSettings({ ...settings, google_review_link: e.target.value })} placeholder="https://g.page/r/..." style={{ ...inputStyle, marginBottom: 20 }} />

          <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUT, textTransform: "uppercase", margin: "0 0 8px" }}>Message</p>
          <textarea value={settings.message_template ?? ""} onChange={(e) => setSettings({ ...settings, message_template: e.target.value })} rows={3} placeholder="We'd really appreciate a quick review of your move-in experience." style={{ ...inputStyle, resize: "vertical", marginBottom: 20 }} />

          <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUT, textTransform: "uppercase", margin: "0 0 8px" }}>Send how many days after move-in?</p>
          <input type="number" min={0} value={settings.follow_up_delay_days} onChange={(e) => setSettings({ ...settings, follow_up_delay_days: Number(e.target.value) })} style={{ ...inputStyle, width: 100, marginBottom: 24 }} />

          <p style={{ fontSize: 12, color: TEXT_MUT, marginBottom: 20 }}>
            Leave the review link blank to turn review requests off entirely — no link means nothing gets scheduled, no matter how many move-ins are finished.
          </p>

          <button onClick={save} disabled={saving} style={{ backgroundColor: ACCENT, color: "#FFFFFF", fontSize: 14, fontWeight: 700, padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && <span style={{ marginLeft: 12, color: GREEN, fontSize: 13, fontWeight: 600 }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}
