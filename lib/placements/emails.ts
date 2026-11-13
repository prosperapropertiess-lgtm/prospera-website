import { shell, p, h1, button, step, esc } from "@/lib/application-emails";

export function welcomeEmail(o: { first: string; address: string; url: string; multiple: boolean }) {
  const subject = `Agreement received. Your property dashboard for ${o.address} is ready`;
  const html = shell("WELCOME TO PROSPERA", `
${h1(`Thanks, ${esc(o.first)}. We've got your signed agreement.`)}
${p(`We're now working on finding a tenant for <b>${esc(o.address)}</b>. Your property dashboard shows everything we do along the way, so you never have to ask where things stand.`)}
${button("Open Your Property Dashboard", o.url)}
${p(`<div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:#777;margin:4px 0 8px">WHAT'S NEXT</div>`, "0 36px 6px")}
${step(1, "We prepare the property", "A walkthrough, professional photos, a floor plan and a lawn sign where it makes sense. Each one shows up on your dashboard as it's done.")}
${step(2, "We market it and show it", "Your listing goes live, and you'll see views, inquiries and showings each week, plus what prospects tell us.")}
${step(3, "You review applications", "When a strong applicant comes through, we send you a summary to approve to proceed. Nothing moves forward without you.")}
${step(4, "Lease, move-in and keys", "We verify the applicant, prepare the lease, collect payments and hand over the keys. You can follow each step.")}
${p(`<div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:#777;margin:10px 0 8px">WHAT'S ON YOUR DASHBOARD</div>
Progress from preparation to keys · photos, floor plan and reports · weekly updates with showing feedback · applications to review · what happens next and who's doing it.${o.multiple ? "<br><br>You have more than one property with us. Pick the one you want at the top of the dashboard." : ""}`)}
${p(`<div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:#777;margin:10px 0 8px">SAVE IT AS AN APP</div>
This link is private to you, so keep this email. To open it like an app:<br>
<b>iPhone (Safari):</b> open the dashboard, tap the Share button, then <b>Add to Home Screen</b>.<br>
<b>Android (Chrome):</b> open the dashboard, tap the ⋮ menu, then <b>Add to Home screen</b> or <b>Install app</b>.<br>
The dashboard also has a step-by-step guide under <b>Help</b>.`)}
${p(`Talk soon,<br><b style="color:#222">Ebin</b><br>Prospera Properties`, "6px 36px 26px")}
`);
  return { subject, html };
}

export function weeklyUpdateEmail(o: { first: string; address: string; range: string; summary: string; url: string; actions: { item: string; owner?: string; due?: string }[] }) {
  const subject = `Weekly update for ${o.address} (${o.range})`;
  const html = shell("WEEKLY UPDATE", `
${h1(`This week at ${esc(o.address)}`)}
${p(`Hi ${esc(o.first)}, here's your update for ${esc(o.range)}.`)}
${p(esc(o.summary).replace(/\n/g, "<br>"))}
${o.actions.length ? p(`<div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:#777;margin:4px 0 8px">NEXT</div>${o.actions.map((a) => `• ${esc(a.item)}${a.owner ? ` (${esc(a.owner)})` : ""}${a.due ? `, by ${esc(a.due)}` : ""}`).join("<br>")}`) : ""}
${button("See the full update", o.url)}
${p(`Ebin<br>Prospera Properties`, "0 36px 26px")}
`);
  return { subject, html };
}

export function adminNoticeEmail(o: { title: string; lines: string[]; url: string; flag?: string | null }) {
  const html = shell(o.flag ? "REVIEW NEEDED" : "OWNER ACTIVITY", `
${h1(esc(o.title))}
${o.flag ? p(`<div style="background:#F8EAEC;border-radius:10px;padding:12px 14px;color:#8B2030"><b>Flagged:</b> ${esc(o.flag)}</div>`) : ""}
${p(o.lines.map(esc).join("<br>"))}
${button("Open in Admin", o.url)}
`);
  return { subject: `${o.flag ? "Flagged: " : ""}${o.title}`, html };
}

export function ownerMessageEmail(o: { first: string; address: string; body: string; url: string }) {
  const html = shell("A REPLY FROM PROSPERA", `
${h1(`About ${esc(o.address)}`)}
${p(`Hi ${esc(o.first)},`)}
${p(esc(o.body).replace(/\n/g, "<br>"))}
${button("Open your dashboard", o.url)}
`);
  return { subject: `Reply about ${o.address}`, html };
}
