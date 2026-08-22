# 10 — Showings SOP

## PURPOSE
Run every showing the same professional way, and never let a showing happen without capturing what happened afterward. Serves: **Vacancy→Tenant**.

## WHEN THIS SOP STARTS
A lead reaches SHOWING_BOOKED in `09_LEAD_MANAGEMENT.md`.

## RESPONSIBLE PERSON
Leasing Lead or trained agent conducting the showing.

## ESTIMATED TIME
~30 minutes per showing plus 10 minutes of pre/post work.

## REQUIRED INPUTS
- Access details from owner onboarding
- Property talking points (neighbourhood highlights, key features)

---

## SHOWING CHECKLIST

- [ ] Pre-showing checklist — **[CHECKLIST]**
  Confirm access works, lights on, property presentable (re-check for new clutter/odor since rent-ready inspection), arrive 10 min early.

- [ ] Showing confirmation sent — **[AUTOMATABLE]** (already built into the booking flow's confirmation email)

- [ ] 24-hour reminder — **[AUTOMATABLE]**

- [ ] 2-hour reminder — **[AUTOMATABLE]**

- [ ] Showing arrival checklist — **[CHECKLIST]**
  Verify prospect identity matches who booked, have a one-page property fact sheet ready (rent, included utilities, availability, parking, laundry).

- [ ] Run the showing script — **[HUMAN JUDGMENT]**
  SCRIPT: Showing Script (`25_SCRIPT_LIBRARY.md`) — lead with the property's strongest 2–3 features, invite questions, don't oversell.
  Note: since prequalification (budget, dealbreakers, verification consent, $99 fee disclosure) already happened before the showing was even booked, the showing itself should stay focused on the property — not re-litigate qualification.

- [ ] No-show handling — **[HUMAN JUDGMENT]**, **[AI ASSISTABLE]** for drafting
  SCRIPT: No-Show Script — attempt contact same day, offer one reschedule, mark STATUS=LOST with reason OTHER if unresponsive after 48 hours.

- [ ] Post-showing outcome captured before leaving the property or same day — **[CHECKLIST]**
  Classify: INTERESTED / MAYBE / NOT INTERESTED.

- [ ] Ask the objection question for anyone MAYBE or NOT INTERESTED — **[HUMAN JUDGMENT]**
  "What was the biggest reason you decided not to move forward?" Log the answer against the categories in `09_LEAD_MANAGEMENT.md` (PRICE / SIZE / LOCATION / CONDITION / LAUNDRY / PARKING / LAYOUT / UTILITIES / MOVE DATE / OTHER).

- [ ] Post-showing follow-up sent — **[AI ASSISTABLE]** for drafting, **[HUMAN JUDGMENT]** for send
  INTERESTED → move toward application. MAYBE → address the specific objection if addressable. NOT INTERESTED → thank them, log reason, close lead.

## COMMON MISTAKES
- Skipping the objection question because the showing "felt fine" — silent NOT INTERESTED outcomes with no reason logged are the biggest hole in funnel diagnostics.
- Re-asking prequalification questions already answered on the website booking flow — wastes the prospect's time and reads as disorganized.
- Not confirming property presentation the day of, relying on the rent-ready inspection from weeks earlier.

## ESCALATION CONDITIONS
- Two or more consecutive no-shows on the same listing → flag as a possible listing/scheduling friction problem, review in the next Daily Leasing Routine.

## QUALITY CONTROL
- No showing exists without an outcome (INTERESTED/MAYBE/NOT INTERESTED) logged same-day.

## OUTPUT / DELIVERABLE
A logged showing outcome with objection reason (if applicable) for every completed showing, feeding directly into `14_FUNNEL_DIAGNOSTICS.md`.
