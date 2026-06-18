"use client";

import { useState, useRef, useEffect } from "react";
import type { TenantMessage } from "@/lib/tenant-data";

const CARD = "#0D1825";
const CARD_HOVER = "#111F2E";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const TEXT_DIM = "rgba(237,232,225,0.20)";
const CRIMSON = "#8B2030";

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
      // Replace optimistic with real tenant message, then add AI reply
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
        borderRadius: "16px",
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
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${CARD_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px", color: TEXT_DIM }}
              >
                chat_bubble_outline
              </span>
            </div>
            <p
              style={{
                color: TEXT_SEC,
                fontSize: "14px",
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

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

      {/* Compose area */}
      <div style={{ padding: "16px 20px" }}>
        {error && (
          <p
            style={{
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "10px",
              padding: "8px 12px",
              background: "rgba(248,113,113,0.10)",
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
              fontSize: "14px",
              fontFamily: "var(--font-dm-sans)",
              color: TEXT,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: "10px",
              outline: "none",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: sending || !draft.trim() ? "rgba(255,255,255,0.06)" : CRIMSON,
              color: sending || !draft.trim() ? TEXT_DIM : TEXT,
              border: "none",
              cursor: sending || !draft.trim() ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
              whiteSpace: "nowrap",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
        <p style={{ color: TEXT_DIM, fontSize: "11px", marginTop: "8px", fontFamily: "var(--font-dm-sans)" }}>
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

  const avatarBg = isAI
    ? "rgba(201,168,76,0.20)"
    : isEbin
    ? "rgba(139,32,48,0.40)"
    : "rgba(255,255,255,0.08)";

  const avatarLabel = isAI ? "L" : isEbin ? "E" : tenantInitial;
  const avatarColor = isAI ? "#C9A84C" : isEbin ? "#f87171" : TEXT_SEC;

  const bubbleBg = isAI
    ? "rgba(201,168,76,0.10)"
    : isEbin
    ? "rgba(139,32,48,0.12)"
    : CARD_HOVER;

  const bubbleBorder = isAI
    ? "1px solid rgba(201,168,76,0.20)"
    : isEbin
    ? "1px solid rgba(139,32,48,0.25)"
    : "none";

  const bubbleRadius = isTenant
    ? "12px 4px 12px 12px"
    : "4px 12px 12px 12px";

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
            fontSize: "13px",
            fontFamily: "var(--font-outfit)",
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
              fontSize: "12px",
              fontWeight: 600,
              color: TEXT_SEC,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {message.author_name}
          </span>
          <span style={{ fontSize: "11px", color: TEXT_DIM }}>
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
          }}
        >
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: TEXT,
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
