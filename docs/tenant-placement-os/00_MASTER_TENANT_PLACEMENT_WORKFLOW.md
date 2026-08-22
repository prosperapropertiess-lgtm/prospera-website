# 00 — Master Tenant Placement Workflow

**Prospera Properties Co. — Ontario (London / St. Thomas / Strathroy)**

This is the entry point to Prospera's Tenant Placement Operating System — a manual, human-run process, designed before any of it gets automated. It exists to answer one question at every single moment: **what do I do next?** No employee running this system should ever have to guess, improvise, or ask.

Every SOP in this system maps back to one or more of Prospera's 5 pillars: **Vacancy→Tenant, Owner Communication, Maintenance, Move-In/Move-Out, Money.** If a process doesn't serve one of these, it doesn't belong here.

---

## THE CORE PROBLEM THIS SOLVES

The old way:
```
OWNER SAYS YES → scramble → post listing → wait → repost → worry
→ owner asks for an update → scramble for an answer
→ randomly change strategy → eventually discuss price
```

The new way:
```
OWNER SAYS YES
  → PROPERTY QUALIFICATION
  → AGREEMENT
  → ONBOARDING
  → MARKET ANALYSIS
  → PRICING STRATEGY
  → PROPERTY READINESS
  → MARKETING PREPARATION
  → LAUNCH
  → LEAD MANAGEMENT
  → SHOWINGS
  → FOLLOW-UP
  → APPLICATION
  → SCREENING / VERIFICATION
  → OWNER DECISION
  → LEASE
  → MOVE-IN HANDOFF
  → CLOSEOUT
  → POSTMORTEM
```

Prospera controls: pricing advice, market analysis, presentation, listing quality, distribution, response speed, follow-up, showings, application process, screening process, communication, data collection, recommendations, execution. Prospera does not control: market demand, whether a specific renter likes a property, the owner's final pricing decision, economic conditions, competitor supply. Every SOP below holds people accountable for **process quality**, never for outcomes outside Prospera's control. And every active vacancy runs on a loop, never "post and pray": **MEASURE → DIAGNOSE → ACT → MEASURE AGAIN.**

---

## HOW THIS MANUAL RELATES TO WHAT'S ALREADY BUILT

This is a process-design document, not a software spec — nothing here required a code change. But it's grounded in Prospera's real, already-built tools, and references them throughout:

- **Discovery Call tool** (`/admin/discovery`) — tablet-usable scripted checklist during the first landlord call, AI fit-verdict, live neighbourhood talking points, branches to auto-rejection or onboarding handoff. This is where `01_PROPERTY_ACCEPTANCE.md` begins.
- **Onboarding wizard** (`/admin/onboard/[token]`) — currently only differentiates placement vs. management by a title swap. `05_OWNER_ONBOARDING.md` documents the real distinct placement-only intake this system needs; a software follow-up to build placement-specific wizard steps is flagged there, not built here.
- **Public listing + booking flow** — the instant-booking flow with real prequalification (budget, dealbreakers, verification consent, $99 fee disclosure) referenced throughout `09_LEAD_MANAGEMENT.md` and `11_APPLICATIONS.md`.
- **CEO Dashboard** and **Notion** — the source-of-record data this whole system reports up into (`22_MANAGEMENT_SCORECARD.md`).

---

## FILE INDEX

| # | File | What it covers |
|---|---|---|
| 01 | [Property Acceptance](01_PROPERTY_ACCEPTANCE.md) | Score every prospective assignment (Green/Yellow/Red) before saying yes — the gate that stops bad-fit properties from ever entering the pipeline. |
| 02 | [Capacity Management](02_CAPACITY_MANAGEMENT.md) | Hard limits (1 new assignment/month, 2 active vacancies) that protect quality over volume, plus the deliberate exception process. |
| 03 | [Owner Expectations](03_OWNER_EXPECTATIONS.md) | The pre-signing conversation that sets controllables vs. uncontrollables so nobody's surprised three weeks in. |
| 04 | [Rent Pricing](04_RENT_PRICING.md) | The 8-step comparable process, the no-direct-comps fallback, and the three-price-position framework. |
| 05 | [Owner Onboarding](05_OWNER_ONBOARDING.md) | Full data collection the moment an owner signs — including the placement-specific fields the current wizard is missing. |
| 06 | [Rent-Ready](06_RENT_READY.md) | The inspection that classifies every issue BLOCKER/IMPORTANT/COSMETIC before a single lead is generated. |
| 07 | [Marketing Preparation](07_MARKETING_PREPARATION.md) | Photo Order SOP and Listing Writing SOP — the assets that actually convert. |
| 08 | [Listing Launch](08_LISTING_LAUNCH.md) | Day 0: every channel live at once, the vacancy clock starts precisely. |
| 09 | [Lead Management](09_LEAD_MANAGEMENT.md) | The stage pipeline and the rule that no lead ever exists without a next action. |
| 10 | [Showings](10_SHOWINGS.md) | Consistent showing execution and mandatory outcome + objection-reason logging. |
| 11 | [Applications](11_APPLICATIONS.md) | The low-friction 5-step funnel — Quick Apply first, documents only when actually needed. |
| 12 | [Screening](12_SCREENING.md) | Lawful, consistent verification — with the Ontario Human Rights Code non-negotiable stated up front. |
| 13 | [Daily Leasing Routine](13_DAILY_LEASING_ROUTINE.md) | The fixed 20-minute daily check that guarantees nothing goes stale. |
| 14 | [Funnel Diagnostics](14_FUNNEL_DIAGNOSTICS.md) | Turns funnel numbers into a specific diagnosis and a specific fix, every time. |
| 15 | [Vacancy Escalation](15_VACANCY_ESCALATION.md) | Day 3/7/10/14/21/30 checkpoints — maximum waiting periods, plus volume-based triggers for fast-moving properties. |
| 16 | [Owner Communication](16_OWNER_COMMUNICATION.md) | The full update calendar and the fixed structure — no owner ever has to ask for an update. |
| 17 | [Lease Execution](17_LEASE_EXECUTION.md) | From owner approval to signed, deposited lease. |
| 18 | [Move-In Handoff](18_MOVE_IN_HANDOFF.md) | Transfers everything about the tenancy so nothing depends on memory going forward. |
| 19 | [Campaign Closeout](19_CAMPAIGN_CLOSEOUT.md) | The full numeric record of how this placement actually went. |
| 20 | [Postmortem](20_POSTMORTEM.md) | A 48-hour honest review of every placement — what worked, what didn't. |
| 21 | [Quality Control](21_QUALITY_CONTROL.md) | The 12 non-negotiable standards, auditable at a glance. |
| 22 | [Management Scorecard](22_MANAGEMENT_SCORECARD.md) | Weekly KPIs answering "is the system working?" independent of any one placement. |
| 23 | [Employee Training](23_EMPLOYEE_TRAINING.md) | Day 1 → certification — how this whole engine gets handed to a new hire and produces the same result. |
| 24 | [Exception Playbook](24_EXCEPTION_PLAYBOOK.md) | Pre-thought answers for every unusual situation, so nothing requires improvising from scratch. |
| 25 | [Script Library](25_SCRIPT_LIBRARY.md) | Every script in the system, compiled, in Ebin's voice. |
| 26 | [Checklist Library](26_CHECKLIST_LIBRARY.md) | Every checklist, compiled for fast reference. |
| 27 | [Template Library](27_TEMPLATE_LIBRARY.md) | Every owner-facing/internal template, compiled. |

---

## MASTER CHECKLIST — the entire placement, one page

**PROPERTY ACCEPTANCE**
- [ ] Capacity available
- [ ] Leaseability assessment scored
- [ ] Pricing feasibility checked
- [ ] Owner expectations set
- [ ] Accept / conditional / decline decision logged

**SIGNED**
- [ ] Agreement executed
- [ ] Owner welcome sent
- [ ] Property data collected
- [ ] Access collected

**PRICING**
- [ ] Market analysis (8-step process)
- [ ] Price range determined
- [ ] Recommended launch price set
- [ ] Owner authorization logged

**PREPARATION**
- [ ] Rent-ready (no open BLOCKER items)
- [ ] Photos
- [ ] Video/floor plan if applicable
- [ ] Listing copy
- [ ] QC pass

**LAUNCH**
- [ ] Channels live
- [ ] Links recorded
- [ ] Vacancy clock started

**LEASING**
- [ ] Leads handled (no blank next actions)
- [ ] Follow-ups on schedule
- [ ] Showings logged with outcomes
- [ ] Feedback/objections captured
- [ ] Applications progressing

**ESCALATION**
- [ ] Day 3
- [ ] Day 7
- [ ] Day 10
- [ ] Day 14
- [ ] Day 21
- [ ] Day 30
- [ ] Volume-based triggers checked continuously

**PLACEMENT**
- [ ] Screening complete
- [ ] Owner approval received
- [ ] Lease signed
- [ ] Payment/deposit collected
- [ ] Listing removed everywhere

**CLOSEOUT**
- [ ] Owner notified
- [ ] Move-in handoff complete
- [ ] Metrics recorded
- [ ] Postmortem complete (within 48h)

---

## PART 32 — REALITY TEST

Each scenario was actually run against the SOPs above. Where a real gap turned up, it was fixed in the relevant file (not left as a TODO) — noted below.

**Scenario A — Normal 2-bed apartment, leases in 8 days.**
Runs cleanly through the full pipeline: Green leaseability score → capacity check → expectations → onboarding → rent-ready → marketing → Day 0 launch → leads/showings/applications → screening → lease at Day 8, before Day 10's first intervention checkpoint ever fires. One gap found: the Day 7 scheduled owner update would land the day before or same day as lease signature, right next to the Lease Signed Update, reading as redundant or oddly timed. **Fixed:** added a check to `16_OWNER_COMMUNICATION.md`'s checklist — skip remaining scheduled updates once the property has already leased; triggered updates still fire up to signature.

**Scenario B — Poor-condition property, weak location, aggressive rent.**
Scores low across condition, location, and price-realism factors in `01_PROPERTY_ACCEPTANCE.md` — lands RED or low YELLOW. If the owner won't move on price or condition, the Property Decline Script applies directly; if they will, Conditional Acceptance names the condition explicitly and `06_RENT_READY.md`'s BLOCKER classification stops launch until real defects are fixed. No gap — this is exactly the scenario Part 1 and Part 21's non-negotiables were built to catch.

**Scenario C — Unique 6-bed furnished luxury property, almost no direct comparables.**
`04_RENT_PRICING.md`'s No-Direct-Comps SOP and `24_EXCEPTION_PLAYBOOK.md`'s "Luxury/unique property" row both apply directly — confidence level gets set to LOW, substitute-property comparison widens. No gap; the system was designed with this case in mind from the start.

**Scenario D — Owner refuses Prospera's price recommendation.**
Covered exactly by `24_EXCEPTION_PLAYBOOK.md`'s "Owner refuses price reduction" row and the Owner Declined Recommendation log in `27_TEMPLATE_LIBRARY.md`. No gap.

**Scenario E — 1,000 listing views, almost no inquiries.**
Direct match to `14_FUNNEL_DIAGNOSTICS.md`'s "High views + low inquiries → offer/price/positioning problem" row. No gap.

**Scenario F — 15 showings, zero applications.**
The diagnosis table in `14_FUNNEL_DIAGNOSTICS.md` correctly identifies this as a property/price/value problem — but simulating it revealed the trigger to *act* on it was purely calendar-based (Day 10/14 checkpoints). A property in a hot market could rack up 15 showings in well under 10 days, and the system as originally drafted would wait for a calendar date instead of reacting to the volume itself. **Fixed:** added Volume-Based Triggers to `15_VACANCY_ESCALATION.md` — 10+ showings with zero applications now forces an immediate Day-14-equivalent review regardless of what day it is, plus two related triggers for inquiry-to-showing and application-to-screening bottlenecks.

**Scenario G — Many applicants, none pass verification.**
`14_FUNNEL_DIAGNOSTICS.md`'s "many unqualified applications → targeting/qualification problem" row applies, and `24_EXCEPTION_PLAYBOOK.md` has a matching row. Simulating it further, though, surfaced a subtler risk: a zero-pass-rate pattern could also mean screening criteria are being applied inconsistently rather than the applicant pool being genuinely weak — which `12_SCREENING.md`'s consistency requirement exists to prevent, but nothing was forcing a check of it. **Fixed:** the third volume-based trigger added to `15_VACANCY_ESCALATION.md` (5+ qualified applications with zero passing screening) now forces a pause to review screening-criteria consistency before continuing to process more applicants, rather than letting the pattern repeat silently.

---

## [LEGAL REVIEW NEEDED] — full index
Flagged inline throughout the system; collected here for one-pass review:
- `06_RENT_READY.md` — what counts as a hard safety BLOCKER under Ontario minimum habitability standards
- `07_MARKETING_PREPARATION.md` — listing language boundaries under the Ontario Human Rights Code
- `11_APPLICATIONS.md` — ensuring the Preliminary Review step never functions as an undocumented, bypass screening step
- `12_SCREENING.md` — the entire file: specific lawful thresholds, credit-check consent language, and Human Rights Code protected-grounds application
- `17_LEASE_EXECUTION.md` — standard lease form requirements, deposit rules (last month's rent deposit vs. damage deposit)
- `21_QUALITY_CONTROL.md` — non-negotiable #9, inherits the `12_SCREENING.md` review

None of the above should be treated as legal advice or a compliance guarantee until reviewed by someone qualified in Ontario landlord-tenant and human rights law.
