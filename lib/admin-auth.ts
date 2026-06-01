import { NextRequest } from "next/server";

async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [expiresStr, sigHex] = token.split("|");
    if (!expiresStr || !sigHex) return false;
    if (Date.now() > Number(expiresStr)) return false;
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "fallback";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expiresStr));
    const expectedHex = Array.from(new Uint8Array(expectedSig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (expectedHex.length !== sigHex.length) return false;
    let diff = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      diff |= expectedHex.charCodeAt(i) ^ sigHex.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
