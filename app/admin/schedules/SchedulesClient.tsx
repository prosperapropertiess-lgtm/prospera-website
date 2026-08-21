"use client";
import { useState, useCallback } from "react";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const ACCENT = "#8B2030";
const INPUT_BG = "#F7F5F2";

const EVENT_TYPES = ["inspection", "maintenance", "reminder", "garbage", "other"] as const;
type EventType = typeof EVENT_TYPES[number];

interface ScheduleEvent {
  id: string;
  property_id: string;
  event_type: EventType;
  title: string;
  description: string | null;
  event_date: string | null;
  recurring: string | null;
  created_at: string;
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

function InputField({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
  );
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  inspection: "#2563eb",
  maintenance: "#B45309",
  reminder: "#7c3aed",
  garbage: "#059669",
  other: "#999999",
};

export function SchedulesClient({ adminSecret }: Props) {
  const [propertyId, setPropertyId] = useState("");
  const [loadedPropertyId, setLoadedPropertyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const [eventType, setEventType] = useState<EventType>("reminder");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [recurring, setRecurring] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLoad = useCallback(async () => {
    if (!propertyId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/schedules?propertyId=${encodeURIComponent(propertyId)}`);
      if (res.ok) {
        const data: { events: ScheduleEvent[] } = await res.json();
        setEvents(data.events ?? []);
        setLoadedPropertyId(propertyId);
      }
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    const res = await fetch("/api/admin/schedules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminSecret}`,
      },
      body: JSON.stringify({
        propertyId: loadedPropertyId,
        eventType,
        title,
        description: description || undefined,
        eventDate: eventDate || undefined,
        recurring: recurring || undefined,
      }),
    });

    if (res.ok) {
      const data: { event: ScheduleEvent } = await res.json();
      setEvents((prev) =>
        [...prev, data.event].sort((a, b) => {
          if (!a.event_date) return 1;
          if (!b.event_date) return -1;
          return a.event_date.localeCompare(b.event_date);
        })
      );
      setTitle("");
      setDescription("");
      setEventDate("");
      setRecurring("");
    } else {
      const data = await res.json();
      setSubmitError(data.error ?? "Failed to create event");
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch("/api/admin/schedules", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminSecret}`,
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "48px", fontWeight: 300, color: TEXT, marginBottom: "8px" }}>
          Schedules
        </h1>
        <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)", marginBottom: "40px" }}>
          Manage property events, inspections, and tenant reminders.
        </p>

        {/* Property selector */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
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
              {loading ? "Loading..." : "Load schedule"}
            </button>
          </div>
        </div>

        {loadedPropertyId && (
          <>
            {/* Add event form */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px", marginBottom: "32px" }}>
              <p style={{ color: TEXT, fontSize: "18px", fontFamily: "var(--font-cormorant)", fontWeight: 300, marginBottom: "24px" }}>
                Add event
              </p>

              <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <Label>Event Type</Label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
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
                      }}
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t} style={{ background: "#FFFFFF" }}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <InputField type="date" value={eventDate} onChange={setEventDate} />
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <InputField value={title} onChange={setTitle} placeholder="e.g. Annual inspection, Garbage pickup" />
                </div>

                <div>
                  <Label>Description (optional)</Label>
                  <InputField value={description} onChange={setDescription} placeholder="Additional details..." />
                </div>

                <div>
                  <Label>Recurring (optional)</Label>
                  <InputField value={recurring} onChange={setRecurring} placeholder="e.g. Weekly, Monthly, Every Tuesday" />
                </div>

                {submitError && (
                  <p style={{ color: "#f87171", fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  style={{
                    background: ACCENT,
                    color: "#FAF8F5",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.6 : 1,
                    alignSelf: "flex-start",
                  }}
                >
                  {submitting ? "Adding..." : "Add event"}
                </button>
              </form>
            </div>

            {/* Events list */}
            <div>
              <p style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                {events.length} event{events.length !== 1 ? "s" : ""}
              </p>

              {events.length === 0 ? (
                <p style={{ color: TEXT_SEC, fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>No events yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        borderRadius: "12px",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: EVENT_TYPE_COLORS[ev.event_type], flexShrink: 0 }} />
                        <div>
                          <p style={{ color: TEXT, fontSize: "14px", fontFamily: "var(--font-dm-sans)", fontWeight: 500, marginBottom: "2px" }}>
                            {ev.title}
                          </p>
                          <p style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                            {ev.event_type}
                            {ev.event_date ? ` · ${new Date(ev.event_date + "T00:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                            {ev.recurring ? ` · ${ev.recurring}` : ""}
                          </p>
                          {ev.description && (
                            <p style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)", marginTop: "4px" }}>
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        style={{
                          background: "rgba(139,32,48,0.1)",
                          border: "1px solid rgba(139,32,48,0.25)",
                          borderRadius: "6px",
                          padding: "5px 12px",
                          color: "#8B2030",
                          fontSize: "12px",
                          fontFamily: "var(--font-dm-sans)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
