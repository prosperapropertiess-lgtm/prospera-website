import ClientDashboard from "@/components/client/ClientDashboard";

export default async function Page({ params }: { params: Promise<{ token: string; placementId: string }> }) {
  const { token, placementId } = await params;
  return <ClientDashboard token={token} placementId={placementId} />;
}
