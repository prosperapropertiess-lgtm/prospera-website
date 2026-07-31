"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface QrCode {
  id: string;
  name: string;
  slug: string;
  redirect_url: string;
  destination_url: string;
  created_at: string;
  qr_scans: { count: number }[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 30) return `${Math.floor(d / 30)}mo ago`;
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m || 1}m ago`;
}

function scanCount(code: QrCode): number {
  return parseInt(String(code.qr_scans?.[0]?.count ?? "0"), 10) || 0;
}

export default function QrCodesPage() {
  const [codes, setCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // QR preview modal
  const [previewCode, setPreviewCode] = useState<QrCode | null>(null);
  const [previewImg, setPreviewImg] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Edit modal
  const [editCode, setEditCode] = useState<QrCode | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  async function loadCodes() {
    setLoading(true);
    const res = await fetch("/api/admin/qr");
    if (res.ok) {
      const { codes } = await res.json();
      setCodes(codes ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { loadCodes(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    setCreateLoading(true);
    setCreateError("");
    const res = await fetch("/api/admin/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), destination_url: newUrl.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCreateError(data.error || "Failed to create");
      setCreateLoading(false);
      return;
    }
    setCodes((prev) => [data.code, ...prev]);
    setNewName("");
    setNewUrl("");
    setCreating(false);
    setCreateLoading(false);
    // Auto-open preview for new code
    openPreview(data.code, data.qrDataUrl);
  }

  async function openPreview(code: QrCode, existingImg?: string) {
    setPreviewCode(code);
    if (existingImg) {
      setPreviewImg(existingImg);
      return;
    }
    setPreviewLoading(true);
    setPreviewImg("");
    const res = await fetch(`/api/admin/qr/${code.id}`);
    if (res.ok) {
      const { qrDataUrl } = await res.json();
      setPreviewImg(qrDataUrl);
    }
    setPreviewLoading(false);
  }

  function downloadQr(code: QrCode) {
    if (!previewImg) return;
    const a = document.createElement("a");
    a.href = previewImg;
    a.download = `${code.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  function openEdit(code: QrCode) {
    setEditCode(code);
    setEditName(code.name);
    setEditUrl(code.destination_url);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editCode) return;
    setEditLoading(true);
    const res = await fetch(`/api/admin/qr/${editCode.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), destination_url: editUrl.trim() }),
    });
    if (res.ok) {
      const { code: updated } = await res.json();
      setCodes((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      setEditCode(null);
    }
    setEditLoading(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/qr/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCodes((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
      if (previewCode?.id === id) setPreviewCode(null);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
  }

  const totalScans = codes.reduce((sum, c) => sum + scanCount(c), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2" }}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-5">
          <Link href="/admin" className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: "#FAF8F5" }}>Prospera</Link>
          <span className="text-xs" style={{ color: "rgba(250,248,245,0.4)" }}>/</span>
          <span className="text-xs" style={{ color: "rgba(250,248,245,0.6)" }}>QR Codes</span>
        </div>
        <Link href="/admin" className="text-xs transition-colors" style={{ color: "rgba(250,248,245,0.55)" }}>← Back</Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light mb-1" style={{ color: "#1F2F3A" }}>
              QR Codes
            </h1>
            <p className="text-sm" style={{ color: "#666666" }}>
              Dynamic codes — change the destination anytime without reprinting.
            </p>
          </div>
          <button
            onClick={() => { setCreating(true); setTimeout(() => nameRef.current?.focus(), 50); }}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B2030" }}
          >
            + New Code
          </button>
        </div>

        {/* Stats bar */}
        {codes.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Codes", value: codes.length },
              { label: "Total Scans", value: totalScans },
              { label: "Avg Scans / Code", value: codes.length ? Math.round(totalScans / codes.length) : 0 },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 border" style={{ borderColor: "#D8D2C8" }}>
                <p className="text-2xl font-bold mb-1" style={{ color: "#1F2F3A" }}>{s.value}</p>
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#666666" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create form */}
        {creating && (
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: "#D8D2C8" }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: "#1F2F3A" }}>New QR Code</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#666666" }}>Name</label>
                  <input
                    ref={nameRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. For Rent Sign – 123 Main"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#1F2F3A] transition-colors"
                    style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222" }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#666666" }}>Destination URL</label>
                  <input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://prosperaproperties.ca/listings/..."
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#1F2F3A] transition-colors"
                    style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222" }}
                    type="url"
                    required
                  />
                </div>
              </div>
              {createError && <p className="text-xs" style={{ color: "#8B2030" }}>{createError}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: "#8B2030" }}
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setCreateError(""); }}
                  className="text-xs font-medium"
                  style={{ color: "#666666" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Codes list */}
        {loading ? (
          <div className="text-sm py-16 text-center" style={{ color: "#666666" }}>Loading...</div>
        ) : codes.length === 0 ? (
          <div className="bg-white rounded-xl border p-16 text-center" style={{ borderColor: "#D8D2C8" }}>
            <p className="text-4xl mb-4">⬛</p>
            <p className="text-base font-semibold mb-2" style={{ color: "#1F2F3A" }}>No QR codes yet</p>
            <p className="text-sm" style={{ color: "#666666" }}>Create your first one — use it on for-rent signs, flyers, or ads.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => (
              <div key={code.id} className="bg-white rounded-xl border p-5 flex items-center gap-5 hover:shadow-sm transition-shadow" style={{ borderColor: "#D8D2C8" }}>
                {/* QR icon button */}
                <button
                  onClick={() => openPreview(code)}
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl border transition-colors hover:border-[#1F2F3A]"
                  style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2" }}
                  title="View QR code"
                >
                  ⬛
                </button>

                {/* Name + URL */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-0.5 truncate" style={{ color: "#1F2F3A" }}>{code.name}</p>
                  <p className="text-xs truncate" style={{ color: "#666666" }}>{code.destination_url}</p>
                </div>

                {/* Scans */}
                <div className="flex-shrink-0 text-center px-4">
                  <p className="text-lg font-bold" style={{ color: "#1F2F3A" }}>{scanCount(code)}</p>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#666666" }}>Scans</p>
                </div>

                {/* Created */}
                <div className="flex-shrink-0 text-right hidden sm:block">
                  <p className="text-xs" style={{ color: "#999999" }}>{timeAgo(code.created_at)}</p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => openPreview(code)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-[#F7F5F2]"
                    style={{ borderColor: "#D8D2C8", color: "#1F2F3A" }}
                  >
                    QR
                  </button>
                  <button
                    onClick={() => openEdit(code)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-[#F7F5F2]"
                    style={{ borderColor: "#D8D2C8", color: "#1F2F3A" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(code.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:border-[#8B2030] hover:text-[#8B2030]"
                    style={{ borderColor: "#D8D2C8", color: "#999999" }}
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Preview Modal */}
      {previewCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(31,47,58,0.6)" }}
          onClick={() => setPreviewCode(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-base mb-1" style={{ color: "#1F2F3A" }}>{previewCode.name}</h3>
            <p className="text-xs mb-6 truncate" style={{ color: "#666666" }}>{previewCode.destination_url}</p>

            {/* QR image */}
            <div className="rounded-xl overflow-hidden mb-6 border" style={{ borderColor: "#D8D2C8" }}>
              {previewLoading ? (
                <div className="h-64 flex items-center justify-center text-sm" style={{ color: "#666666" }}>
                  Generating...
                </div>
              ) : previewImg ? (
                <img src={previewImg} alt="QR Code" className="w-full" />
              ) : null}
            </div>

            {/* Redirect URL */}
            <div className="rounded-lg px-4 py-3 mb-6 flex items-center justify-between gap-3" style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}>
              <p className="text-xs truncate font-mono" style={{ color: "#1F2F3A" }}>{previewCode.redirect_url}</p>
              <button
                onClick={() => copyToClipboard(previewCode.redirect_url)}
                className="text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-60"
                style={{ color: "#8B2030" }}
              >
                Copy
              </button>
            </div>

            {/* Scan count */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#666666" }}>Total scans</span>
              <span className="text-xl font-bold" style={{ color: "#1F2F3A" }}>{scanCount(previewCode)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => downloadQr(previewCode)}
                disabled={!previewImg}
                className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: "#8B2030" }}
              >
                Download PNG
              </button>
              <button
                onClick={() => setPreviewCode(null)}
                className="px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-[#F7F5F2]"
                style={{ borderColor: "#D8D2C8", color: "#1F2F3A" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(31,47,58,0.6)" }}
          onClick={() => setEditCode(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-base mb-6" style={{ color: "#1F2F3A" }}>Edit QR Code</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#666666" }}>Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#1F2F3A] transition-colors"
                  style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222" }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#666666" }}>Destination URL</label>
                <input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#1F2F3A] transition-colors"
                  style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222" }}
                  type="url"
                  required
                />
                <p className="text-xs mt-1.5" style={{ color: "#999999" }}>
                  The QR code image stays the same — only the destination changes.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: "#8B2030" }}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditCode(null)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-[#F7F5F2]"
                  style={{ borderColor: "#D8D2C8", color: "#1F2F3A" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(31,47,58,0.6)" }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-base mb-2" style={{ color: "#1F2F3A" }}>Delete this QR code?</h3>
            <p className="text-sm mb-6" style={{ color: "#666666" }}>
              This deletes all scan history too. Anyone who scans a printed copy will land on your homepage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#8B2030" }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-[#F7F5F2]"
                style={{ borderColor: "#D8D2C8", color: "#1F2F3A" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
