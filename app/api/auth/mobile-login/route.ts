import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check which role this email belongs to
    let role: string | null = null;

    // Check tenant_access
    const { data: tenant } = await supabaseAdmin
      .from("tenant_access")
      .select("token, tenant_name")
      .ilike("tenant_name", `%${normalizedEmail}%`)
      .limit(1)
      .maybeSingle();

    // Tenants don't have email in tenant_access directly — check by looking up
    // the email might be stored differently. Let's also check onboarding sessions.
    if (!tenant) {
      // Check if email matches any tenant via tenant_onboarding_sessions
      const { data: tenantOnboard } = await supabaseAdmin
        .from("tenant_onboarding_sessions")
        .select("tenant_email, portal_token")
        .ilike("tenant_email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (tenantOnboard?.portal_token) {
        role = "tenant";
      }
    } else {
      role = "tenant";
    }

    // Check owner_access
    if (!role) {
      const { data: owner } = await supabaseAdmin
        .from("owner_access")
        .select("token")
        .limit(1);

      // Owner access doesn't have email — check onboarding_sessions
      const { data: ownerSession } = await supabaseAdmin
        .from("onboarding_sessions")
        .select("token, owner_email")
        .ilike("owner_email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (ownerSession) {
        role = "owner";
      }
    }

    // Check admin
    if (!role) {
      const adminEmail = process.env.ADMIN_EMAIL || "prosperapropertiess@gmail.com";
      if (normalizedEmail === adminEmail.toLowerCase()) {
        role = "admin";
      }
    }

    if (!role) {
      return NextResponse.json({ success: false, message: "No account found with that email" }, { status: 404 });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Store OTP
    await supabaseAdmin.from("mobile_otp").insert({
      email: normalizedEmail,
      code,
      expires_at: expiresAt,
      used: false,
    });

    // Send OTP email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: normalizedEmail,
      subject: `${code} — Your Prospera login code`,
      html: `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: #1F2F3A; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: #FAF8F5; font-size: 20px; font-weight: 700;">P</span>
            </div>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; color: #1F2F3A; text-align: center; margin-bottom: 8px;">
            Your login code
          </h1>
          <p style="font-size: 15px; color: #666; text-align: center; margin-bottom: 32px;">
            Enter this code in the Prospera app to sign in.
          </p>
          <div style="background: #F7F5F2; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1F2F3A;">
              ${code}
            </span>
          </div>
          <p style="font-size: 13px; color: #999; text-align: center;">
            This code expires in 10 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mobile login error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
