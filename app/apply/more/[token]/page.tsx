import type { Metadata } from "next";
import { Shell, heading, MUTED } from "@/components/flow/FlowUI";
import { loadInfoRequest } from "@/lib/application-info-request";
import MoreInfoForm from "./MoreInfoForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "A few more details | Prospera Properties" }, robots: { index: false } };

// The private link from "we need a little more" emails.
export default async function MoreInfoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await loadInfoRequest(token);
  const closed = !data || data.req.cancelled_at || ["approved", "rejected"].includes(data.app.status);

  if (closed || data.req.completed_at) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-3" style={heading}>{data?.req.completed_at ? "Got it. Thank you." : "This link isn't working"}</h1>
        <p className="text-base mb-2" style={{ color: "#333" }}>
          {data?.req.completed_at ? "We have what you sent and we'll be in touch soon." : data ? "We don't need anything else from this link." : "The link may be incomplete. Try opening it again from your email."}
        </p>
        <p className="text-sm" style={{ color: MUTED }}>Questions? Call or text (519) 697-1227.</p>
      </Shell>
    );
  }

  return (
    <MoreInfoForm
      token={token}
      first={data.app.tenant_name.trim().split(/\s+/)[0] || "there"}
      address={data.app.properties ? `${data.app.properties.address}, ${data.app.properties.city}` : "your new home"}
      docTypes={data.req.doc_types as string[]}
      questions={data.req.questions as string[]}
      note={data.req.note}
    />
  );
}
