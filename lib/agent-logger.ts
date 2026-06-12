import { getSupabaseAdmin } from "./supabase";

export async function logAgentRun(
  agent: string,
  status: "success" | "error" | "skipped",
  summary?: Record<string, unknown>,
  durationMs?: number,
  errorMsg?: string
) {
  try {
    const sb = getSupabaseAdmin();
    await sb.from("agent_runs").insert({
      agent,
      status,
      summary: summary ?? null,
      error_msg: errorMsg ?? null,
      duration_ms: durationMs ?? null,
    });
  } catch {
    // Never throw — logging must not break the cron
  }
}
