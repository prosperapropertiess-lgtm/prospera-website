"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Page, PageHeader, Tabs, Badge, Button, EmptyState, Loading, ErrorNote, C, money, titleCaseAddress } from "@/components/admin/kit";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  available: boolean;
  images: string[] | null;
  status: string;
  wizard_step: number | null;
}

type Filter = "all" | "published" | "rented" | "draft";

export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/admin/properties/list")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setProperties(d ?? []))
      .catch(() => { setProperties([]); setError("Couldn't load listings. Refresh to try again."); });
  }, []);

  async function remove(p: Property) {
    if (!confirm(`Delete "${p.title || p.address}"? This can't be undone.`)) return;
    setBusy(p.id);
    const res = await fetch(`/api/admin/properties/${p.id}`, { method: "DELETE" });
    if (res.ok) setProperties((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
    else if (res.status === 401) setError("You've been signed out. Sign in again, then delete.");
    else setError("Couldn't delete that listing. Try again.");
    setBusy(null);
  }

  async function togglePublish(p: Property) {
    setBusy(p.id);
    const res = await fetch(`/api/admin/properties/${p.id}/publish`, { method: p.status === "published" ? "DELETE" : "POST" });
    if (res.ok) {
      const { status } = await res.json();
      setProperties((prev) => prev?.map((x) => (x.id === p.id ? { ...x, status } : x)) ?? null);
    } else setError("Couldn't change that listing. Try again.");
    setBusy(null);
  }

  async function markRented(p: Property) {
    setBusy(p.id);
    const res = await fetch(`/api/admin/properties/${p.id}/rented`, { method: "POST" });
    if (res.ok) setProperties((prev) => prev?.map((x) => (x.id === p.id ? { ...x, status: "rented" } : x)) ?? null);
    else setError("Couldn't mark that listing rented. Try again.");
    setBusy(null);
  }

  // Archived homes were deleted but kept because they have applications or showings on file.
  const all = (properties ?? []).filter((p) => p.status !== "archived");
  const shown = filter === "all" ? all : all.filter((p) => p.status === filter);

  return (
    <Page>
      <PageHeader
        title="Listings"
        subtitle="Homes on the website, and drafts you haven't finished."
        actions={<Button href="/admin/properties/new" variant="primary">+ Add a listing</Button>}
      />
      {error && <ErrorNote>{error}</ErrorNote>}

      {!properties ? <Loading /> : (
        <>
          <Tabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: all.length },
              { value: "published", label: "Live", count: all.filter((p) => p.status === "published").length },
              { value: "rented", label: "Rented", count: all.filter((p) => p.status === "rented").length },
              { value: "draft", label: "Drafts", count: all.filter((p) => p.status === "draft").length },
            ]}
          />
          {shown.length === 0 ? (
            <EmptyState
              title={filter === "draft" ? "No drafts" : filter === "published" ? "Nothing live right now" : filter === "rented" ? "No rented homes yet" : "No listings yet"}
              action={filter === "all" ? <Button href="/admin/properties/new" variant="primary">+ Add a listing</Button> : undefined}
            />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {shown.map((p) => (
                <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", opacity: busy === p.id ? 0.6 : 1 }}>
                  <Link href={`/admin/properties/${p.id}`} style={{ position: "relative", display: "block", aspectRatio: "4 / 3", background: C.greyBg }}>
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.faint, fontSize: 14 }}>No photos yet</div>
                    )}
                    <span style={{ position: "absolute", top: 12, left: 12 }}>
                      {p.status === "published" ? <Badge tone="green">Live</Badge>
                        : p.status === "rented" ? <Badge tone="blue">Rented</Badge>
                        : <Badge tone="amber">Draft</Badge>}
                    </span>
                  </Link>
                  <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <Link href={`/admin/properties/${p.id}`} style={{ color: C.text, fontWeight: 700, fontSize: 17, lineHeight: 1.3, textDecoration: "none" }}>
                      {p.title || "Untitled listing"}
                    </Link>
                    <div style={{ fontSize: 14, color: C.muted }}>{titleCaseAddress(p.address)}{p.city ? `, ${p.city}` : ""}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{p.price ? money(p.price) : "No rent set"}</span>
                      {p.price ? <span style={{ fontSize: 14, color: C.muted }}>/mo</span> : null}
                      <span style={{ fontSize: 14, color: C.muted, marginLeft: "auto" }}>
                        {[p.bedrooms ? `${p.bedrooms} bed` : null, p.bathrooms ? `${p.bathrooms} bath` : null].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 16, flexWrap: "wrap", alignItems: "center" }}>
                      <Button href={`/admin/properties/${p.id}`} size="sm">Edit</Button>
                      <Button href={`/admin/properties/${p.id}/brief`} size="sm">Brief</Button>
                      {p.status === "published" && (
                        <Button size="sm" onClick={() => markRented(p)} disabled={busy === p.id}>Mark rented</Button>
                      )}
                      <Button size="sm" onClick={() => togglePublish(p)} disabled={busy === p.id}>
                        {p.status === "published" ? "Take down" : p.status === "rented" ? "Relist" : "Publish"}
                      </Button>
                      <button type="button" onClick={() => remove(p)} disabled={busy === p.id} style={{ marginLeft: "auto", background: "none", border: "none", color: C.red, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "6px 4px" }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Page>
  );
}
