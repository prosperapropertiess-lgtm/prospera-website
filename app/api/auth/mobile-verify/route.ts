import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ success: false, message: "Email and code required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up the OTP
    const { data: otp } = await supabaseAdmin
      .from("mobile_otp")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) {
      return NextResponse.json({ success: false, message: "Invalid or expired code" }, { status: 401 });
    }

    // Mark OTP as used
    await supabaseAdmin
      .from("mobile_otp")
      .update({ used: true })
      .eq("id", otp.id);

    // Determine role and get token
    let role: string | null = null;
    let token: string | null = null;
    let name: string | null = null;

    // Check tenant
    const { data: tenantOnboard } = await supabaseAdmin
      .from("tenant_onboarding_sessions")
      .select("tenant_email, tenant_name, portal_token")
      .ilike("tenant_email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (tenantOnboard?.portal_token) {
      role = "tenant";
      token = tenantOnboard.portal_token;
      name = tenantOnboard.tenant_name;
    }

    // Check owner
    if (!role) {
      const { data: ownerSession } = await supabaseAdmin
        .from("onboarding_sessions")
        .select("token, owner_name, owner_email")
        .ilike("owner_email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (ownerSession) {
        role = "owner";
        token = ownerSession.token;
        name = ownerSession.owner_name;
      }
    }

    // Check admin
    if (!role) {
      const adminEmail = process.env.ADMIN_EMAIL || "prosperapropertiess@gmail.com";
      if (normalizedEmail === adminEmail.toLowerCase()) {
        role = "admin";
        name = "Ebin";

        // Generate admin session token (same HMAC pattern as web)
        const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        const signature = crypto
          .createHmac("sha256", secret)
          .update(String(expiresAt))
          .digest("hex");
        token = `${expiresAt}|${signature}`;
      }
    }

    if (!role || !token) {
      return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      token,
      role,
      name: name || "",
    });
  } catch (err) {
    console.error("Mobile verify error:", err);
    return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 });
  }
}
