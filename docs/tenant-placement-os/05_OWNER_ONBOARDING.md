# 05 — Owner Onboarding

## PURPOSE
The moment an owner signs, collect everything Prospera will ever need for this placement in one structured pass — so nothing downstream depends on someone's memory or a follow-up text three weeks later. Serves: **Owner Communication**, **Vacancy→Tenant**.

## WHEN THIS SOP STARTS
Immediately after the placement agreement is signed.

## RESPONSIBLE PERSON
Leasing Lead.

## ESTIMATED TIME
30–40 minutes for full data collection; welcome email is automatic same-day.

## REQUIRED INPUTS
- Signed agreement
- Owner contact details

---

## KNOWN GAP THIS SOP FIXES (flagged by Ebin, process-level only — no code changes here)
Today the onboarding wizard (`/admin/onboard/[token]`) only differentiates "placement" from "management" by swapping the agreement title and one conditional block at step 3. That's not a real distinct process — it's the same steps with different labels. The checklist below is the actual distinct placement-only intake. **Software follow-up (not part of this document):** the wizard needs placement-specific steps added — skip the ongoing-management fields (recurring maintenance contacts, owner statement preferences, etc.) that don't apply to a placement-only client, and add the placement-specific fields below that the current wizard has no field for (pricing flexibility, incentive authority, showing access instructions). This is a build request to raise separately, not something to guess at here.

## OWNER WELCOME CHECKLIST

- [ ] Send Owner Welcome Email — **[AUTOMATABLE]**
  WHO: system, triggered by agreement signature · TIME: same day · TEMPLATE: `27_TEMPLATE_LIBRARY.md` → Owner Welcome Email · DEFINITION OF DONE: sent, logged · NEXT: schedule data-collection call

- [ ] Collect property details — **[CHECKLIST]**
  Address, unit type, bedrooms/bathrooms, size, year built if known, condition notes, existing photos if any.
  WHO: Leasing Lead · HOW: call or in-person walk-through · DEFINITION OF DONE: all fields populated in the property record

- [ ] Collect access information — **[CHECKLIST]**
  Keys (how many, where held), lockbox code if applicable, parking access, entry instructions, any building/property manager contact if applicable.
  DEFINITION OF DONE: someone unfamiliar with the property could get in for a showing using only these notes

- [ ] Collect utilities and appliance details — **[CHECKLIST]**
  What's included in rent, what's tenant-responsibility, appliance list and condition, laundry type (in-suite/shared/none).

- [ ] Collect availability and pricing authority — **[CHECKLIST]** / **[OWNER DECISION]**
  Available date, owner's desired rent, **authorized rent floor** (the lowest the owner will actually accept — critical for velocity-pricing conversations later), pricing flexibility (yes/no/conditions), incentive authority (can Prospera offer a move-in incentive without asking every time, or must every incentive be approved?).

- [ ] Collect showing instructions and restrictions — **[CHECKLIST]**
  Preferred showing hours, notice required if tenant-occupied, any restrictions (no pets shown together, no showings during specific windows, etc.).

- [ ] Collect known defects and maintenance items — **[CHECKLIST]**
  Anything that needs disclosure or repair before rent-ready (see `06_RENT_READY.md`).

- [ ] Collect documents — **[CHECKLIST]**
  Proof of ownership/authority to lease, any existing lease template preference, insurance confirmation if relevant.

- [ ] Send "What Happens Next" email — **[AUTOMATABLE]**
  TEMPLATE: `27_TEMPLATE_LIBRARY.md` · DEFINITION OF DONE: owner has, in writing, the stage sequence and what to expect at each one

- [ ] Log all collected data in the property/owner record — **[CHECKLIST]**
  DEFINITION OF DONE: `06_RENT_READY.md` can be run using only this record, without calling the owner again

## COMMON MISTAKES
- Skipping "authorized rent floor" because it feels like an awkward question — this single data point prevents the most common mid-vacancy owner conflict (Prospera recommending a price cut the owner never actually authorized).
- Treating photo/document collection as optional "we'll get it later" — later never comes, and it blocks `07_MARKETING_PREPARATION.md`.
- Applying the full management-track onboarding checklist to a placement-only owner — skip recurring/ongoing-management fields that don't apply.

## ESCALATION CONDITIONS
- Owner is unreachable or unresponsive for data collection more than 5 business days after signing → escalate to Ebin; a stalled onboarding delays the vacancy clock before it even starts.

## QUALITY CONTROL
- No property proceeds to `06_RENT_READY.md` with an incomplete owner intake record.

## OUTPUT / DELIVERABLE
A complete owner/property intake record + two sent emails (Welcome, What Happens Next), both logged with timestamps.
