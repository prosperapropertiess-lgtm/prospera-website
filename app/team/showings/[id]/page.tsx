import { redirect } from "next/navigation";

// Old single-showing links now open the whole viewing session.
export default async function OldShowing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/team/session/${id}`);
}
