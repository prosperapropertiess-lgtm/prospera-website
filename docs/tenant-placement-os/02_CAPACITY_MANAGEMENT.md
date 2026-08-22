# 02 — Capacity Management

## PURPOSE
Protect the quality of every active placement by refusing to overload the pipeline just because a fee looks good. Serves: **Vacancy→Tenant**, **Money** (protects it long-term by protecting service quality).

## WHEN THIS SOP STARTS
Checked at two points: (1) before any Property Acceptance decision, (2) every Monday during the Daily Leasing Routine.

## RESPONSIBLE PERSON
Leasing Lead.

## ESTIMATED TIME
2 minutes to check; ongoing to track.

## REQUIRED INPUTS
- Count of active tenant-placement assignments not yet leased
- Count of new assignments accepted this calendar month

---

## OPERATING CONSTRAINTS (do not soften these without a deliberate capacity-increase decision, below)

- **Maximum 1 new tenant-placement assignment accepted per calendar month.**
- **Maximum 2 active vacancies (placement assignments not yet leased) at any time.**

## CAPACITY STATES

| State | Condition | Meaning |
|---|---|---|
| AVAILABLE | 0 new assignments this month AND < 2 active vacancies | Accept new assignments normally |
| NEAR CAPACITY | 1 active vacancy, 0 new this month | Can accept 1 more if leaseability is Green |
| FULL CAPACITY | 1 new assignment already accepted this month, OR 2 active vacancies | Do not accept — waitlist |

## CAPACITY CHECKLIST

- [ ] Count active placement vacancies (assignments signed, not yet leased) — **[CHECKLIST]**
  WHO: Leasing Lead · HOW: count from CRM/Notion placement records · DEFINITION OF DONE: a number · NEXT: count this month's new assignments

- [ ] Count new placement assignments accepted this calendar month — **[CHECKLIST]**
  WHO: Leasing Lead · HOW: filter placement records by signed-date this month · DEFINITION OF DONE: a number · NEXT: determine state

- [ ] Determine capacity state from the table above — **[CHECKLIST]**
  WHO: Leasing Lead · DEFINITION OF DONE: state = AVAILABLE / NEAR CAPACITY / FULL CAPACITY · NEXT: apply to any pending acceptance decision

- [ ] If FULL CAPACITY and a new lead is asking — **[HUMAN JUDGMENT]**
  Use the Waitlist Script (`25_SCRIPT_LIBRARY.md`). Do not accept the assignment regardless of fee size, property quality, or how the conversation is going. This is a hard rule, not a guideline.

## CAPACITY EXCEPTION APPROVAL

Capacity limits exist to protect quality, not because 3 vacancies is literally impossible to run. An exception requires **all** of the following, decided by Ebin specifically (**[OWNER DECISION]** — Ebin himself, since he is both owner and operator here):

- [ ] At least one of the current active vacancies is within 5 days of an accepted application (i.e., about to close, freeing capacity almost immediately)
- [ ] The new property is scored GREEN on leaseability
- [ ] Ebin has reviewed current funnel performance on active vacancies (`14_FUNNEL_DIAGNOSTICS.md`) and confirmed neither is currently struggling
- [ ] The exception is logged with a reason, the same way a price-recommendation decision is logged (`19_CAMPAIGN_CLOSEOUT.md` / Owner Decision Log in `27_TEMPLATE_LIBRARY.md`)

If any box is unchecked, the answer is no — waitlist the lead.

## COMMON MISTAKES
- Accepting "just this once" without logging it as a deliberate exception — every exception must be logged or the limit becomes meaningless.
- Confusing property-management assignments with placement assignments — these limits are placement-specific. A property under full management with a tenant leaving does not count against placement capacity the same way; treat it as a placement-track vacancy the moment the plan is "find a new tenant," and track it here regardless of which service track it originated from.
- Letting "near capacity" quietly become "full" without checking — this table only works if it's checked before every acceptance decision.

## ESCALATION CONDITIONS
- If capacity is FULL and has been FULL for more than 45 consecutive days, that's a signal capacity itself should be reviewed (not exceptioned around) — raise it as an agenda item for the monthly CEO Dashboard sit-down.

## QUALITY CONTROL
- Every accepted assignment is checked against capacity state at time of acceptance — no undocumented exceptions.

## OUTPUT / DELIVERABLE
A capacity state (AVAILABLE / NEAR CAPACITY / FULL CAPACITY) checked before every acceptance decision, and a running log of any exceptions granted.
