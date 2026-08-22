# 09 — Lead Management SOP

## PURPOSE
No lead exists without a next action, ever. This is the core discipline of tenant placement — most vacancies are lost to slow or absent follow-up, not lack of interest. Serves: **Vacancy→Tenant**.

## WHEN THIS SOP STARTS
The moment any inquiry arrives, from any channel, about any active listing.

## RESPONSIBLE PERSON
Leasing Lead.

## ESTIMATED TIME
5–10 minutes per lead touch; ongoing daily.

## REQUIRED INPUTS
- Lead contact info and source channel
- Active listing details

---

## LEAD STAGES

`NEW → CONTACTED → QUALIFIED → SHOWING_BOOKED → SHOWING_COMPLETED → APPLIED → VERIFYING → APPROVED → LEASED` or `LOST` at any point.

**Every lead record must always have three fields filled: STATUS, LAST ACTION, NEXT ACTION + NEXT ACTION DATE. A lead with a blank NEXT ACTION is a bug in the process, not an acceptable state.**

## RESPONSE-TIME TARGETS

- New inquiry → first contact: **within 2 hours during business hours (9am–7pm), within 12 hours overnight.**
- No response after contact attempt → second follow-up: **within 24 hours.**
- Showing booked → confirmation sent: **immediately, automatic.**

## LEAD MANAGEMENT CHECKLIST

- [ ] New inquiry logged — **[AUTOMATABLE]** where it comes through the website booking flow; **[CHECKLIST]** for Marketplace/Kijiji/phone
  DEFINITION OF DONE: lead exists with STATUS=NEW, source channel recorded

- [ ] First contact within target window — **[HUMAN JUDGMENT]**
  SCRIPT: New Inquiry Script (`25_SCRIPT_LIBRARY.md`) · DEFINITION OF DONE: STATUS=CONTACTED, NEXT ACTION set

- [ ] Qualification — **[HUMAN JUDGMENT]**, **[AI ASSISTABLE]** where the website prequalification flow already ran (budget confirm, dealbreaker Y/N, verification consent, $99 fee disclosure)
  If the lead came through the website, prequalification answers already exist in `viewing_notes` — read them before calling, don't re-ask what's already answered. SCRIPT: Qualification Script (`25_SCRIPT_LIBRARY.md`) · DEFINITION OF DONE: STATUS=QUALIFIED or STATUS=LOST with a reason

- [ ] Book showing — **[AUTOMATABLE]** via the website booking flow where available; **[HUMAN JUDGMENT]** for manual booking
  SCRIPT: Viewing Booking Script · DEFINITION OF DONE: STATUS=SHOWING_BOOKED, date/time confirmed both sides

- [ ] No-response follow-up sequence if a qualified lead goes quiet — **[HUMAN JUDGMENT]**, **[AI ASSISTABLE]** for drafting
  1st follow-up at 24h, 2nd follow-up at 72h, final follow-up at 7 days, then STATUS=LOST if still silent. SCRIPTS: No-Response / Second / Final Follow-Up (`25_SCRIPT_LIBRARY.md`)

- [ ] Post-showing outcome logged — see `10_SHOWINGS.md` — **[CHECKLIST]**

- [ ] Lost-lead reason logged whenever STATUS moves to LOST — **[CHECKLIST]**
  Categories: PRICE / SIZE / LOCATION / CONDITION / LAUNDRY / PARKING / LAYOUT / UTILITIES / MOVE DATE / OTHER. This feeds `14_FUNNEL_DIAGNOSTICS.md` directly — don't skip it because the lead is "just gone."

- [ ] Price-change reactivation — **[HUMAN JUDGMENT]**, **[AI ASSISTABLE]** for identifying who to contact
  If price changes, re-contact every LOST lead whose reason was PRICE. SCRIPT: Price-Change Reactivation Script.

## COMMON MISTAKES
- Letting a lead sit in QUALIFIED with no showing booked and no NEXT ACTION date — this is the single most common leak in the funnel.
- Marking a lead LOST without a reason — this destroys the diagnostic value of the funnel data.
- Treating every inquiry the same regardless of channel — a website lead already answered prequalification questions; don't waste their time re-asking.

## ESCALATION CONDITIONS
- Any lead with no NEXT ACTION date set for more than 24 hours → surfaces automatically in the Daily Leasing Routine (`13_DAILY_LEASING_ROUTINE.md`), must be resolved same day.

## QUALITY CONTROL
- Zero leads with a blank NEXT ACTION field, checked daily.
- No legitimate inquiry ignored — every inquiry gets at least one contact attempt within the response-time target.

## OUTPUT / DELIVERABLE
A lead pipeline where every record always has STATUS, LAST ACTION, and NEXT ACTION + DATE populated.
