import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { email } = await searchParams;

  if (email && email.includes("@")) {
    const sb = getSupabaseAdmin();
    await sb
      .from("email_sequence_state")
      .update({ unsubscribed: true })
      .eq("email", email.toLowerCase().trim());

    // Also mark in subscribers table
    await sb
      .from("subscribers")
      .update({ unsubscribed: true })
      .eq("email", email.toLowerCase().trim());
  }

  // Redirect to a static confirmation page (avoid double-clicks)
  redirect("/unsubscribe/confirmed");
}
