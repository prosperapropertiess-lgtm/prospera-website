import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const MAINTENANCE_STATUSES = [
  "submitted",
  "acknowledged",
  "triage",
  "vendor_assigned",
  "scheduled",
  "work_complete",
  "verified",
  "closed",
  "cancelled",
] as const;

export type MaintenanceStatus = typeof MAINTENANCE_STATUSES[number];

export const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  submitted: "New",
  acknowledged: "Acknowledged",
  triage: "In Triage",
  vendor_assigned: "Vendor Assigned",
  scheduled: "Scheduled",
  work_complete: "Awaiting Verification",
  verified: "Verified",
  closed: "Closed",
  cancelled: "Cancelled",
};

export interface Vendor {
  id: string;
  name: string;
  trade: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface StaffMaintenanceRequest {
  id: string;
  tenant_id: string;
  property_id: string;
  category: string;
  description: string;
  troubleshooting_steps: string;
  ai_diagnosis: string;
  status: MaintenanceStatus;
  vendor_id: string | null;
  vendor_token: string | null;
  admin_notes: string | null;
  scheduled_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  vendors: { id: string; name: string; trade: string; phone: string | null } | null;
}

export interface WorkOrderEvent {
  id: string;
  request_id: string;
  event_type: string;
  actor: string | null;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function generateVendorToken(): string {
  return randomBytes(24).toString("hex");
}

export async function logWorkOrderEvent(
  requestId: string,
  eventType: string,
  actor: string,
  metadata?: Record<string, unknown>
) {
  const db = getSupabaseAdmin();
  await db.from("work_order_status_events").insert({
    request_id: requestId,
    event_type: eventType,
    actor,
    metadata: metadata ?? null,
  });
}

export async function getVendorJob(token: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("tenant_maintenance_requests")
    .select("id, category, description, status, property_id, scheduled_at, created_at, vendors(id, name, trade)")
    .eq("vendor_token", token)
    .single();
  if (error || !data) return null;
  return data;
}
