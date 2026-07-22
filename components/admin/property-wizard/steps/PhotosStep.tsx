import { useRef, useState } from "react";
import Image from "next/image";
import type { WizardData } from "../PropertyWizard";

const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const INPUT_BG = "#F7F5F2";
const ACCENT = "#8B2030";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#8B2030]/40";

const MAX_PHOTOS = 20;
const PHOTO_LABELS = [
  { value: "exterior",          label: "Exterior",           emoji: "🏠" },
  { value: "living",            label: "Living Room",         emoji: "🛋️" },
  { value: "kitchen",           label: "Kitchen",             emoji: "🍳" },
  { value: "bedroom",           label: "Bedroom",             emoji: "🛏️" },
  { value: "bathroom",          label: "Bathroom",            emoji: "🚿" },
  { value: "attached_bathroom", label: "Attached Bathroom",   emoji: "🛁" },
  { value: "dining",            label: "Dining",              emoji: "🍽️" },
  { value: "basement",          label: "Basement",            emoji: "🏚️" },
  { value: "storage",           label: "Storage",             emoji: "📦" },
  { value: "common_area",       label: "Common Area",         emoji: "🚪" },
  { value: "outdoor",           label: "Outdoor",             emoji: "🌿" },
  { value: "other",             label: "Other",               emoji: "📷" },
];

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  propertyId: string | null;
}

type FileStatus = { name: string; status: "uploading" | "done" | "error"; error?: string };

export default function PhotosStep({ data, onChange, propertyId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLabeled, setAiLabeled] = useState<Set<string>>(new Set());

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - data.photo_labels.length;
    const toUpload = files.slice(0, remaining);

    setSelectedCount(toUpload.length);
    setUploading(true);
    setFileStatuses(toUpload.map((f) => ({ name: f.name, status: "uploading" })));

    // Upload all files in parallel
    const results = await Promise.allSettled(
      toUpload.map(async (file, i) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("propertyId", propertyId || "new");

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const text = await res.text().catch(() => "Upload failed");
          setFileStatuses((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "error", error: text } : s));
          throw new Error(text);
        }
        const { url } = await res.json();
        setFileStatuses((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "done" } : s));
        return url;
      })
    );

    // Collect all successful URLs and add them in one onChange call
    const successUrls: string[] = [];
    results.forEach((r) => {
      if (r.status === "fulfilled") successUrls.push(r.value);
    });

    if (successUrls.length > 0) {
      const existingCount = data.photo_labels.length;
      const newLabels = successUrls.map((url, i) => ({
        url,
        label: "other",
        sort_order: existingCount + i,
      }));
      onChange({
        images: [...data.images, ...successUrls],
        photo_labels: [...data.photo_labels, ...newLabels],
      });
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    // Clear statuses after a short delay so user can see the final state
    setTimeout(() => {
      setFileStatuses([]);
      setSelectedCount(0);
    }, 3000);
  }

  async function removePhoto(idx: number) {
    const photo = data.photo_labels[idx];
    const newLabels = data.photo_labels.filter((_, i) => i !== idx).map((p, i) => ({ ...p, sort_order: i }));
    const newImages = data.images.filter((url) => url !== photo.url);
    onChange({ photo_labels: newLabels, images: newImages });

    // Remove from aiLabeled if present
    if (aiLabeled.has(photo.url)) {
      const next = new Set(aiLabeled);
      next.delete(photo.url);
      setAiLabeled(next);
    }

    // If the removed photo was being edited, close the picker
    if (editingIdx === idx) setEditingIdx(null);

    // Delete from storage
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: photo.url }),
    });
  }

  function updateLabel(idx: number, label: string) {
    const updated = data.photo_labels.map((p, i) => i === idx ? { ...p, label } : p);
    onChange({ photo_labels: updated });
  }

  // Drag-to-reorder handlers
  function handleDragStart(idx: number) {
    setDragIdx(idx);
    setEditingIdx(null);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;

    const items = [...data.photo_labels];
    const [dragged] = items.splice(dragIdx, 1);
    items.splice(idx, 0, dragged);
    const reordered = items.map((p, i) => ({ ...p, sort_order: i }));

    onChange({
      photo_labels: reordered,
      images: reordered.map((p) => p.url),
    });
    setDragIdx(idx);
  }

  function handleDragEnd() {
    setDragIdx(null);
  }

  async function handleAiLabel() {
    if (!data.photo_labels.length || aiLoading) return;
    setAiLoading(true);
    try {
      const urls = data.photo_labels.map(p => p.url);
      const res = await fetch("/api/admin/ai-photo-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const { labels } = await res.json() as { labels: { url: string; label: string }[] };

      const labelMap = new Map(labels.map(l => [l.url, l.label]));
      const updated = data.photo_labels.map(p => ({
        ...p,
        label: labelMap.get(p.url) ?? p.label,
      }));
      onChange({ photo_labels: updated });

      const newAiLabeled = new Set(aiLabeled);
      labels.forEach(l => newAiLabeled.add(l.url));
      setAiLabeled(newAiLabeled);
    } catch {
      // silent fail
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Photos & Media
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          Upload photos, label them, and drag to reorder. First photo becomes the cover.
        </p>
      </div>

      {/* Photo Grid */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>
            Photos
          </h3>
          <div className="flex items-center gap-3">
            {data.photo_labels.length > 0 && (
              <button
                onClick={handleAiLabel}
                disabled={aiLoading}
                style={{
                  fontSize: "12px", fontWeight: 600, padding: "6px 12px",
                  borderRadius: "8px", border: "1px solid #D8D2C8",
                  backgroundColor: aiLoading ? "#F7F5F2" : "#1F2F3A",
                  color: aiLoading ? "#999" : "#FAF8F5",
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {aiLoading ? "Detecting rooms…" : "✨ Auto-Label with AI"}
              </button>
            )}
            <span className="text-xs" style={{ color: TEXT_MUT }}>
              {data.photo_labels.length} / {MAX_PHOTOS}
            </span>
          </div>
        </div>

        {data.photo_labels.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {data.photo_labels.map((photo, i) => {
              const currentLabel = PHOTO_LABELS.find(l => l.value === photo.label);
              return (
                <div
                  key={photo.url}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className="relative group rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
                  style={{
                    border: `2px solid ${dragIdx === i ? ACCENT : "transparent"}`,
                    opacity: dragIdx === i ? 0.6 : 1,
                  }}
                >
                  {/* Image area */}
                  <div className="aspect-square relative">
                    <Image src={photo.url} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />

                    {/* Cover badge */}
                    {i === 0 && (
                      <span
                        className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: ACCENT, fontFamily: "var(--font-dm-sans)", fontWeight: 700 }}
                      >
                        Cover
                      </span>
                    )}

                    {/* AI badge */}
                    {aiLabeled.has(photo.url) && (
                      <span style={{
                        position: "absolute", top: "8px", left: i === 0 ? "64px" : "8px",
                        fontSize: "10px", fontWeight: 700, padding: "2px 6px",
                        borderRadius: "4px", backgroundColor: "rgba(139,32,48,0.9)", color: "#fff",
                        fontFamily: "var(--font-dm-sans)",
                      }}>
                        ✨ AI
                      </span>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                    >
                      ×
                    </button>

                    {/* Drag handle */}
                    <div className="absolute bottom-2 right-2 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>
                      ⋮⋮
                    </div>

                    {/* Label pill overlaid on image */}
                    <button
                      onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                      style={{
                        position: "absolute", bottom: "8px", left: "8px", right: "8px",
                        backgroundColor: "rgba(0,0,0,0.72)", color: "#fff",
                        fontSize: "11px", fontWeight: 600, borderRadius: "6px",
                        padding: "4px 8px", border: "none", cursor: "pointer",
                        textAlign: "center", backdropFilter: "blur(4px)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {currentLabel?.emoji} {currentLabel?.label || "Label"}
                    </button>
                  </div>

                  {/* Inline label picker — opens below image inside the card */}
                  {editingIdx === i && (
                    <div style={{
                      backgroundColor: "#fff",
                      padding: "8px",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "6px",
                      borderTop: `1px solid ${BORDER}`,
                    }}>
                      {PHOTO_LABELS.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => { updateLabel(i, l.value); setEditingIdx(null); }}
                          style={{
                            padding: "6px 4px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: photo.label === l.value ? 700 : 500,
                            backgroundColor: photo.label === l.value ? "#8B2030" : "#F7F5F2",
                            color: photo.label === l.value ? "#fff" : "#333",
                            border: `1px solid ${photo.label === l.value ? "#8B2030" : "#D8D2C8"}`,
                            cursor: "pointer",
                            textAlign: "center",
                            lineHeight: 1.3,
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          <span style={{ display: "block", fontSize: "16px", marginBottom: "2px" }}>{l.emoji}</span>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {data.photo_labels.length < MAX_PHOTOS && (
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handleUpload}
              className="hidden"
              id="wizard-photo-upload"
            />
            <label
              htmlFor="wizard-photo-upload"
              className={`flex flex-col items-center justify-center w-full py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:border-[#8B2030]/40 text-sm gap-1 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              style={{ borderColor: BORDER, color: TEXT_MUT }}
            >
              {uploading ? (
                <>
                  <span className="font-medium" style={{ color: TEXT_SEC }}>
                    Uploading {fileStatuses.filter((s) => s.status === "done").length} / {selectedCount} files...
                  </span>
                  <span className="text-xs" style={{ color: TEXT_MUT }}>Please wait</span>
                </>
              ) : (
                <>
                  <span>{`Click or drag photos here (up to ${MAX_PHOTOS - data.photo_labels.length} more)`}</span>
                  {selectedCount > 0 && !uploading && (
                    <span className="text-xs font-medium mt-1" style={{ color: TEXT_MUT }}>
                      {selectedCount} file{selectedCount !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </>
              )}
            </label>

            {/* Per-file upload status list */}
            {fileStatuses.length > 0 && (
              <ul className="space-y-1.5">
                {fileStatuses.map((fs, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                    style={{
                      backgroundColor:
                        fs.status === "done" ? "#F0FDF4" :
                        fs.status === "error" ? "#FEF2F2" : INPUT_BG,
                      border: `1px solid ${
                        fs.status === "done" ? "#BBF7D0" :
                        fs.status === "error" ? "#FECACA" : BORDER
                      }`,
                    }}
                  >
                    {/* Status icon */}
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px]"
                      style={{
                        backgroundColor:
                          fs.status === "done" ? "#16A34A" :
                          fs.status === "error" ? "#DC2626" : "#D8D2C8",
                      }}
                    >
                      {fs.status === "done" ? "✓" : fs.status === "error" ? "✕" : "…"}
                    </span>

                    {/* File name */}
                    <span
                      className="truncate flex-1"
                      style={{
                        color:
                          fs.status === "done" ? "#15803D" :
                          fs.status === "error" ? "#B91C1C" : TEXT_MUT,
                      }}
                    >
                      {fs.name}
                    </span>

                    {/* Status label / error */}
                    <span
                      className="flex-shrink-0 font-medium"
                      style={{
                        color:
                          fs.status === "done" ? "#15803D" :
                          fs.status === "error" ? "#B91C1C" : TEXT_MUT,
                      }}
                    >
                      {fs.status === "done" ? "Uploaded" :
                       fs.status === "error" ? (fs.error || "Failed") : "Uploading..."}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Virtual Tour */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Virtual Tour & Floor Plan</h3>

        <div>
          <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: TEXT_MUT }}>
            Virtual Tour URL
          </label>
          <input
            type="url"
            value={data.virtual_tour_url}
            onChange={(e) => onChange({ virtual_tour_url: e.target.value })}
            placeholder="YouTube or Matterport link"
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
          />
          <p className="text-xs mt-1.5" style={{ color: TEXT_MUT }}>Paste a YouTube video or Matterport 3D tour link.</p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: TEXT_MUT }}>
            Floor Plan URL
          </label>
          <input
            type="url"
            value={data.floor_plan_url}
            onChange={(e) => onChange({ floor_plan_url: e.target.value })}
            placeholder="Link to floor plan image"
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
          />
        </div>
      </div>
    </div>
  );
}
