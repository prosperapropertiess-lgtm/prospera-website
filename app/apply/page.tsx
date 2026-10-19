import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";

// The short, evergreen application link: prosperaproperties.co/apply.
// Sends tenants to the active agent's property picker, same agent lookup
// as lib/application-invite.ts.
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const { data: agents } = await getSupabaseAdmin()
    .from("agents")
    .select("id")
    .eq("is_active", true)
    .limit(1);

  const agent = agents?.[0];
  if (!agent) redirect("/contact");

  redirect(`/apply/${agent.id}/choose`);
}
