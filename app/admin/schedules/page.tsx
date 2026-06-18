import { SchedulesClient } from "./SchedulesClient";

export const dynamic = "force-dynamic";

export default function AdminSchedulesPage() {
  const adminSecret = process.env.ADMIN_API_SECRET ?? "";
  return <SchedulesClient adminSecret={adminSecret} />;
}
