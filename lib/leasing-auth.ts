/**
 * Leasing employee auth — HMAC session cookie, same pattern as admin-auth.ts
 * Cookie: leasing_session
 * Token format: {employeeId}|{expires}|{hmac(employeeId|expires)}
 */
import { NextRequest, NextResponse } from "next/server";

const COOKIE = "leasing_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  return process.env.LEASING_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createLeasingSession(employeeId: string): Promise<string> {
  const expires = String(Date.now() + SESSION_DURATION_MS);
  const payload = `${employeeId}|${expires}`;
  const sig = await hmac(payload, getSecret());
  return `${payload}|${sig}`;
}

export async function verifyLeasingSession(token: string): Promise<{ valid: boolean; employeeId: string | null }> {
  try {
    const parts = token.split("|");
    if (parts.length !== 3) return { valid: false, employeeId: null };
    const [employeeId, expiresStr, sigHex] = parts;
    if (Date.now() > Number(expiresStr)) return { valid: false, employeeId: null };
    const expectedSig = await hmac(`${employeeId}|${expiresStr}`, getSecret());
    if (!timingSafeEqual(expectedSig, sigHex)) return { valid: false, employeeId: null };
    return { valid: true, employeeId };
  } catch {
    return { valid: false, employeeId: null };
  }
}

export async function isLeasingAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return false;
  const { valid } = await verifyLeasingSession(token);
  return valid;
}

export async function getLeasingEmployee(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  const { valid, employeeId } = await verifyLeasingSession(token);
  return valid ? employeeId : null;
}

export function setLeasingSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });
}

export function clearLeasingSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
}

/** Use in leasing API routes — accepts EITHER admin or leasing session */
export async function isLeasingOrAdminAuthenticated(req: NextRequest): Promise<boolean> {
  const { isAdminAuthenticated } = await import("@/lib/admin-auth");
  return (await isAdminAuthenticated(req)) || (await isLeasingAuthenticated(req));
}
