import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, answers, result, traffic_source } =
      await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await supabase.from("leads").insert([
      {
        name: name || null,
        email,
        phone: phone || null,
        type: "freedom_score",
        message: `Freedom Score: ${result?.overall ?? "?"}/100. Label: ${result?.label ?? ""}. Subscores: comm=${result?.subscores?.communication ?? "?"}, maint=${result?.subscores?.maintenance ?? "?"}, fin=${result?.subscores?.financial ?? "?"}, ops=${result?.subscores?.operational ?? "?"}, time=${result?.subscores?.time ?? "?"}, stress=${result?.subscores?.stress ?? "?"}`,
        source: traffic_source ?? "direct",
      },
    ]);

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && result) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails
        .send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `New Freedom Score: ${name || "Unknown"} scored ${result.overall}/100`,
          html: `
            <h2>New Property Freedom Score submission</h2>
            <p><strong>Name:</strong> ${name || "Not provided"}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Overall Score:</strong> ${result.overall}/100 — ${result.label}</p>
            <hr />
            <p><strong>Communication:</strong> ${result.subscores.communication}/100</p>
            <p><strong>Maintenance:</strong> ${result.subscores.maintenance}/100</p>
            <p><strong>Financial:</strong> ${result.subscores.financial}/100</p>
            <p><strong>Operational:</strong> ${result.subscores.operational}/100</p>
            <p><strong>Time:</strong> ${result.subscores.time}/100</p>
            <p><strong>Stress:</strong> ${result.subscores.stress}/100</p>
            <hr />
            <p><strong>Yearly hours estimated:</strong> ${result.yearlyHours}</p>
            <p><strong>Monthly hours estimated:</strong> ${result.monthlyHours}</p>
            <p><strong>Top bottlenecks:</strong> ${(result.bottlenecks ?? []).join(", ")}</p>
          `,
        })
        .catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[freedom-score] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
