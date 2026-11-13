import ClientDashboard from "@/components/client/ClientDashboard";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ClientDashboard token={token} />;
}
