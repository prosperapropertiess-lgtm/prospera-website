import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days — review emails aren't always acted on same-day

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

/** Signed token for one-tap approve/reject links in the review email. Same HMAC pattern as the admin session cookie. */
export function createQuickActionToken(applicationId: string, decision: "approved" | "rejected"): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${applicationId}|${decision}|${expires}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyQuickActionToken(token: string, applicationId: string): { valid: boolean; decision?: "approved" | "rejected" } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [id, decision, expiresStr, sig] = decoded.split("|");
    if (!id || !decision || !expiresStr || !sig) return { valid: false };
    if (id !== applicationId) return { valid: false };
    if (decision !== "approved" && decision !== "rejected") return { valid: false };
    if (Date.now() > Number(expiresStr)) return { valid: false };

    const payload = `${id}|${decision}|${expiresStr}`;
    const expectedSig = createHmac("sha256", secret()).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false };

    return { valid: true, decision };
  } catch {
    return { valid: false };
  }
}
