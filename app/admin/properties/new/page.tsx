import PropertyWizard from "@/components/admin/property-wizard/PropertyWizard";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ onboard_token?: string }>;
}) {
  const { onboard_token } = await searchParams;
  return <PropertyWizard onboardToken={onboard_token} />;
}
