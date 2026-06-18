import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchAllTenants, fetchAllProperties, fetchRentForTenant } from "@/lib/notion";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface TenantInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyAddress: string;
  propertyCity: string;
  propertyType: string;
  monthlyRent: number | null;
  securityDeposit: number | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  status: string;
}

export interface TenantRentEntry {
  id: string;
  month: string;
  year: number;
  amountDue: number | null;
  amountPaid: number | null;
  datePaid: string | null;
  paymentStatus: string;
}

export interface TenantDocument {
  id: string;
  tenant_id: string;
  property_id: string;
  label: string;
  category: "Lease Agreement" | "Inspection Report" | "Notice" | "Receipt" | "Other";
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

export interface MaintenanceRequest {
  id: string;
  tenant_id: string;
  property_id: string;
  category: string;
  description: string;
  troubleshooting_steps: string;
  ai_diagnosis: string;
  status: "submitted" | "acknowledged" | "scheduled" | "resolved";
  created_at: string;
  updated_at: string;
}

export interface TenantMessage {
  id: string;
  tenant_id: string;
  author: "tenant" | "ai" | "ebin";
  author_name: string;
  content: string;
  created_at: string;
}

export interface HomeGuideSection {
  id: string;
  property_id: string;
  section: string;
  title: string;
  content: string;
  sort_order: number;
  updated_at: string;
}

export interface ScheduleEvent {
  id: string;
  property_id: string;
  event_type: "inspection" | "maintenance" | "reminder" | "garbage" | "other";
  title: string;
  description: string | null;
  event_date: string | null;
  recurring: string | null;
  created_at: string;
}

export interface TenantAccessRecord {
  notion_tenant_id: string;
  tenant_name: string;
  property_id: string;
}

// ── Data access functions ─────────────────────────────────────────────────────

export async function validateTenantToken(token: string): Promise<TenantAccessRecord | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("tenant_access")
    .select("notion_tenant_id, tenant_name, property_id")
    .eq("token", token)
    .single();
  return data ?? null;
}

export async function getTenantInfo(notionTenantId: string): Promise<TenantInfo | null> {
  const [tenants, properties] = await Promise.all([
    fetchAllTenants(),
    fetchAllProperties(),
  ]);

  const tenant = tenants.find((t) => t.id === notionTenantId);
  if (!tenant) return null;

  const property = properties.find((p) => p.id === tenant.propertyId);

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    propertyId: tenant.propertyId,
    propertyAddress: property?.address ?? "",
    propertyCity: property?.city ?? "",
    propertyType: property?.type ?? "",
    monthlyRent: tenant.monthlyRent,
    securityDeposit: tenant.securityDeposit,
    leaseStart: tenant.leaseStart,
    leaseEnd: tenant.leaseEnd,
    status: tenant.status,
  };
}

export async function getTenantRentHistory(notionTenantId: string): Promise<TenantRentEntry[]> {
  const entries = await fetchRentForTenant(notionTenantId);
  return entries.map((e) => ({
    id: e.id,
    month: e.month,
    year: e.year ?? 0,
    amountDue: e.amountDue,
    amountPaid: e.amountPaid,
    datePaid: e.datePaid,
    paymentStatus: e.paymentStatus,
  }));
}

export async function getTenantDocuments(token: string): Promise<TenantDocument[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("tenant_documents")
    .select("id, tenant_id, property_id, label, category, storage_path, file_name, file_size, mime_type, uploaded_at")
    .eq("token", token)
    .order("uploaded_at", { ascending: false })
    .limit(100);
  return (data ?? []) as TenantDocument[];
}

export async function getTenantMaintenanceRequests(token: string): Promise<MaintenanceRequest[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("tenant_maintenance_requests")
    .select("id, tenant_id, property_id, category, description, troubleshooting_steps, ai_diagnosis, status, created_at, updated_at")
    .eq("token", token)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as MaintenanceRequest[];
}

export async function getTenantMessages(token: string): Promise<TenantMessage[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("tenant_messages")
    .select("id, tenant_id, author, author_name, content, created_at")
    .eq("token", token)
    .order("created_at", { ascending: true })
    .limit(50);
  return (data ?? []) as TenantMessage[];
}

export async function getPropertyHomeGuide(propertyId: string): Promise<HomeGuideSection[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("property_home_guide")
    .select("id, property_id, section, title, content, sort_order, updated_at")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });
  return (data ?? []) as HomeGuideSection[];
}

export async function getPropertySchedule(propertyId: string): Promise<ScheduleEvent[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("property_schedule")
    .select("id, property_id, event_type, title, description, event_date, recurring, created_at")
    .eq("property_id", propertyId)
    .order("event_date", { ascending: true });
  return (data ?? []) as ScheduleEvent[];
}
