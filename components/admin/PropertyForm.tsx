"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CITIES = ["London", "St. Thomas", "Strathroy"];
const UTILITY_OPTIONS = ["Heat", "Water", "Hydro", "Internet"];
const MAX_PHOTOS = 20;

interface PropertyFormData {
  id?: string;
  title: string;
  address: string;
  city: string;
  price: number | "";
  bedrooms: number | "";
  bathrooms: number | "";
  sqft: number | "";
  description: string;
  pet_friendly: boolean;
  parking: boolean;
  utilities_included: boolean;
  utilities_list: string[];
  available: boolean;
  images: string[];
}

interface Props {
  initial?: Partial<PropertyFormData> & { id?: string };
}

const blank: PropertyFormData = {
  title: "",
  address: "",
  city: "London",
  price: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  description: "",
  pet_friendly: false,
  parking: false,
  utilities_included: false,
  utilities_list: [],
  available: true,
  images: [],
};

const inputCls = "w-full px-4 py-3 border border-[#D8D2C8] rounded text-sm text-[#222222] bg-[#F7F5F2] outline-none focus:border-[#1F2F3A] transition-colors";

export default function PropertyForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<PropertyFormData>({ ...blank, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI generation state
  const [generating, setGenerating] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiError, setAiError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function set<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleUtility(util: string) {
    set("utilities_list", form.utilities_list.includes(util)
      ? form.utilities_list.filter((u) => u !== util)
      : [...form.utilities_list, util]
    );
  }

  // Copy to clipboard with visual feedback
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }, []);

  // AI generate listing title + description
  async function handleGenerate() {
    setGenerating(true);
    setAiError("");
    setAiTitle("");
    setAiDescription("");

    try {
      const res = await fetch("/api/admin/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form.address,
          city: form.city,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          sqft: form.sqft,
          price: form.price,
          pet_friendly: form.pet_friendly,
          parking: form.parking,
          utilities_included: form.utilities_included,
          utilities_list: form.utilities_list,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate");
      }

      const data = await res.json();
      setAiTitle(data.title || "");
      setAiDescription(data.description || "");
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Failed to generate listing. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  // Use AI-generated content directly in the form
  function useAiTitle() {
    if (aiTitle) set("title", aiTitle);
  }

  function useAiDescription() {
    if (aiDescription) set("description", aiDescription);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - form.images.length;
    const toUpload = files.slice(0, remaining);

    for (let i = 0; i < toUpload.length; i++) {
      setUploadingIdx(i);
      const fd = new FormData();
      fd.append("file", toUpload[i]);
      fd.append("propertyId", initial?.id || "new");

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      } else {
        setError("Failed to upload one or more photos.");
      }
    }
    setUploadingIdx(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removePhoto(url: string) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: form.sqft !== "" ? Number(form.sqft) : null,
    };

    const isEdit = !!initial?.id;
    const url = isEdit ? `/api/admin/properties/${initial!.id}` : "/api/admin/properties";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Try again.");
      setSaving(false);
    }
  }

  const isEdit = !!initial?.id;
  const hasEnoughForAI = form.city && (form.bedrooms || form.bathrooms || form.address);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2" }}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: "#1F2F3A" }}>
        <button onClick={() => router.push("/admin")} className="text-white/60 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-white">
          {isEdit ? "Edit Property" : "Add Property"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-[#D8D2C8] p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl" style={{ color: "#1F2F3A" }}>Basic Info</h2>

          <Field label="Property Title" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="e.g. Charming 2BR in Old South"
              className={inputCls}
            />
          </Field>

          <Field label="Street Address" required>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              required
              placeholder="e.g. 123 Main St"
              className={inputCls}
            />
          </Field>

          <Field label="City" required>
            <select
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputCls}
            >
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Monthly Rent ($)" required>
            <input
              type="number"
              value={form.price}
              onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))}
              required
              min={0}
              placeholder="1800"
              className={inputCls}
            />
          </Field>
        </section>

        {/* Size */}
        <section className="bg-white rounded-xl border border-[#D8D2C8] p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl" style={{ color: "#1F2F3A" }}>Size & Specs</h2>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms" required>
              <input
                type="number"
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value === "" ? "" : Number(e.target.value))}
                required
                min={0}
                placeholder="2"
                className={inputCls}
              />
            </Field>
            <Field label="Bathrooms" required>
              <input
                type="number"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value === "" ? "" : Number(e.target.value))}
                required
                min={0}
                step={0.5}
                placeholder="1"
                className={inputCls}
              />
            </Field>
            <Field label="Sq Ft (optional)">
              <input
                type="number"
                value={form.sqft}
                onChange={(e) => set("sqft", e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                placeholder="900"
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white rounded-xl border border-[#D8D2C8] p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl" style={{ color: "#1F2F3A" }}>Features</h2>

          <div className="space-y-4">
            <Toggle
              label="Pet Friendly"
              checked={form.pet_friendly}
              onChange={(v) => set("pet_friendly", v)}
            />
            <Toggle
              label="Parking Included"
              checked={form.parking}
              onChange={(v) => set("parking", v)}
            />
            <Toggle
              label="Available for Rent"
              checked={form.available}
              onChange={(v) => set("available", v)}
            />

            {/* Utilities */}
            <div>
              <Toggle
                label="Utilities Included"
                checked={form.utilities_included}
                onChange={(v) => {
                  set("utilities_included", v);
                  if (!v) set("utilities_list", []);
                }}
              />
              {form.utilities_included && (
                <div className="mt-3 ml-6 flex flex-wrap gap-3">
                  {UTILITY_OPTIONS.map((u) => (
                    <label key={u} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.utilities_list.includes(u)}
                        onChange={() => toggleUtility(u)}
                        className="accent-[#8B2030] w-4 h-4"
                      />
                      <span className="text-sm" style={{ color: "#333333" }}>{u}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="bg-white rounded-xl border border-[#D8D2C8] p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl" style={{ color: "#1F2F3A" }}>Description</h2>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Describe the property — neighbourhood, finishes, highlights..."
            className={inputCls + " resize-none"}
          />
        </section>

        {/* AI Listing Generator */}
        <section className="bg-white rounded-xl border border-[#D8D2C8] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-xl" style={{ color: "#1F2F3A" }}>AI Listing Generator</h2>
              <p className="text-sm mt-1" style={{ color: "#666666" }}>
                Fill in the details above, then generate a title and description you can use anywhere.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !hasEnoughForAI}
            className="px-6 py-3 text-sm rounded transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5" }}
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Title & Description"
            )}
          </button>

          {aiError && (
            <p className="text-sm px-4 py-3 rounded bg-red-50" style={{ color: "#8B2030" }}>{aiError}</p>
          )}

          {/* AI Generated Title */}
          {aiTitle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest" style={{ color: "#666666" }}>Generated Title</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={useAiTitle}
                    className="text-xs px-3 py-1.5 rounded border transition-colors hover:border-[#1F2F3A]"
                    style={{ borderColor: "#D8D2C8", color: "#333333" }}
                  >
                    Use as Title
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(aiTitle, "title")}
                    className="text-xs px-3 py-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: copiedField === "title" ? "#1F2F3A" : "#F7F5F2",
                      color: copiedField === "title" ? "#FAF8F5" : "#333333",
                      border: "1px solid #D8D2C8",
                    }}
                  >
                    {copiedField === "title" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div
                className="px-4 py-3 rounded text-sm"
                style={{ backgroundColor: "#F7F5F2", color: "#222222", border: "1px solid #D8D2C8" }}
              >
                {aiTitle}
              </div>
            </div>
          )}

          {/* AI Generated Description */}
          {aiDescription && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest" style={{ color: "#666666" }}>Generated Description</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={useAiDescription}
                    className="text-xs px-3 py-1.5 rounded border transition-colors hover:border-[#1F2F3A]"
                    style={{ borderColor: "#D8D2C8", color: "#333333" }}
                  >
                    Use as Description
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(aiDescription, "description")}
                    className="text-xs px-3 py-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: copiedField === "description" ? "#1F2F3A" : "#F7F5F2",
                      color: copiedField === "description" ? "#FAF8F5" : "#333333",
                      border: "1px solid #D8D2C8",
                    }}
                  >
                    {copiedField === "description" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div
                className="px-4 py-3 rounded text-sm whitespace-pre-wrap leading-relaxed"
                style={{ backgroundColor: "#F7F5F2", color: "#222222", border: "1px solid #D8D2C8" }}
              >
                {aiDescription}
              </div>
            </div>
          )}
        </section>

        {/* Photos */}
        <section className="bg-white rounded-xl border border-[#D8D2C8] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl" style={{ color: "#1F2F3A" }}>Photos</h2>
            <span className="text-xs" style={{ color: "#666666" }}>{form.images.length} / {MAX_PHOTOS}</span>
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {form.images.map((url, i) => (
                <div key={url} className="relative group aspect-square">
                  <Image
                    src={url}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {form.images.length < MAX_PHOTOS && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className={`flex items-center justify-center w-full py-8 border-2 border-dashed border-[#D8D2C8] rounded-lg cursor-pointer hover:border-[#1F2F3A] transition-colors text-sm ${uploadingIdx !== null ? "opacity-50 pointer-events-none" : ""}`}
                style={{ color: "#666666" }}
              >
                {uploadingIdx !== null ? `Uploading photo ${uploadingIdx + 1}...` : `Click to upload photos (up to ${MAX_PHOTOS - form.images.length} more)`}
              </label>
            </div>
          )}
        </section>

        {error && (
          <p className="text-sm bg-red-50 px-4 py-3 rounded" style={{ color: "#8B2030" }}>{error}</p>
        )}

        <div className="flex gap-4 pb-10">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 text-white text-xs uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-50 flex-1 md:flex-none"
            style={{ backgroundColor: "#8B2030" }}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Property"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-8 py-3 border text-sm rounded transition-colors hover:border-[#1F2F3A]"
            style={{ borderColor: "#D8D2C8", color: "#333333" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#333333" }}>
        {label}{required && <span className="ml-0.5" style={{ color: "#8B2030" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer select-none py-2">
      <span className="text-sm" style={{ color: "#222222" }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-[#8B2030]" : "bg-[#D8D2C8]"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </div>
    </label>
  );
}
