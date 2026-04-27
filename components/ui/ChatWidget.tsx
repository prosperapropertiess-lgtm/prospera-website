"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LEAD_KEYWORDS = /email|phone|call|contact|name|reach|number/i;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Laura, the Prospera assistant. Ask me anything about renting, property management, or how we can help. 👋",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Show lead form after 3 user messages if not yet submitted
  useEffect(() => {
    const userMsgs = messages.filter((m) => m.role === "user").length;
    if (userMsgs >= 3 && !leadSubmitted && !showLeadForm) {
      setShowLeadForm(true);
    }
  }, [messages, leadSubmitted, showLeadForm]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Check if user typed contact info inline
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/[\d\s\-().+]{10,}/);
    if (emailMatch && !email) setEmail(emailMatch[0]);
    if (phoneMatch && !phone) setPhone(phoneMatch[0]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          email: email || emailMatch?.[0],
          name,
          phone: phone || phoneMatch?.[0],
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message || "Sorry, something went wrong. Please try again." }]);

      // Show lead form if bot mentions contact info
      if (LEAD_KEYWORDS.test(data.message || "") && !leadSubmitted) {
        setShowLeadForm(true);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please call us at (519) 697-1227." }]);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setLeadSubmitted(true);
    setShowLeadForm(false);
    // Send to API with current conversation
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, email, name, phone }),
    }).catch(() => {});
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: `Thanks ${name ? name.split(" ")[0] : ""}! Ebin will reach out to you at ${email || phone} shortly. Is there anything else I can help you with?` },
    ]);
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#0A1628" }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <svg width="20" height="20" fill="none" stroke="#FAF8F5" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <svg width="22" height="22" fill="none" stroke="#FAF8F5" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: "#C5A55A" }} />
        )}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh", backgroundColor: "#FFFDFB", border: "1px solid #E8E4DF" }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: "#0A1628" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>P</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Laura — Prospera Assistant</p>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Online now
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      backgroundColor: msg.role === "user" ? "#0A1628" : "#F5F0EB",
                      color: msg.role === "user" ? "#FAF8F5" : "#0A1628",
                      fontFamily: "var(--font-dm-sans)",
                      borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: "#F5F0EB", borderRadius: "1rem 1rem 1rem 0.25rem" }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0A1628", opacity: 0.4 }}
                          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Lead capture form */}
              {showLeadForm && !leadSubmitted && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4" style={{ backgroundColor: "#F5F0EB", border: "1px solid #E8E4DF" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                    Want Ebin to follow up?
                  </p>
                  <form onSubmit={submitLead} className="space-y-2">
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 text-sm rounded-lg border bg-white" style={{ borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)" }} />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full px-3 py-2 text-sm rounded-lg border bg-white" style={{ borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)" }} />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full px-3 py-2 text-sm rounded-lg border bg-white" style={{ borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)" }} />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg" style={{ backgroundColor: "#0A1628", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                        Send
                      </button>
                      <button type="button" onClick={() => setShowLeadForm(false)} className="px-3 py-2 text-xs rounded-lg" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                        Skip
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t" style={{ borderColor: "#E8E4DF" }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border focus:outline-none"
                  style={{ borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)", backgroundColor: "#FAF8F5" }}
                  disabled={loading}
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: "#0A1628" }}
                >
                  <svg width="16" height="16" fill="none" stroke="#FAF8F5" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                </button>
              </div>
              <p className="text-center text-xs mt-2" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
                Powered by Prospera Properties · (519) 697-1227
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
