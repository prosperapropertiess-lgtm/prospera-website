import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

async function isAuthenticated(req: NextRequest) {
  return isAdminAuthenticated(req);
}

export async function GET(req: NextRequest) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") ?? "all";
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "200"), 200);

  const supabase = getSupabaseAdmin();

  const [contactsRes, subscribersRes] = await Promise.all([
    source !== "subscribers"
      ? supabase
          .from("leads")
          .select("id, name, email, phone, city, message, type, source, property, created_at", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(limit)
      : Promise.resolve({ data: [], error: null, count: 0 }),

    source !== "contacts"
      ? supabase
          .from("subscribers")
          .select("id, name, email, type, preferred_city, source, created_at", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(limit)
      : Promise.resolve({ data: [], error: null, count: 0 }),
  ]);

  const contacts = (contactsRes.data ?? []).map((r) => ({ ...r, _table: "contact" }));
  const subscribers = (subscribersRes.data ?? []).map((r) => ({
    ...r,
    city: r.preferred_city,
    message: null,
    phone: null,
    property: null,
    _table: "subscriber",
  }));

  const merged = [...contacts, ...subscribers].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const organicContacts = contacts.filter((c) =>
    c.source && (c.source.startsWith("blog:") || c.source.startsWith("service:") || c.source === "organic")
  ).length;

  return NextResponse.json({
    total: merged.length,
    contacts: contacts.length,
    subscribers: subscribers.length,
    organic: organicContacts,
    oldest: merged.length > 0 ? merged[merged.length - 1].created_at : null,
    leads: merged,
  });
}

export async function DELETE(req: NextRequest) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, table } = await req.json();
  if (!id || !table) {
    return NextResponse.json({ error: "Missing id or table" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const tableName = table === "contact" ? "leads" : "subscribers";

  const { error } = await supabase.from(tableName).delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
