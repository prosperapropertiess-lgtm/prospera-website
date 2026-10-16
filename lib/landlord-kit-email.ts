// "Not a fit" email: a polite no, plus the free landlord kit (everything we use to lease a unit).
// Download links point at real files in /public/forms; guide-only items go to /resources,
// which emails the guide on request. Keep this list in sync with components/ui/ResourcesGrid.tsx.

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";

interface KitItem { title: string; note: string; href: string }

const KIT: { heading: string; items: KitItem[] }[] = [
  {
    heading: "1. Before you list",
    items: [
      { title: "Property Inspection Checklist", note: "Move-in and move-out form with a photo guide.", href: `${BASE}/resources` },
      { title: "Rental Application Template", note: "Employment, income, history, references, credit consent.", href: `${BASE}/resources` },
    ],
  },
  {
    heading: "2. Finding and screening a tenant",
    items: [
      { title: "Tenant Screening Checklist", note: "Credit, income, references: what to check at each stage.", href: `${BASE}/resources` },
    ],
  },
  {
    heading: "3. Agreements",
    items: [
      { title: "Ontario Standard Lease (PDF)", note: "The official lease form, ready to fill in.", href: `${BASE}/forms/ontario-standard-lease.pdf` },
      { title: "Prospera Lease Addendum (PDF)", note: "Extra protections on utilities, maintenance and tenant duties.", href: `${BASE}/forms/lease-addendum.pdf` },
    ],
  },
  {
    heading: "4. During the tenancy",
    items: [
      { title: "Rent Increase Guide (N1)", note: "How to fill it out and serve it on time.", href: `${BASE}/resources` },
      { title: "Maintenance Request Form", note: "A written trail for every repair request.", href: `${BASE}/resources` },
      { title: "Landlord Rights Quick Reference", note: "Entry, rent increases and evictions on one page.", href: `${BASE}/resources` },
      { title: "Landlord Tax Deduction Guide", note: "What you can and cannot write off.", href: `${BASE}/resources` },
    ],
  },
  {
    heading: "5. If something goes wrong",
    items: [
      { title: "N4: Non-payment of rent (PDF)", note: "", href: `${BASE}/forms/N4-clean.pdf` },
      { title: "N5: Damage or disturbance (PDF)", note: "", href: `${BASE}/forms/N5-clean.pdf` },
      { title: "N11: Agreement to end tenancy (PDF)", note: "", href: `${BASE}/forms/N11-clean.pdf` },
      { title: "N12: Landlord's own use (PDF)", note: "", href: `${BASE}/forms/N12-clean.pdf` },
      { title: "N9: Tenant's notice to leave (PDF)", note: "", href: `${BASE}/forms/N9-clean.pdf` },
    ],
  },
];

export function notAFitWithKitEmail(landlordName: string): string {
  const firstName = landlordName.split(" ")[0] || "there";
  const sections = KIT.map((s) => `
    <p style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#666666;margin:28px 0 10px;">${s.heading}</p>
    ${s.items.map((i) => `
      <p style="margin:0 0 10px;font-size:16px;line-height:1.5;">
        <a href="${i.href}" style="color:#1F2F3A;font-weight:600;text-decoration:underline;">${i.title}</a>
        ${i.note ? `<br/><span style="color:#666666;font-size:14px;">${i.note}</span>` : ""}
      </p>`).join("")}`).join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <p style="font-size:17px;line-height:1.8;margin:0 0 20px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:1.8;margin:0 0 20px;">
      Thanks for filling in the details on your property. I looked through them and I don't think we're the right match to manage it right now. I'd rather say that plainly than waste your time.
    </p>
    <p style="font-size:17px;line-height:1.8;margin:0 0 20px;">
      I don't want you to leave empty-handed, though. Below is the same set of checklists, agreements and forms we use to lease out a unit, organized in the order you'll need them. All free, no strings.
    </p>
    ${sections}
    <p style="font-size:16px;line-height:1.7;margin:32px 0 20px;">
      The full library is always at <a href="${BASE}/resources" style="color:#1F2F3A;font-weight:600;">${BASE.replace("https://", "")}/resources</a>. If your situation changes, reply to this email and we'll take another look.
    </p>
    <p style="font-size:17px;line-height:1.8;margin:0 0 4px;">All the best,</p>
    <p style="font-size:17px;line-height:1.6;margin:0;font-weight:600;">Ebin, Prospera Properties<br/>(519) 697-1227</p>
  </div>`;
}

export function fitLinkEmail(landlordName: string, url: string): string {
  const firstName = landlordName.split(" ")[0] || "there";
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <p style="font-size:17px;line-height:1.8;margin:0 0 20px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:1.8;margin:0 0 20px;">
      Thanks for the call. The next step is a short form about your property: where it is, its condition, and the rent you have in mind. It takes about 3 minutes, and you can pick an area instead of giving the exact address if you prefer.
    </p>
    <p style="margin:0 0 28px;">
      <a href="${url}" style="display:inline-block;background:#8B2030;color:#FAF8F5;padding:16px 32px;border-radius:6px;font-size:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">Tell us about your property</a>
    </p>
    <p style="font-size:17px;line-height:1.8;margin:0 0 20px;">
      Once I've looked it over, I'll email you the next steps, either way.
    </p>
    <p style="font-size:17px;line-height:1.6;margin:0;font-weight:600;">Ebin, Prospera Properties<br/>(519) 697-1227</p>
  </div>`;
}
