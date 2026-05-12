import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { newPropertyAgentEmail } from "@/lib/emails";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

function isAuthenticated(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  return session?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = getAdminClient();

  const { data, error } = await supabase.from("properties").insert([{ ...body, is_managed: true }]).select().single();
  if (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify all active agents about the new property (non-blocking)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && data) {
    (async () => {
      try {
        const { data: agents } = await supabaseAdmin
          .from("agents")
          .select("id, name, email")
          .eq("is_active", true);

        if (!agents?.length) return;

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await Promise.all(
          agents.map((agent) =>
            resend.emails.send({
              from: "Prospera Properties <hello@prosperaproperties.co>",
              to: agent.email,
              subject: `New property available — ${data.address}, ${data.city}`,
              html: newPropertyAgentEmail({
                agentName: agent.name,
                propertyAddress: data.address ?? "",
                propertyCity: data.city ?? "",
                bedrooms: data.beds ?? 0,
                bathrooms: data.baths ?? 0,
                price: Number(data.price ?? 0),
                propertyId: data.id,
                agentId: agent.id,
              }),
            }).catch((err: unknown) =>
              console.error(`[properties] Agent notification failed for ${agent.email}:`, err)
            )
          )
        );
      } catch (err) {
        console.error("[properties] Agent notification batch failed:", err);
      }
    })();
  }

  return NextResponse.json(data, { status: 201 });
}
