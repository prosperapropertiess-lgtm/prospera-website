"use client";

import { useState, useRef, useEffect } from "react";
import type { TenantMessage } from "@/lib/tenant-data";

// Design tokens
const BG = "#F5F4F1";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const BURGUNDY = "#8B2030";
const BURG_BG = "rgba(139,32,48,0.08)";
const GOLD = "#B8922A";
const RED = "#B91C1C";
const RED_BG = "rgba(185,28,28,0.08)";

interface Props {
  token: string;
  tenantName: string;
  initialMessages: TenantMessage[];
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " ·");
}

export function TenantFeed({ token, tenantName, initialMessages }: Props) {
  const [messages, setMessages] = useState<TenantMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    const optimistic: TenantMessage = {
      id: `opt-${Date.now()}`,
      tenant_id: "",
      author: "tenant",
      author_name: tenantName,
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await fetch("/api/tenants/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, content: trimmed }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to send message");
      }

      const json = await res.json();
      setMessages(prev => {
        const without = prev.filter(m => m.id !== optimistic.id);
        const added = json.message ? [...without, json.message] : without;
        return json.aiReply ? [...added, json.aiReply] : added;
      });
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setDraft(trimmed);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  const tenantInitial = tenantName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: "20px",
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
      }}
    >
      {/* Message thread */}
      <div
        style={{
          padding: "20px",
          minHeight: "240px",
          maxHeight: "520px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: BG,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "40px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "23px", color: SUBTLE }}
              >
                chat_bubble_outline
              </span>
            </div>
            <p
              style={{
                color: MUTED,
                fontSize: "17px",
                lineHeight: "1.6",
                maxWidth: "320px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              No messages yet. Say hello to Laura or ask Ebin a question.
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} tenantInitial={tenantInitial} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose area */}
      <div
        style={{
          padding: "16px 20px",
          background: CARD,
          borderTop: `1px solid ${CARD_BORDER}`,
        }}
      >
        {error && (
          <p
            style={{
              color: RED,
              fontSize: "16px",
              marginBottom: "10px",
              padding: "8px 12px",
              background: RED_BG,
              borderRadius: "8px",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {error}
          </p>
        )}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Ebin & Laura…"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              padding: "10px 14px",
              fontSize: "17px",
              fontFamily: "var(--font-dm-sans)",
              color: NAVY,
              background: BG,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: "12px",
              outline: "none",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: sending || !draft.trim() ? "rgba(15,28,40,0.07)" : BURGUNDY,
              color: sending || !draft.trim() ? SUBTLE : "#FFFFFF",
              border: "none",
              cursor: sending || !draft.trim() ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
              whiteSpace: "nowrap",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
        <p style={{ color: SUBTLE, fontSize: "14px", marginTop: "8px", fontFamily: "var(--font-dm-sans)" }}>
          Laura usually responds instantly · Ebin reviews all conversations
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  tenantInitial,
}: {
  message: TenantMessage;
  tenantInitial: string;
}) {
  const isTenant = message.author === "tenant";
  const isAI = message.author === "ai";
  const isEbin = message.author === "ebin";

  // Avatar
  const avatarBg = isAI
    ? "rgba(184,146,42,0.15)"
    : isEbin
    ? NAVY
    : "linear-gradient(135deg, #8B2030, #B8922A)";

  const avatarLabel = isAI ? "L" : isEbin ? "E" : tenantInitial;
  const avatarColor = isAI ? GOLD : "#FFFFFF";

  // Bubble
  const bubbleBg = isTenant
    ? BURGUNDY
    : isAI
    ? CARD
    : NAVY;

  const bubbleBorder = isAI
    ? `1px solid ${CARD_BORDER}`
    : "none";

  const bubbleTextColor = isTenant ? "#FFFFFF" : isAI ? NAVY : "#FFFFFF";

  const bubbleRadius = isTenant
    ? "16px 4px 16px 16px"
    : "4px 16px 16px 16px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isTenant ? "row-reverse" : "row",
        gap: "10px",
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: avatarBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <span
          style={{
            color: avatarColor,
            fontWeight: 700,
            fontSize: "16px",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {avatarLabel}
        </span>
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "75%", minWidth: 0 }}>
        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
            flexDirection: isTenant ? "row-reverse" : "row",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: MUTED,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {message.author_name}
          </span>
          <span style={{ fontSize: "14px", color: SUBTLE, fontFamily: "var(--font-dm-sans)" }}>
            {formatTimestamp(message.created_at)}
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: bubbleRadius,
            background: bubbleBg,
            border: bubbleBorder,
            boxShadow: isAI ? CARD_SHADOW : "none",
          }}
        >
          <p
            style={{
              fontSize: "17px",
              lineHeight: "1.6",
              color: bubbleTextColor,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
