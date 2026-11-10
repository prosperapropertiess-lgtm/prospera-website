// FieldOps emails. Card-style, same look as the rest of Prospera's emails.
// Every send is logged in fo_messages; an idempotency key means a retried job
// never sends the same message twice, and "sent" is only recorded after the
// provider accepts it.

import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fmtDay, fmtTime } from "./time";

export const SITE = "https://www.prosperaproperties.co";
export const ADMIN_EMAIL = "prosperapropertiess@gmail.com";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export interface CardEmail {
  label: string;                  // top-right, e.g. "VIEWING CONFIRMED"
  pill?: { text: string; tone?: "green" | "grey" | "red" };
  title: string;
  intro: string;                  // may contain <b>
  rows?: [string, string][];
  note?: string;                  // may contain <b>
  button?: { text: string; href: string };
  footer?: string;
}

const PILL = {
  green: "background: rgb(234, 243, 238); color: rgb(49, 91, 76)",
  grey: "background: rgb(240, 240, 238); color: rgb(85, 85, 85)",
  red: "background: rgb(248, 234, 236); color: rgb(139, 32, 48)",
};

export function card(e: CardEmail): string {
  const rows = e.rows?.length ? `
    <tr><td style="padding: 0 40px 22px">
      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid rgb(232, 232, 232); border-radius: 12px; overflow: hidden; background: rgb(250, 250, 250)">
        <tbody>${e.rows.map(([k, v], i) => `
          <tr><td style="padding: 14px 18px; ${i < e.rows!.length - 1 ? "border-bottom: 1px solid rgb(232, 232, 232);" : ""}">
            <div style="font-size: 10px; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; color: rgb(119, 119, 119)">${esc(k.toUpperCase())}</div>
            <div style="margin-top: 5px; font-size: 15px; line-height: 1.45; font-weight: 700; color: rgb(34, 34, 34)">${esc(v)}</div>
          </td></tr>`).join("")}
        </tbody>
      </table>
    </td></tr>` : "";
  const button = e.button ? `
    <tr><td style="padding: 0 40px 26px">
      <table width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr>
        <td align="center" style="background: rgb(31, 47, 58); border-radius: 10px">
          <a href="${esc(e.button.href)}" style="display: block; padding: 15px 20px; font-size: 15px; font-weight: 700; color: rgb(255, 255, 255); text-decoration: none">${esc(e.button.text)}</a>
        </td>
      </tr></tbody></table>
    </td></tr>` : "";
  return `<div style="background: rgb(245, 245, 243); margin: 0; padding: 0">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: rgb(245, 245, 243)">
    <tbody><tr><td align="center" style="padding: 30px 12px">
      <table width="560" cellspacing="0" cellpadding="0" border="0" style="width: 560px; max-width: 560px; background: rgb(255, 255, 255); border-radius: 14px; overflow: hidden; font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
        <tbody>
          <tr><td style="padding: 28px 40px 16px">
            <table width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr>
              <td valign="middle" style="font-size: 19px; line-height: 1; font-weight: 700; letter-spacing: 0.3px; color: rgb(34, 34, 34)">PROSPERA<span style="color: rgb(119, 119, 119); font-size: 10px; letter-spacing: 0.4px"><b>&nbsp;PROPERTIES CO.</b></span></td>
              <td valign="middle" align="right" style="font-size: 10px; line-height: 1.3; font-weight: 700; letter-spacing: 0.6px; color: rgb(119, 119, 119)">${esc(e.label)}</td>
            </tr></tbody></table>
            <div style="height: 1px; line-height: 1px; background: rgb(238, 238, 238); margin-top: 18px">&nbsp;</div>
          </td></tr>
          <tr><td style="padding: 4px 40px 20px">
            ${e.pill ? `<div style="display: inline-block; ${PILL[e.pill.tone ?? "green"]}; border-radius: 999px; padding: 7px 12px; font-size: 11px; line-height: 1; font-weight: 700; letter-spacing: 0.5px">${esc(e.pill.text)}</div>` : ""}
            <h1 style="margin: ${e.pill ? "15px" : "4px"} 0 8px; font-size: 28px; line-height: 1.18; font-weight: 700; color: rgb(34, 34, 34); letter-spacing: -0.4px">${esc(e.title)}</h1>
            <p style="margin: 0; font-size: 15px; line-height: 1.65; color: rgb(85, 85, 85)">${e.intro}</p>
          </td></tr>
          ${rows}
          ${e.note ? `<tr><td style="padding: 0 40px 22px"><div style="background: rgb(250, 250, 250); border: 1px solid rgb(232, 232, 232); border-radius: 12px; padding: 16px 18px; font-size: 13px; line-height: 1.65; color: rgb(102, 102, 102)">${e.note}</div></td></tr>` : ""}
          ${button}
          <tr><td align="center" style="padding: 18px 30px 22px; background: rgb(250, 250, 250); border-top: 1px solid rgb(238, 238, 238); font-size: 11px; line-height: 1.6; color: rgb(153, 153, 153)">
            ${e.footer ? `${e.footer}<br>` : ""}Prospera Properties Co. · London, Ontario · <a href="${SITE}" style="color: rgb(119, 119, 119)">prosperaproperties.co</a>
          </td></tr>
        </tbody>
      </table>
    </td></tr></tbody>
  </table>
</div>`;
}

export interface SendOpts {
  to: string | null | undefined;
  subject: string;
  html: string;
  template: string;
  key: string;                    // idempotency key
  appointmentId?: string | null;
  tokenId?: string | null;
  from?: string;
}

export async function send(o: SendOpts): Promise<"sent" | "failed" | "skipped" | "duplicate"> {
  const sb = getSupabaseAdmin();
  const { data: prior } = await sb.from("fo_messages").select("status").eq("idempotency_key", o.key).maybeSingle();
  if (prior?.status === "sent") return "duplicate";

  const log = async (status: "sent" | "failed" | "skipped", extra: { provider_id?: string; error?: string } = {}) => {
    const row = { appointment_id: o.appointmentId ?? null, booking_token_id: o.tokenId ?? null, recipient: o.to || "(none)", template: o.template, status, idempotency_key: o.key, ...extra };
    if (prior) await sb.from("fo_messages").update({ ...row, created_at: new Date().toISOString() }).eq("idempotency_key", o.key);
    else await sb.from("fo_messages").insert(row);
  };

  if (!o.to) { await log("skipped", { error: "No email address" }); return "skipped"; }
  try {
    const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: o.from ?? "Prospera Properties <hello@prosperaproperties.co>",
      to: [o.to], subject: o.subject, html: o.html,
    });
    if (error || !data?.id) { await log("failed", { error: error?.message ?? "No id returned" }); return "failed"; }
    await log("sent", { provider_id: data.id });
    return "sent";
  } catch (err) {
    await log("failed", { error: err instanceof Error ? err.message : String(err) });
    return "failed";
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

export interface ApptInfo {
  id: string;
  address: string;
  city: string;
  starts_at: string;
  ends_at: string;
  tenant_name: string;
  tenant_phone?: string | null;
}

const when = (a: ApptInfo) => `${fmtDay(a.starts_at)} · ${fmtTime(a.starts_at)} to ${fmtTime(a.ends_at)}`;
const first = (n: string) => n.split(/\s+/)[0] || n;

export const T = {
  invite: (o: { name: string; address: string; city: string; url: string; expires: string }) => ({
    subject: `Pick a time to see ${o.address}`,
    html: card({
      label: "BOOK YOUR VIEWING", pill: { text: "YOU'RE INVITED" },
      title: `Pick a time that works for you.`,
      intro: `Hi ${esc(first(o.name))}, thanks for your interest in <b style="color: rgb(34, 34, 34)">${esc(o.address)}, ${esc(o.city)}</b>. Choose a viewing time below. It takes about a minute.`,
      button: { text: "See available times →", href: o.url },
      note: `This link is just for you and works until <b>${esc(o.expires)}</b>. If no time works, reply to this email.`,
    }),
  }),

  confirmed: (a: ApptInfo, manageUrl: string, updated = false) => ({
    subject: `${updated ? "Updated: " : ""}Your viewing at ${a.address} · ${fmtDay(a.starts_at)}, ${fmtTime(a.starts_at)}`,
    html: card({
      label: updated ? "VIEWING UPDATED" : "VIEWING CONFIRMED", pill: { text: updated ? "NEW TIME" : "CONFIRMED" },
      title: updated ? "Your viewing has a new time." : "You're booked.",
      intro: `Hi ${esc(first(a.tenant_name))}, a Prospera showing specialist will meet you at the home.`,
      rows: [["When", when(a)], ["Where", `${a.address}, ${a.city}`]],
      note: "Please arrive on time. Viewings are short and often back to back. Bring photo ID. If plans change, use the button below so someone else can take the time.",
      button: { text: "Change or cancel", href: manageUrl },
    }),
  }),

  reminder: (a: ApptInfo, manageUrl: string, hours: number) => ({
    subject: `Reminder: viewing ${hours <= 3 ? "soon" : "tomorrow"} at ${a.address}, ${fmtTime(a.starts_at)}`,
    html: card({
      label: "VIEWING REMINDER", pill: { text: hours <= 3 ? "STARTING SOON" : "TOMORROW", tone: "grey" },
      title: hours <= 3 ? "See you soon." : "See you tomorrow.",
      intro: `Hi ${esc(first(a.tenant_name))}, this is a reminder about your viewing.`,
      rows: [["When", when(a)], ["Where", `${a.address}, ${a.city}`]],
      button: { text: "Can't make it? Change or cancel", href: manageUrl },
    }),
  }),

  cancelled: (a: ApptInfo, rebookUrl: string | null) => ({
    subject: `Your viewing at ${a.address} is cancelled`,
    html: card({
      label: "VIEWING CANCELLED", pill: { text: "CANCELLED", tone: "grey" },
      title: "Your viewing is cancelled.",
      intro: `Hi ${esc(first(a.tenant_name))}, your viewing at <b style="color: rgb(34, 34, 34)">${esc(a.address)}</b> on ${esc(fmtDay(a.starts_at))} at ${esc(fmtTime(a.starts_at))} is cancelled.`,
      button: rebookUrl ? { text: "Pick a new time", href: rebookUrl } : undefined,
    }),
  }),

  assigned: (a: ApptInfo, url: string) => ({
    subject: `New showing: ${a.address} · ${fmtDay(a.starts_at)}, ${fmtTime(a.starts_at)}`,
    html: card({
      label: "NEW SHOWING", pill: { text: "ASSIGNED TO YOU" },
      title: `${fmtTime(a.starts_at)}, ${fmtDay(a.starts_at)}`,
      intro: `You're showing <b style="color: rgb(34, 34, 34)">${esc(a.address)}</b> to ${esc(first(a.tenant_name))}.`,
      rows: [["When", when(a)], ["Where", `${a.address}, ${a.city}`]],
      note: "Please open it and tap <b>Got it</b> so we know you've seen it. Access instructions show up in the app the day before.",
      button: { text: "Open the showing →", href: url },
    }),
  }),

  removed: (a: ApptInfo) => ({
    subject: `Showing removed: ${a.address} · ${fmtDay(a.starts_at)}, ${fmtTime(a.starts_at)}`,
    html: card({
      label: "SHOWING UPDATE", pill: { text: "NO LONGER YOURS", tone: "grey" },
      title: "This showing is off your list.",
      intro: `The ${esc(fmtTime(a.starts_at))} showing at <b style="color: rgb(34, 34, 34)">${esc(a.address)}</b> on ${esc(fmtDay(a.starts_at))} was cancelled or moved. Nothing to do.`,
    }),
  }),

  specialistReminder: (a: ApptInfo, url: string) => ({
    subject: `Tomorrow: ${a.address} at ${fmtTime(a.starts_at)}`,
    html: card({
      label: "SHOWING REMINDER", pill: { text: "TOMORROW", tone: "grey" },
      title: `${fmtTime(a.starts_at)} at ${a.address}`,
      intro: "Your access instructions are now in the app. Plan to arrive 10 to 15 minutes early.",
      rows: [["When", when(a)]],
      button: { text: "Open the showing →", href: url },
    }),
  }),

  admin: (o: { title: string; intro: string; rows?: [string, string][]; tone?: "green" | "grey" | "red"; pill: string; href?: string }) => ({
    subject: `FieldOps: ${o.title}`,
    html: card({
      label: "FIELDOPS", pill: { text: o.pill, tone: o.tone ?? "red" }, title: o.title, intro: o.intro, rows: o.rows,
      button: { text: "Open FieldOps →", href: o.href ?? `${SITE}/admin/fieldops` },
    }),
  }),
};
