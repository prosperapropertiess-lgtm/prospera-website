import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase.from("properties").select("*").eq("id", id).single();
  if (!data) notFound();

  return <PropertyForm initial={data} />;
}
