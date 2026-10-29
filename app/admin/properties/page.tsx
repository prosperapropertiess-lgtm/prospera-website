"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Page, PageHeader, Tabs, Table, td, Badge, Button, EmptyState, Loading, ErrorNote, C, money, titleCaseAddress } from "@/components/admin/kit";

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

type Filter = "all" | "published" | "draft";

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

  const all = properties ?? [];
  const shown = filter === "all" ? all : all.filter((p) => (filter === "draft" ? p.status !== "published" : p.status === filter));

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
              { value: "draft", label: "Drafts", count: all.filter((p) => p.status !== "published").length },
            ]}
          />
          {shown.length === 0 ? (
            <EmptyState
              title={filter === "draft" ? "No drafts" : filter === "published" ? "Nothing live right now" : "No listings yet"}
              action={filter === "all" ? <Button href="/admin/properties/new" variant="primary">+ Add a listing</Button> : undefined}
            />
          ) : (
            <Table head={["", "Home", "Rent", "Beds", "Status", ""]}>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td style={{ ...td, width: 72 }}>
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, display: "block" }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 10, background: C.greyBg }} />
                    )}
                  </td>
                  <td style={td}>
                    <Link href={`/admin/properties/${p.id}`} style={{ color: C.text, fontWeight: 600, textDecoration: "none" }}>
                      {p.title || "Untitled listing"}
                    </Link>
                    <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{titleCaseAddress(p.address)}{p.city ? `, ${p.city}` : ""}</div>
                  </td>
                  <td style={{ ...td, fontWeight: 600, whiteSpace: "nowrap" }}>{p.price ? `${money(p.price)}/mo` : "—"}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{p.bedrooms || "—"}</td>
                  <td style={td}>
                    {p.status === "published" ? <Badge tone="green">Live</Badge>
                      : p.status === "draft" ? <Badge tone="amber">Draft, step {p.wizard_step || 1} of 8</Badge>
                      : <Badge>Archived</Badge>}
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <Button href={`/admin/properties/${p.id}`} size="sm">Edit</Button>
                      <Button size="sm" onClick={() => togglePublish(p)} disabled={busy === p.id}>
                        {p.status === "published" ? "Take down" : "Publish"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(p)} disabled={busy === p.id}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </>
      )}
    </Page>
  );
}
