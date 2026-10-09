import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const KEY_PREFIX = "pk_live_";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** Generate a new API key. Returns the full key (shown once) + what gets stored. */
export function generateApiKey(): { fullKey: string; keyHash: string; keyPrefix: string } {
  const secret = randomBytes(24).toString("hex");
  const fullKey = `${KEY_PREFIX}${secret}`;
  return {
    fullKey,
    keyHash: hashKey(fullKey),
    keyPrefix: fullKey.slice(0, KEY_PREFIX.length + 6), // enough to recognize, not enough to guess
  };
}

/** Verifies the Authorization: Bearer <key> header against the api_keys table. */
export async function verifyApiKey(req: NextRequest): Promise<{ valid: boolean; keyId?: string }> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return { valid: false };
  const key = authHeader.slice(7).trim();
  if (!key) return { valid: false };

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("api_keys")
    .select("id, revoked_at")
    .eq("key_hash", hashKey(key))
    .maybeSingle();

  if (!data || data.revoked_at) return { valid: false };

  // Non-blocking — don't make the caller wait on this write.
  supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(
    () => {},
    () => {}
  );

  return { valid: true, keyId: data.id };
}

/**
 * Logs one agent action for visibility in /admin/api-keys — so "what has
 * Muse actually been doing with this key" has a real answer instead of
 * just a last-used timestamp. Never blocks or fails the caller's request.
 */
export async function logApiKeyActivity(keyId: string | undefined, action: string, summary: string, propertyId?: string) {
  if (!keyId) return;
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("api_key_activity").insert([{ key_id: keyId, action, summary, property_id: propertyId ?? null }]);
  } catch (err) {
    console.error("[logApiKeyActivity] failed:", err);
  }
}
