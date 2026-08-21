"use client";
import { useState, useCallback } from "react";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const ACCENT = "#8B2030";
const INPUT_BG = "#F7F5F2";

const SECTIONS = [
  "Breaker Panel",
  "Water Shutoff",
  "HVAC Controls",
  "Appliances",
  "Parking",
  "Emergency Contacts",
  "Garbage Schedule",
  "Other",
];

interface GuideSection {
  id: string;
  section: string;
  title: string;
  content: string;
  sort_order: number;
}

interface SectionState {
  title: string;
  content: string;
  saving: boolean;
  saved: boolean;
}

interface Props {
  adminSecret: string;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {children}
    </label>
  );
}

export function HomeGuidesClient({ adminSecret }: Props) {
  const [propertyId, setPropertyId] = useState("");
  const [loadedPropertyId, setLoadedPropertyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sectionData, setSectionData] = useState<Record<string, SectionState>>({});

  const handleLoad = useCallback(async () => {
    if (!propertyId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/home-guides?propertyId=${encodeURIComponent(propertyId)}`);
      if (!res.ok) return;
      const data: { sections: GuideSection[] } = await res.json();
      const map: Record<string, SectionState> = {};
      for (const sec of SECTIONS) {
        const existing = data.sections.find((s) => s.section === sec);
        map[sec] = { title: existing?.title ?? sec, content: existing?.content ?? "", saving: false, saved: false };
      }
      setSectionData(map);
      setLoadedPropertyId(propertyId);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  async function handleSave(section: string) {
    const s = sectionData[section];
    if (!s) return;
    setSectionData((prev) => ({ ...prev, [section]: { ...s, saving: true, saved: false } }));

    const res = await fetch("/api/admin/home-guides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminSecret}`,
      },
      body: JSON.stringify({
        propertyId: loadedPropertyId,
        section,
        title: s.title,
        content: s.content,
        sortOrder: SECTIONS.indexOf(section),
      }),
    });

    setSectionData((prev) => ({
      ...prev,
      [section]: { ...prev[section], saving: false, saved: res.ok },
    }));

    if (res.ok) {
      setTimeout(() => {
        setSectionData((prev) => ({
          ...prev,
          [section]: { ...prev[section], saved: false },
        }));
      }, 2000);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "48px", fontWeight: 300, color: TEXT, marginBottom: "8px" }}>
          Home Guides
        </h1>
        <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)", marginBottom: "40px" }}>
          Edit property home guide sections shown to tenants in their portal.
        </p>

        {/* Property selector */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "24px", marginBottom: "40px" }}>
          <Label>Property ID (Notion)</Label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="e.g. 19d44116874346b3981f527950b85817"
              style={{
                flex: 1,
                background: INPUT_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "10px 14px",
                color: TEXT,
                fontSize: "14px",
                fontFamily: "var(--font-dm-sans)",
                outline: "none",
              }}
            />
            <button
              onClick={handleLoad}
              disabled={loading || !propertyId.trim()}
              style={{
                background: ACCENT,
                color: "#FAF8F5",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Loading..." : "Load guides"}
            </button>
          </div>
        </div>

        {/* Section editors */}
        {loadedPropertyId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {SECTIONS.map((section, idx) => {
              const s = sectionData[section] ?? { title: section, content: "", saving: false, saved: false };
              return (
                <div
                  key={section}
                  style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px" }}
                >
                  <p style={{ color: TEXT_SEC, fontSize: "11px", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                    Section {idx + 1} — {section}
                  </p>

                  <div style={{ marginBottom: "16px" }}>
                    <Label>Title</Label>
                    <input
                      value={s.title}
                      onChange={(e) => setSectionData((prev) => ({ ...prev, [section]: { ...s, title: e.target.value } }))}
                      style={{
                        width: "100%",
                        background: INPUT_BG,
                        border: `1px solid ${BORDER}`,
                        borderRadius: "8px",
                        padding: "10px 14px",
                        color: TEXT,
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <Label>Content</Label>
                    <textarea
                      value={s.content}
                      onChange={(e) => setSectionData((prev) => ({ ...prev, [section]: { ...s, content: e.target.value } }))}
                      rows={5}
                      placeholder={`Enter ${section.toLowerCase()} information...`}
                      style={{
                        width: "100%",
                        background: INPUT_BG,
                        border: `1px solid ${BORDER}`,
                        borderRadius: "8px",
                        padding: "12px 14px",
                        color: TEXT,
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => handleSave(section)}
                    disabled={s.saving}
                    style={{
                      background: s.saved ? "rgba(5,150,105,0.1)" : "#F7F5F2",
                      border: `1px solid ${s.saved ? "rgba(5,150,105,0.3)" : BORDER}`,
                      borderRadius: "8px",
                      padding: "8px 18px",
                      color: s.saved ? "#059669" : TEXT,
                      fontSize: "13px",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: 500,
                      cursor: s.saving ? "not-allowed" : "pointer",
                      opacity: s.saving ? 0.6 : 1,
                    }}
                  >
                    {s.saving ? "Saving..." : s.saved ? "Saved" : "Save section"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
