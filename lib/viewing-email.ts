// The card-style email Ebin gets the moment someone sends the viewing form.

import { describeAnswers, incomeLabel, creditLabel, torontoToday, targetMoveIn, QUESTIONS, type Answers, type PublicHome } from "@/lib/viewing-requests";

const SHORT: Record<string, string> = {
  living: "Living now", notice: "Notice given", rental_length: "Renting there", landlord_reference: "Landlord reference",
  moving_reason: "Why moving", employment: "Work", job_length: "At this job", job_type: "Job type",
  business_length: "Self-employed for", tax_docs: "Tax assessments", student_rent: "Rent paid from",
  direct_pay: "Rent paid directly", benefit_docs: "Benefits statement", work_other: "Their situation",
  income: "Household income", other_income: "Income from", other_income_docs: "Paperwork for it",
  credit: "Credit score", cosigner: "Co-signer", first_last: "First and last ready",
  pets: "Pets", pet_details: "Pet details", smoking: "Smoking", vehicles: "Vehicles", viewing_times: "Free to view",
};

const GROUPS: { section: string; title: string }[] = [
  { section: "work", title: "Work" },
  { section: "money", title: "Money" },
  { section: "current", title: "Where they live now" },
  { section: "you", title: "Household" },
];

// Already shown in the top grid.
const IN_GRID = new Set(["income", "credit", "viewing_times"]);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function niceDate(v: string) {
  if (v <= torontoToday()) return "As soon as possible";
  const d = new Date(`${v}T12:00:00`);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-CA", { weekday: "short", month: "long", day: "numeric" });
}

function phoneText(v: string) {
  const d = v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v;
}

const LABEL = "font-size: 10px; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; color: rgb(119, 119, 119)";
const VALUE = "margin-top: 5px; font-size: 14px; line-height: 1.4; font-weight: 700; color: rgb(34, 34, 34)";

function cell(label: string, value: string, opts: { right?: boolean; bottom?: boolean }) {
  const borders = `${opts.right ? "border-right: 1px solid rgb(232, 232, 232);" : ""}${opts.bottom ? "border-bottom: 1px solid rgb(232, 232, 232);" : ""}`;
  return `<td width="50%" valign="top" style="width: 50%; padding: 15px 18px; ${borders}"><div style="${LABEL}">${esc(label.toUpperCase())}</div><div style="${VALUE}">${esc(value)}</div></td>`;
}

export function viewingRequestEmail(input: {
  name: string; phone: string; email: string | null; moveIn: string; occupants: number;
  answers: Answers; home: PublicHome; seconds: number | null;
}) {
  const { name, phone, email, moveIn, occupants, answers, home, seconds } = input;
  const first = name.split(/\s+/)[0] || name;
  const rows = describeAnswers(answers);
  const sectionOf = (id: string) => QUESTIONS.find((q) => q.id === id)?.section;
  const times = rows.find((r) => r.id === "viewing_times")?.answer ?? "Not given";
  const beds = home.bedrooms != null ? `${home.bedrooms} bed` : null;
  const target = targetMoveIn(home.available_date);
  const late = moveIn > target;

  const groups = GROUPS.map((g) => {
    const items = rows.filter((r) => sectionOf(r.id) === g.section && !IN_GRID.has(r.id));
    if (!items.length) return "";
    return `
      <tr><td style="padding: 0 40px 18px">
        <div style="font-size: 12px; line-height: 1.2; font-weight: 700; color: rgb(34, 34, 34); margin-bottom: 8px">${g.title}</div>
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid rgb(232, 232, 232); border-radius: 12px; overflow: hidden">
          <tbody>${items.map((r, i) => `
            <tr>
              <td width="42%" valign="top" style="width: 42%; padding: 11px 15px; ${i < items.length - 1 ? "border-bottom: 1px solid rgb(240, 240, 240);" : ""} font-size: 13px; line-height: 1.45; color: rgb(119, 119, 119)">${esc(SHORT[r.id] ?? r.question)}</td>
              <td valign="top" style="padding: 11px 15px; ${i < items.length - 1 ? "border-bottom: 1px solid rgb(240, 240, 240);" : ""} font-size: 13px; line-height: 1.45; font-weight: 700; color: rgb(34, 34, 34)">${esc(r.answer)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </td></tr>`;
  }).join("");

  const html = `<div style="background: rgb(245, 245, 243); margin: 0; padding: 0">
  <div style="display: none; max-height: 0px; opacity: 0; color: transparent">${esc(name)} wants to see ${esc(home.address)}. Move in ${esc(niceDate(moveIn))}, ${occupants} ${occupants === 1 ? "person" : "people"}, income ${esc(incomeLabel(answers.income))}.</div>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: rgb(245, 245, 243)">
    <tbody><tr><td align="center" style="padding: 30px 12px">
      <table width="620" cellspacing="0" cellpadding="0" border="0" style="width: 620px; max-width: 620px; background: rgb(255, 255, 255); border-radius: 14px; overflow: hidden; font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
        <tbody>
          <tr><td style="padding: 30px 40px 18px">
            <table width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr>
              <td valign="middle" style="font-size: 20px; line-height: 1; font-weight: 700; letter-spacing: 0.3px; color: rgb(34, 34, 34)">PROSPERA<span style="color: rgb(119, 119, 119); font-size: 10px; letter-spacing: 0.4px"><b>&nbsp;PROPERTIES CO.</b></span></td>
              <td valign="middle" align="right" style="font-size: 10px; line-height: 1.3; font-weight: 700; letter-spacing: 0.6px; color: rgb(119, 119, 119)">VIEWING REQUEST</td>
            </tr></tbody></table>
            <div style="height: 1px; line-height: 1px; background: rgb(238, 238, 238); margin-top: 20px">&nbsp;</div>
          </td></tr>

          <tr><td style="padding: 4px 40px 20px">
            <div style="display: inline-block; background: rgb(234, 243, 238); color: rgb(49, 91, 76); border-radius: 999px; padding: 7px 12px; font-size: 11px; line-height: 1; font-weight: 700; letter-spacing: 0.5px">NEW · PREQUALIFIED</div>
            <h1 style="margin: 15px 0 6px; font-size: 32px; line-height: 1.15; font-weight: 700; color: rgb(34, 34, 34); letter-spacing: -0.5px">${esc(name)}</h1>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: rgb(85, 85, 85)">wants to see <b style="color: rgb(34, 34, 34)">${esc(home.address)}</b>${[beds, `$${home.price.toLocaleString("en-CA")}/mo`].filter(Boolean).map((x) => ` · ${esc(x!)}`).join("")}</p>
          </td></tr>

          <tr><td style="padding: 0 40px 22px">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid rgb(232, 232, 232); border-radius: 12px; overflow: hidden; background: rgb(250, 250, 250)">
              <tbody>
                <tr>${cell(late ? `Move in · later than ${new Date(`${target}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}` : "Move in", niceDate(moveIn), { right: true, bottom: true })}${cell("People", String(occupants), { bottom: true })}</tr>
                <tr>${cell("Household income", incomeLabel(answers.income), { right: true, bottom: true })}${cell("Credit score", creditLabel(answers.credit), { bottom: true })}</tr>
                <tr><td colspan="2" style="padding: 15px 18px"><div style="${LABEL}">FREE TO VIEW</div><div style="${VALUE}">${esc(times)}</div></td></tr>
              </tbody>
            </table>
          </td></tr>

          ${groups}

          <tr><td style="padding: 8px 40px 30px">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: rgb(34, 34, 34); border-radius: 12px">
              <tbody><tr><td style="padding: 20px 22px">
                <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.6px; color: rgb(170, 170, 170)">CONTACT</div>
                <div style="margin-top: 6px; font-size: 18px; line-height: 1.3; font-weight: 700; color: rgb(255, 255, 255)">${esc(phoneText(phone))}</div>
                ${email ? `<div style="margin-top: 2px; font-size: 13px; color: rgb(213, 213, 213)">${esc(email)}</div>` : ""}
                <table cellspacing="0" cellpadding="0" border="0" style="margin-top: 14px"><tbody><tr>
                  <td style="background: rgb(255, 255, 255); border-radius: 8px"><a href="tel:${esc(phone.replace(/[^\d+]/g, ""))}" style="display: inline-block; padding: 10px 18px; font-size: 13px; font-weight: 700; color: rgb(34, 34, 34); text-decoration: none">Call ${esc(first)}</a></td>
                  <td width="10" style="width: 10px">&nbsp;</td>
                  <td style="border: 1px solid rgb(90, 90, 90); border-radius: 8px"><a href="https://www.prosperaproperties.co/admin/viewing-requests" style="display: inline-block; padding: 9px 16px; font-size: 13px; font-weight: 700; color: rgb(255, 255, 255); text-decoration: none">Open in admin &rarr;</a></td>
                </tr></tbody></table>
              </td></tr></tbody>
            </table>
          </td></tr>

          <tr><td align="center" style="padding: 18px 30px 22px; background: rgb(250, 250, 250); border-top: 1px solid rgb(238, 238, 238); font-size: 11px; line-height: 1.6; color: rgb(153, 153, 153)">
            ${seconds ? `Took ${seconds < 90 ? `${seconds} seconds` : `${Math.round(seconds / 60)} minutes`} to fill in. ` : ""}Claude sorts new requests every morning at 8am.
          </td></tr>
        </tbody>
      </table>
    </td></tr></tbody>
  </table>
</div>`;

  return {
    subject: `${name} · ${home.address} · ${incomeLabel(answers.income)}`,
    html,
  };
}
