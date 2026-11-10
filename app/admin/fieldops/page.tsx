"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Page, PageHeader, Tabs, Button } from "@/components/admin/kit";
import Overview from "./Overview";
import Calendar from "./Calendar";
import Specialists from "./Specialists";
import Homes from "./Homes";
import Pay from "./Pay";
import Settings from "./Settings";
import ApptPanel from "./ApptPanel";
import BookPanel from "./BookPanel";

type Tab = "overview" | "calendar" | "team" | "homes" | "pay" | "settings";
const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Today" },
  { value: "calendar", label: "Calendar" },
  { value: "team", label: "Specialists" },
  { value: "homes", label: "Homes & booking rules" },
  { value: "pay", label: "Pay" },
  { value: "settings", label: "Settings" },
];

export default function FieldOpsPage() {
  return <Suspense fallback={null}><FieldOps /></Suspense>;
}

function FieldOps() {
  const router = useRouter();
  const sp = useSearchParams();
  const tab = (TABS.some((t) => t.value === sp.get("tab")) ? sp.get("tab") : "overview") as Tab;
  const open = sp.get("appt");
  const [booking, setBooking] = useState(false);
  const [version, setVersion] = useState(0);

  const setParam = useCallback((k: string, v: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.push(`/admin/fieldops?${p.toString()}`, { scroll: false });
  }, [router, sp]);
  const refresh = () => setVersion((v) => v + 1);

  useEffect(() => { document.title = "FieldOps — Prospera"; }, []);

  return (
    <Page width={1240}>
      <PageHeader
        title="Showings"
        subtitle="Tenants book real open times. The right specialist is assigned automatically. You can see and change everything here."
        actions={<Button variant="primary" onClick={() => setBooking(true)}>Book a viewing</Button>}
      />
      <Tabs value={tab} onChange={(v) => setParam("tab", v === "overview" ? null : v)} options={TABS} />
      <div key={version}>
        {tab === "overview" && <Overview onOpen={(id) => setParam("appt", id)} onTab={(t) => setParam("tab", t)} />}
        {tab === "calendar" && <Calendar onOpen={(id) => setParam("appt", id)} />}
        {tab === "team" && <Specialists />}
        {tab === "homes" && <Homes />}
        {tab === "pay" && <Pay />}
        {tab === "settings" && <Settings />}
      </div>
      {open && <ApptPanel id={open} onClose={() => setParam("appt", null)} onChanged={refresh} />}
      {booking && <BookPanel onClose={() => setBooking(false)} onBooked={(id) => { setBooking(false); refresh(); setParam("appt", id); }} />}
    </Page>
  );
}
