"use client";
import { useEffect, useState, useCallback } from "react";
import { Page, PageHeader, Card, Badge, Button, Loading, ErrorNote, SuccessNote, C, ago } from "@/components/admin/kit";

interface Job {
  id: string;
  name: string;
  what: string;
  when: string;
  runnable: boolean;
  lastRun: { status: string; ran_at: string } | null;
}

export default function AutomationsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ops");
    if (!res.ok) { setJobs([]); setError("Couldn't load automations. Refresh to try again."); return; }
    setJobs((await res.json()).jobs);
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function run(job: Job) {
    setRunning(job.id); setError(null); setNotice(null);
    const res = await fetch("/api/admin/ops", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: job.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setNotice(`${job.name} ran.`); await load(); }
    else setError(`${job.name}: ${data.error ?? "it failed."}`);
    setRunning(null);
  }

  return (
    <Page width={900}>
      <PageHeader title="Automations" subtitle="The jobs that run on their own, and when they last ran." />
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <SuccessNote>{notice}</SuccessNote>}

      {!jobs ? <Loading /> : (
        <Card padding={0}>
          {jobs.map((j, i) => (
            <div key={j.id} style={{ padding: "20px 24px", borderTop: i ? `1px solid ${C.border}` : "none", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{j.name}</div>
                <div style={{ fontSize: 15, color: C.text, marginTop: 4 }}>{j.what}</div>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{j.when}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 150 }}>
                {j.lastRun ? (
                  <>
                    <Badge tone={j.lastRun.status === "success" ? "green" : "red"}>{j.lastRun.status === "success" ? "Worked" : "Failed"}</Badge>
                    <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{ago(j.lastRun.ran_at)}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: C.faint }}>Doesn&apos;t record its runs</div>
                )}
              </div>
              {j.runnable && <Button size="sm" onClick={() => run(j)} disabled={running === j.id}>{running === j.id ? "Running…" : "Run now"}</Button>}
            </div>
          ))}
        </Card>
      )}
    </Page>
  );
}
