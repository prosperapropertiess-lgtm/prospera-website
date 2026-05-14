import { NextRequest, NextResponse } from "next/server";

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
    const expectedHex = Array.from(new Uint8Array(expectedSig)).map((b) => b.toString(16).padStart(2, "0")).join("");
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Coming soon curtain ───────────────────────────────────────────────────
  const siteLive = process.env.SITE_LIVE === "true";
  const rawToken = req.cookies.get("admin_session")?.value ?? "";
  const isAdminSession = rawToken ? await verifySessionToken(rawToken) : false;
  const isExcluded =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/coming-soon") ||
    pathname.startsWith("/_next") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico";

  if (!siteLive && !isAdminSession && !isExcluded) {
    const url = req.nextUrl.clone();
    url.pathname = "/coming-soon";
    return NextResponse.redirect(url);
  }

  // ── Admin auth guard ──────────────────────────────────────────────────────
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    if (!isAdminSession) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Agent auth guard ──────────────────────────────────────────────────────
  // Cookie presence only — full token validation happens inside each route
  if (
    pathname.startsWith("/agents") &&
    !pathname.startsWith("/agents/login")
  ) {
    const agentSession = req.cookies.get("agent_session")?.value;
    if (!agentSession) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/agents/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
