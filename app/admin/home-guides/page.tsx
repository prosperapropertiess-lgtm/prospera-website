import { HomeGuidesClient } from "./HomeGuidesClient";

export const dynamic = "force-dynamic";

export default function AdminHomeGuidesPage() {
  const adminSecret = process.env.ADMIN_API_SECRET ?? "";
  return <HomeGuidesClient adminSecret={adminSecret} />;
}
