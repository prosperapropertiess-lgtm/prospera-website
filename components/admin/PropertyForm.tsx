"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CITIES = ["London", "St. Thomas", "Strathroy"];
const UTILITY_OPTIONS = ["Heat", "Water", "Hydro", "Internet"];

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

export default function PropertyForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<PropertyFormData>({ ...blank, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleUtility(util: string) {
    set("utilities_list", form.utilities_list.includes(util)
      ? form.utilities_list.filter((u) => u !== util)
      : [...form.utilities_list, util]
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 8 - form.images.length;
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

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Top bar */}
      <div className="bg-[#0A1628] text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/admin")} className="text-white/60 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light">
          {isEdit ? "Edit Property" : "Add Property"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl text-[#0A1628]">Basic Info</h2>

          <Field label="Property Title" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="e.g. Charming 2BR in Old South"
              className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors"
            />
          </Field>

          <Field label="Street Address" required>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              required
              placeholder="e.g. 123 Main St"
              className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors"
            />
          </Field>

          <Field label="City" required>
            <select
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors bg-white"
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
              className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors"
            />
          </Field>
        </section>

        {/* Size */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl text-[#0A1628]">Size & Specs</h2>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms" required>
              <input
                type="number"
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value === "" ? "" : Number(e.target.value))}
                required
                min={0}
                placeholder="2"
                className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors"
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
                className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors"
              />
            </Field>
            <Field label="Sq Ft (optional)">
              <input
                type="number"
                value={form.sqft}
                onChange={(e) => set("sqft", e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                placeholder="900"
                className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors"
              />
            </Field>
          </div>
        </section>

        {/* Description */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl text-[#0A1628]">Description</h2>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Describe the property — neighbourhood, finishes, highlights..."
            className="w-full px-4 py-3 border border-gray-200 rounded text-sm text-[#0A1628] outline-none focus:border-[#0A1628] transition-colors resize-none"
          />
        </section>

        {/* Features */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl text-[#0A1628]">Features</h2>

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
                        className="accent-[#7B1C1C] w-4 h-4"
                      />
                      <span className="text-sm text-[#2D4A5E]">{u}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl text-[#0A1628]">Photos</h2>
            <span className="text-xs text-gray-400">{form.images.length} / 8</span>
          </div>

          {/* Preview grid */}
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

          {form.images.length < 8 && (
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
                className={`flex items-center justify-center w-full py-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0A1628] transition-colors text-sm text-gray-400 ${uploadingIdx !== null ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploadingIdx !== null ? `Uploading photo ${uploadingIdx + 1}...` : `Click to upload photos (up to ${8 - form.images.length} more)`}
              </label>
            </div>
          )}
        </section>

        {error && (
          <p className="text-sm text-[#7B1C1C] bg-red-50 px-4 py-3 rounded">{error}</p>
        )}

        <div className="flex gap-4 pb-10">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#0A1628] text-white text-xs uppercase tracking-widest rounded hover:bg-[#7B1C1C] transition-colors disabled:opacity-50 flex-1 md:flex-none"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Property"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-8 py-3 border border-gray-200 text-sm text-[#2D4A5E] rounded hover:border-[#0A1628] transition-colors"
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
      <label className="block text-xs uppercase tracking-widest text-[#2D4A5E] mb-2">
        {label}{required && <span className="text-[#7B1C1C] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer select-none py-2">
      <span className="text-sm text-[#0A1628]">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-[#0A1628]" : "bg-gray-200"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </div>
    </label>
  );
}
