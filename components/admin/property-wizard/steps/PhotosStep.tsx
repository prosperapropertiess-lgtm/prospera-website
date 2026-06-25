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
  { value: "exterior", label: "Exterior" },
  { value: "living", label: "Living Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "dining", label: "Dining" },
  { value: "storage", label: "Storage" },
  { value: "outdoor", label: "Outdoor" },
  { value: "other", label: "Other" },
];

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  propertyId: string | null;
}

export default function PhotosStep({ data, onChange, propertyId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - data.photo_labels.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);

    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("propertyId", propertyId || "new");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        const newLabel = { url, label: "other", sort_order: data.photo_labels.length };
        onChange({
          images: [...data.images, url],
          photo_labels: [...data.photo_labels, newLabel],
        });
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removePhoto(idx: number) {
    const photo = data.photo_labels[idx];
    const newLabels = data.photo_labels.filter((_, i) => i !== idx).map((p, i) => ({ ...p, sort_order: i }));
    const newImages = data.images.filter((url) => url !== photo.url);
    onChange({ photo_labels: newLabels, images: newImages });

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
          <span className="text-xs" style={{ color: TEXT_MUT }}>
            {data.photo_labels.length} / {MAX_PHOTOS}
          </span>
        </div>

        {data.photo_labels.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {data.photo_labels.map((photo, i) => (
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
                <div className="aspect-square relative">
                  <Image src={photo.url} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />

                  {/* Cover badge */}
                  {i === 0 && (
                    <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded text-white" style={{ backgroundColor: ACCENT }}>
                      Cover
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
                  <div className="absolute bottom-2 left-2 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>
                    ⋮⋮ drag
                  </div>
                </div>

                {/* Label selector */}
                <select
                  value={photo.label}
                  onChange={(e) => updateLabel(i, e.target.value)}
                  className="w-full px-2 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: "#F7F5F2", color: TEXT_SEC, border: "none" }}
                >
                  {PHOTO_LABELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {data.photo_labels.length < MAX_PHOTOS && (
          <div>
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
              className={`flex items-center justify-center w-full py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:border-[#8B2030]/40 text-sm ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              style={{ borderColor: BORDER, color: TEXT_MUT }}
            >
              {uploading ? "Uploading..." : `Click or drag photos here (up to ${MAX_PHOTOS - data.photo_labels.length} more)`}
            </label>
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
