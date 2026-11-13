// Emails for the application pipeline: the after-viewing thank-you with the
// personalized application link, the owner's report link, and the first month's
// rent request. Same card look as the FieldOps emails.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const SITE = "https://www.prosperaproperties.co";
const F = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

function shell(label: string, inner: string) {
  return `<div style="background:#F5F5F3;margin:0;padding:0">
<table width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#F5F5F3"><tbody><tr><td align="center" style="padding:30px 12px">
<table width="560" cellspacing="0" cellpadding="0" border="0" style="width:560px;max-width:560px;background:#FFFFFF;border-radius:14px;overflow:hidden;font-family:${F}"><tbody>
<tr><td style="padding:28px 36px 14px">
  <table width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr>
    <td style="font-size:19px;line-height:1;font-weight:700;letter-spacing:0.3px;color:#222">PROSPERA<span style="color:#777;font-size:10px;letter-spacing:0.4px"><b>&nbsp;PROPERTIES CO.</b></span></td>
    <td align="right" style="font-size:10px;font-weight:700;letter-spacing:0.6px;color:#777">${esc(label)}</td>
  </tr></tbody></table>
  <div style="height:1px;line-height:1px;background:#EEE;margin-top:18px">&nbsp;</div>
</td></tr>
${inner}
<tr><td align="center" style="padding:18px 30px 22px;background:#FAFAFA;border-top:1px solid #EEE;font-size:11px;line-height:1.6;color:#999">
  Questions? Reply to this email or call or text (519) 697-1227.<br>Prospera Properties Co. · London, Ontario · <a href="${SITE}" style="color:#777">prosperaproperties.co</a>
</td></tr>
</tbody></table></td></tr></tbody></table></div>`;
}

const p = (html: string, pad = "0 36px 18px") => `<tr><td style="padding:${pad};font-size:15px;line-height:1.65;color:#444">${html}</td></tr>`;
const h1 = (t: string) => `<tr><td style="padding:6px 36px 10px"><h1 style="margin:0;font-size:27px;line-height:1.2;font-weight:700;color:#222;letter-spacing:-0.4px">${t}</h1></td></tr>`;
const button = (text: string, href: string, dark = true) => `<tr><td style="padding:4px 36px 24px">
  <table width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td align="center" style="background:${dark ? "#8B2030" : "#FFFFFF"};border:${dark ? "0" : "1px solid #D8D2C8"};border-radius:10px">
  <a href="${esc(href)}" style="display:block;padding:15px 20px;font-size:15px;font-weight:700;color:${dark ? "#FFFFFF" : "#1F2F3A"};text-decoration:none">${esc(text)}</a></td></tr></tbody></table></td></tr>`;

function step(n: number, title: string, body: string) {
  return `<tr><td style="padding:0 36px 16px"><table width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr>
    <td valign="top" width="34"><div style="width:26px;height:26px;border-radius:13px;background:#1F2F3A;color:#FFF;font-size:13px;font-weight:700;line-height:26px;text-align:center">${n}</div></td>
    <td valign="top" style="font-size:15px;line-height:1.6;color:#444"><div style="font-weight:700;color:#222;margin:2px 0 4px">${title}</div>${body}</td>
  </tr></tbody></table></td></tr>`;
}

const box = (inner: string) => `<div style="background:#FAFAFA;border:1px solid #E8E8E8;border-radius:12px;padding:14px 16px;margin-top:8px">${inner}</div>`;

export function thankYouApplyEmail(o: {
  first: string; address: string; city: string; price: number; image?: string | null;
  applyUrl: string; briefUrl?: string | null; senderName: string; known: boolean;
}) {
  const subject = `Thanks for viewing ${o.address}, ${o.first}. Here's how to apply`;
  const html = shell("THANKS FOR COMING", `
${o.image ? `<tr><td style="padding:0 36px 18px"><img src="${esc(o.image)}" alt="" width="488" style="width:100%;max-width:488px;height:auto;border-radius:12px;display:block"></td></tr>` : ""}
${h1(`Thanks for coming to see ${esc(o.address)}, ${esc(o.first)}.`)}
${p(`If you'd like to make it your home, here's how to apply. Most people finish in about 10 minutes when they have everything ready first.${o.known ? " We kept your answers from the viewing form, so you won't type them again." : ""}`)}
${step(1, "Give a quick heads-up (2 minutes)", `Text your current landlord and let your employer know Prospera Properties may call them for a reference. A quick heads-up means they answer when we call, and that speeds up your approval.`)}
${step(2, "Have these ready", `<b>Photo ID.</b> Driver's licence, passport or Ontario photo card. A phone photo is fine.
${box(`<div style="font-weight:700;color:#222;margin-bottom:6px">Then pick one:</div>
<div style="margin-bottom:8px"><b>Option A (quickest):</b> 3 months of bank statements. Download them from your bank's app, usually under Accounts, then Statements.</div>
<div><b>Option B:</b> your last 6 pay stubs, a credit report (free from Borrowell or Credit Karma) and a letter from your employer.</div>`)}`)}
${step(3, "Apply", `Use the button below. Your link is personal to you and saves as you go.`)}
${button("Start my application", o.applyUrl)}
${o.briefUrl ? p(`Want another look first? <a href="${esc(o.briefUrl)}" style="color:#1F2F3A;font-weight:700">Here's everything about the home</a> on one page: rent, utilities, parking and what's nearby.`) : ""}
<tr><td style="padding:6px 36px 6px"><div style="height:1px;background:#EEE"></div></td></tr>
${p(`<div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:#777;margin:14px 0 8px">WHAT HAPPENS AFTER YOU APPLY</div>
1. We review your application. A person reads every one.<br>
2. We share a summary with the owner for a conditional approval.<br>
3. If approved, the first month's rent by e-transfer holds the home for you.<br>
4. A quick screening through SingleKey, then we set up your lease and keys.`)}
${p(`Thanks again,<br><b style="color:#222">${esc(o.senderName)}</b><br>Prospera Properties`, "6px 36px 26px")}
`);
  return { subject, html };
}

export function ownerReportEmail(o: { ownerName?: string | null; applicant: string; address: string; reportUrl: string; summary: string }) {
  const subject = `Applicant for ${o.address}: ${o.applicant}. Your approval needed`;
  const html = shell("APPLICANT FOR YOUR REVIEW", `
${h1(`An applicant for ${esc(o.address)}`)}
${p(`Hi ${esc(o.ownerName?.split(" ")[0] || "there")}, we've reviewed an application from <b>${esc(o.applicant)}</b>. ${esc(o.summary)}`)}
${p(`Open the report to see the details. If you're comfortable, tap <b>Conditionally approve</b>. We then collect the first month's rent, run a SingleKey screening and prepare the lease. Nothing is signed until the screening is back.`)}
${button("Open the tenant report", o.reportUrl)}
${p(`Thanks,<br><b style="color:#222">Ebin</b><br>Prospera Properties`, "0 36px 26px")}
`);
  return { subject, html };
}

export function rentRequestEmail(o: { first: string; address: string; amount: number; to: string; reference: string }) {
  const amount = `$${o.amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const subject = `Good news about ${o.address}. Next step: first month's rent`;
  const html = shell("CONDITIONALLY APPROVED", `
${h1(`Good news, ${esc(o.first)}.`)}
${p(`The owner of <b>${esc(o.address)}</b> has conditionally approved your application. To hold the home for you, please send the first month's rent by Interac e-Transfer.`)}
<tr><td style="padding:0 36px 20px"><table width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #E8E8E8;border-radius:12px;background:#FAFAFA"><tbody>
${[["Amount", amount], ["Send to", o.to], ["Message / reference", o.reference]].map(([k, v], i) => `<tr><td style="padding:14px 18px;${i < 2 ? "border-bottom:1px solid #E8E8E8;" : ""}"><div style="font-size:10px;font-weight:700;letter-spacing:0.5px;color:#777">${k.toUpperCase()}</div><div style="margin-top:5px;font-size:16px;font-weight:700;color:#222">${esc(v)}</div></td></tr>`).join("")}
</tbody></table></td></tr>
${p(`Put the reference in the e-Transfer message so we can match it to you.`)}
${p(`<div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:#777;margin:6px 0 8px">WHAT HAPPENS NEXT</div>
1. We confirm your payment by email.<br>
2. You'll get an email from SingleKey to complete a short screening.<br>
3. Once that's back, we send your lease to sign and book your move-in and key pickup.`)}
${p(`Thanks,<br><b style="color:#222">Ebin</b><br>Prospera Properties`, "0 36px 26px")}
`);
  return { subject, html };
}

export function rentReceivedEmail(o: { first: string; address: string; amount: number }) {
  const subject = `Payment received for ${o.address}`;
  const html = shell("PAYMENT RECEIVED", `
${h1(`Got it, ${esc(o.first)}. Thank you.`)}
${p(`We received your $${o.amount.toLocaleString("en-CA")} for <b>${esc(o.address)}</b>. The home is being held for you.`)}
${p(`<b>Next:</b> watch for an email from SingleKey with a link to a short screening. It takes about 10 minutes. Once it's back, we'll send your lease and set up your move-in.`)}
${p(`Thanks,<br><b style="color:#222">Ebin</b><br>Prospera Properties`, "0 36px 26px")}
`);
  return { subject, html };
}
