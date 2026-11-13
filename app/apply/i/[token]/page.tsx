import type { Metadata } from "next";
import ApplicationForm from "@/components/apply/ApplicationForm";
import { Shell, heading, MUTED } from "@/components/flow/FlowUI";
import { loadInvite, applicationAgentId } from "@/lib/application-invite";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Your rental application | Prospera Properties" }, robots: { index: false } };

// The personal application link from the after-viewing email.
export default async function PersonalApplyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await loadInvite(token);

  if (!data?.property || !data.property.available || !data.property.is_managed) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-3" style={heading}>This link isn&apos;t working</h1>
        <p className="text-base mb-2" style={{ color: "#333" }}>{data ? "This home isn't taking applications anymore." : "The link may be incomplete. Try opening it again from your email."}</p>
        <p className="text-sm" style={{ color: MUTED }}>Call or text (519) 697-1227 and we&apos;ll help.</p>
      </Shell>
    );
  }
  if (data.invite.application_id) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-3" style={heading}>You&apos;ve already applied</h1>
        <p className="text-base mb-6" style={{ color: "#333" }}>We have your application for {data.property.address}. We&apos;ll be in touch once we&apos;ve reviewed it.</p>
        <a href={`/apply/status/${data.invite.application_id}`} className="underline" style={{ color: "#1F2F3A" }}>Check its status</a>
      </Shell>
    );
  }

  return (
    <ApplicationForm
      property={data.property}
      agentId={await applicationAgentId()}
      inviteToken={token}
      invite={{ name: data.invite.name, email: data.invite.email, phone: data.invite.phone, viewing: data.viewing }}
    />
  );
}
