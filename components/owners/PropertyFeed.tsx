"use client";

import { useState, useRef, useEffect } from "react";

export interface PropertyMessage {
  id: string;
  author: "ebin" | "owner";
  author_name: string;
  content: string;
  message_type: string;
  created_at: string;
}

interface Props {
  propertyId: string;
  token: string;
  ownerName: string;
  propertyAddress: string;
  initialMessages: PropertyMessage[];
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).replace(",", " ·");
}

function messageTypeIcon(type: string): string | null {
  if (type === "maintenance") return "build";
  if (type === "tenant_note") return "person";
  return null;
}

export function PropertyFeed({
  propertyId,
  token,
  ownerName,
  propertyAddress,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<PropertyMessage[]>(initialMessages);
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

    const optimistic: PropertyMessage = {
      id: `opt-${Date.now()}`,
      author: "owner",
      author_name: ownerName,
      content: trimmed,
      message_type: "general",
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await fetch("/api/owners/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          token,
          content: trimmed,
          authorName: ownerName,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to send message");
      }

      const { message } = await res.json();
      setMessages(prev => prev.map(m => (m.id === optimistic.id ? message : m)));
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

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
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
                background: "#F7F5F2",
                border: "1px solid #E8E4DF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px", color: "#C8BFB5" }}
              >
                chat_bubble_outline
              </span>
            </div>
            <p
              style={{
                color: "#9AA5B1",
                fontSize: "14px",
                lineHeight: "1.6",
                maxWidth: "320px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              No updates yet. Ebin will post here when there&apos;s something to share about your property.
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} ownerInitial={ownerName[0] ?? "O"} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #E8E4DF" }} />

      {/* Compose area */}
      <div style={{ padding: "16px 20px" }}>
        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
              marginBottom: "10px",
              padding: "8px 12px",
              background: "#fef2f2",
              borderRadius: "8px",
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
            placeholder="Write a message to Ebin…"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              padding: "10px 14px",
              fontSize: "14px",
              fontFamily: "var(--font-dm-sans)",
              color: "#1F2F3A",
              background: "#F7F5F2",
              border: "1px solid #E8E4DF",
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
              background: sending || !draft.trim() ? "#E8E4DF" : "#8B2030",
              color: sending || !draft.trim() ? "#9AA5B1" : "#FFFFFF",
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
        <p style={{ color: "#C8BFB5", fontSize: "11px", marginTop: "8px" }}>
          Cmd+Enter to send
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  ownerInitial,
}: {
  message: PropertyMessage;
  ownerInitial: string;
}) {
  const isEbin = message.author === "ebin";
  const icon = isEbin ? messageTypeIcon(message.message_type) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isEbin ? "row" : "row-reverse",
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
          background: isEbin
            ? "linear-gradient(135deg, #8B2030, #a02540)"
            : "#E8E4DF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <span
          style={{
            color: isEbin ? "#FFFFFF" : "#5A6A7A",
            fontWeight: 700,
            fontSize: "13px",
            fontFamily: "var(--font-outfit)",
          }}
        >
          {isEbin ? "E" : ownerInitial.toUpperCase()}
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
            flexDirection: isEbin ? "row" : "row-reverse",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#5A6A7A",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {message.author_name}
          </span>
          {icon && (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "13px", color: "#9AA5B1" }}
            >
              {icon}
            </span>
          )}
          <span style={{ fontSize: "11px", color: "#C8BFB5" }}>
            {formatTimestamp(message.created_at)}
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isEbin ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
            background: isEbin ? "#F7F5F2" : "#FFFFFF",
            border: isEbin ? "none" : "1px solid #E8E4DF",
            boxShadow: isEbin ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#1F2F3A",
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
