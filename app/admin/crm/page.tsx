"use client";

import { useEffect, useState } from "react";

const BG     = "#F7F5F2";
const BORDER = "#D8D2C8";
const NAVY   = "#1F2F3A";
const BURG   = "#8B2030";
const FONT   = "var(--font-dm-sans, -apple-system, sans-serif)";

interface QueueRow {
  id: string;
  hubspot_id: number;
  email: string;
  contact_type: string;
  sequence_index: number;
  next_send_at: string;
  last_sent_at: string | null;
  completed: boolean;
  unsubscribed: boolean;
  enrolled_at: string;
}

interface LogRow {
  id: string;
  email: string;
  contact_type: string;
  sequence_index: number;
  subject: string;
  sent_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  potential_landlord:   "Potential landlord",
  selfmanager_landlord: "Self-manager",
  realtor:              "Realtor",
  client:               "Client",
};

function badge(type: string) {
  const colors: Record<string, string> = {
    potential_landlord:   "#1a5276",
    selfmanager_landlord: "#1e8449",
    realtor:              "#7d6608",
    client:               "#8B2030",
  };
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: 4, color: "#fff",
      backgroundColor: colors[type] ?? "#555",
      fontFamily: FONT,
    }}>
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isNurture(row: QueueRow) {
  const lengths: Record<string, number> = {
    potential_landlord: 4, selfmanager_landlord: 3, realtor: 3, client: 4,
  };
  return row.sequence_index >= (lengths[row.contact_type] ?? 99);
}

export default function CrmPage() {
  const [queue, setQueue]   = useState<QueueRow[]>([]);
  const [log, setLog]       = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testType, setTestType]   = useState("potential_landlord");
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/crm/status")
      .then(r => r.json())
      .then(d => { setQueue(d.queue ?? []); setLog(d.log ?? []); })
      .finally(() => setLoading(false));
  }, []);

  async function sendTest() {
    if (!testEmail.includes("@")) return;
    setTesting(true);
    setTestResult(null);
    const r = await fetch("/api/crm/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, contact_type: testType }),
    });
    const d = await r.json();
    setTestResult(r.ok ? `Sent to ${testEmail}` : d.error ?? "Error");
    setTesting(false);
  }

  const due    = queue.filter(r => !r.completed && !r.unsubscribed && new Date(r.next_send_at) <= new Date());
  const queued = queue.filter(r => !r.completed && !r.unsubscribed && new Date(r.next_send_at) > new Date());
  const nurture = queued.filter(isNurture);
  const sequence = queued.filter(r => !isNurture(r));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: FONT, padding: "40px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Admin</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "0 0 32px" }}>CRM Sequences</h1>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Due today", value: due.length, color: due.length > 0 ? BURG : "#555" },
            { label: "In sequence", value: sequence.length, color: NAVY },
            { label: "Nurture track", value: nurture.length, color: "#1e8449" },
            { label: "Emails sent", value: log.length, color: "#555" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 20px" }}>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: s.color }}>{loading ? "—" : s.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Test email */}
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: "0 0 16px" }}>Send a test email</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 13, backgroundColor: BG, color: NAVY, fontFamily: FONT }}
            />
            <select
              value={testType}
              onChange={e => setTestType(e.target.value)}
              style={{ padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 13, backgroundColor: BG, color: NAVY, fontFamily: FONT }}
            >
              <option value="potential_landlord">Potential landlord — email 1</option>
              <option value="selfmanager_landlord">Self-manager — email 1</option>
              <option value="realtor">Realtor — email 1</option>
              <option value="client">Client — welcome</option>
            </select>
            <button
              onClick={sendTest}
              disabled={testing}
              style={{ padding: "9px 20px", backgroundColor: BURG, color: "#FAF8F5", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", cursor: testing ? "not-allowed" : "pointer", fontFamily: FONT }}
            >
              {testing ? "Sending…" : "Send test"}
            </button>
          </div>
          {testResult && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: testResult.startsWith("Sent") ? "#1e8449" : BURG }}>{testResult}</p>
          )}
        </div>

        {/* Queue */}
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>Upcoming emails</h2>
          </div>
          {loading ? (
            <p style={{ padding: 20, color: "#888", fontSize: 13 }}>Loading…</p>
          ) : queued.length === 0 ? (
            <p style={{ padding: 20, color: "#888", fontSize: 13 }}>No emails queued. Contacts need to be enrolled via HubSpot sync.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: BG }}>
                  {["Email", "Type", "Step", "Sends at"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queued.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                    <td style={{ padding: "12px 16px", color: NAVY }}>{r.email}</td>
                    <td style={{ padding: "12px 16px" }}>{badge(r.contact_type)}</td>
                    <td style={{ padding: "12px 16px", color: "#555" }}>{isNurture(r) ? "Nurture" : `Email ${r.sequence_index + 1}`}</td>
                    <td style={{ padding: "12px 16px", color: "#555" }}>{fmt(r.next_send_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent sends */}
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>Recently sent</h2>
          </div>
          {loading ? (
            <p style={{ padding: 20, color: "#888", fontSize: 13 }}>Loading…</p>
          ) : log.length === 0 ? (
            <p style={{ padding: 20, color: "#888", fontSize: 13 }}>No emails sent yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: BG }}>
                  {["Email", "Type", "Subject", "Sent"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.slice(0, 30).map((r, i) => (
                  <tr key={r.id} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                    <td style={{ padding: "12px 16px", color: NAVY }}>{r.email}</td>
                    <td style={{ padding: "12px 16px" }}>{badge(r.contact_type)}</td>
                    <td style={{ padding: "12px 16px", color: "#555", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subject}</td>
                    <td style={{ padding: "12px 16px", color: "#888", whiteSpace: "nowrap" }}>{fmt(r.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
