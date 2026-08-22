# 01 — Property Acceptance

## PURPOSE
Decide, before we say yes to anything, whether a tenant-placement assignment is worth taking. This is the gate that stops "the fee looked good so I said yes" from turning into a 45-day vacancy nobody wanted to own. Serves: **Vacancy→Tenant**, **Money**.

## WHEN THIS SOP STARTS
A prospective owner has finished a Discovery Call (see the Discovery Call script in `25_SCRIPT_LIBRARY.md`) and Prospera is deciding whether to proceed to a signed agreement.

## RESPONSIBLE PERSON
Leasing Lead (Ebin, or a trained placement agent using this checklist).

## ESTIMATED TIME
15–20 minutes, done same-day as the Discovery Call while details are fresh.

## REQUIRED INPUTS
- Completed Discovery Call notes (`/admin/discovery`)
- AI fit-verdict from the Discovery Call tool (good_fit / borderline / not_a_fit)
- Current capacity status (`02_CAPACITY_MANAGEMENT.md`)
- Owner's stated desired rent
- Property address, type, bedroom/bathroom count, condition description from the call

---

## LEASEABILITY SCORE

Score each factor 1 (bad) to 5 (excellent). This is a **[HUMAN JUDGMENT]** scoring exercise — the AI verdict from the Discovery Call is an input to this, not a replacement for it.

| Factor | 1 | 3 | 5 |
|---|---|---|---|
| Market demand for this unit type/area | Oversupplied | Balanced | Undersupplied |
| Location | Poor access, no amenities nearby | Average | Strong transit/amenity access |
| Condition | Needs major work before showable | Livable, dated | Move-in ready |
| Price realism | Owner 15%+ over market and firm | Owner within 5–10% of market | Owner at or below market |
| Property features | Missing common expectations (in-suite laundry, parking) for the area | Average for comparable units | Above-average features |
| Major disadvantages | Serious (basement flooding history, no windows in a bedroom, etc.) | Minor, disclosed | None known |
| Competition | Heavy active competition, same price band | Some | Little to none |
| Owner flexibility on price/terms | Rigid | Some room | Openly flexible |
| Showing difficulty | Owner-occupied, hard scheduling, far commute | Moderate | Vacant, easy access, in service area |
| Distance/logistics | Outside service area or 45+ min drive | Edge of service area | Inside London/St. Thomas/Strathroy core |
| Expected workload | High-maintenance owner, unusual requirements | Average | Straightforward |
| Prospera capacity | At/over capacity | Near capacity | Capacity available |

**Total score bands:**
- **42–60 → GREEN.** Accept normally.
- **24–41 → YELLOW.** Accept only with conditions stated up front and in writing.
- **12–23 → RED.** Decline unless a specific, named condition changes (see decline script).

## PROPERTY ACCEPTANCE CHECKLIST

- [ ] Pull Discovery Call notes and AI verdict — **[CHECKLIST]**
  WHO: Leasing Lead · TIME: same day as call · HOW: `/admin/discovery` · DEFINITION OF DONE: notes and verdict visible on screen · NEXT: score leaseability

- [ ] Score the 12 leaseability factors above — **[HUMAN JUDGMENT]**
  WHO: Leasing Lead · TIME: 10 min · REQUIRED DATA: Discovery Call notes, any photos sent, Prospera's own market knowledge · DEFINITION OF DONE: total score and band (Green/Yellow/Red) recorded on the Discovery Call record · NEXT: check capacity

- [ ] Confirm capacity allows a new assignment — **[CHECKLIST]**
  WHO: Leasing Lead · HOW: `02_CAPACITY_MANAGEMENT.md` · DEFINITION OF DONE: capacity status is AVAILABLE, or owner has explicitly agreed to wait · NEXT: if capacity is FULL, go to waitlist script instead of proceeding

- [ ] Match score band to action — **[HUMAN JUDGMENT]**
  - GREEN → proceed to `03_OWNER_EXPECTATIONS.md`
  - YELLOW → use Conditional Acceptance Script (`25_SCRIPT_LIBRARY.md`), name the conditions explicitly, get owner's verbal agreement before proceeding
  - RED → use Property Decline Script (`25_SCRIPT_LIBRARY.md`)

- [ ] Record the decision and reasoning — **[CHECKLIST]**
  WHO: Leasing Lead · HOW: Discovery Call record, decision field · REQUIRED DATA: band, score, decision, condition list if Yellow · DEFINITION OF DONE: decision logged with a one-line reason a stranger could understand · NEXT: if accepted, move to Owner Expectations

- [ ] If declined or waitlisted, send the appropriate email within 24 hours — **[AI ASSISTABLE]** (draft), **[HUMAN JUDGMENT]** (send)
  WHO: Leasing Lead · DEADLINE: 24 hours from the call · DEFINITION OF DONE: owner has a clear, professional answer, not silence

## COMMON MISTAKES
- Saying yes because the placement fee is attractive while capacity is full — this is explicitly banned, see `02_CAPACITY_MANAGEMENT.md`.
- Scoring "price realism" based on what the owner *wants* to hear rather than actual comparable data — pull at least a rough comp before scoring this factor.
- Treating a Yellow score as a Green by skipping the "state conditions in writing" step.
- Letting a RED property linger without a decision because the conversation felt awkward — decline cleanly and quickly; it's a better outcome for both sides than a bad assignment.

## ESCALATION CONDITIONS
- Any property where leaseability scoring is genuinely unclear (score sits exactly on a band boundary, or Prospera has no comparable data) → hold the decision 24 hours, gather one more data point (a quick comp pull), then decide. Don't stall past 48 hours — a slow no is worse than a fast no.

## QUALITY CONTROL
- No property may be accepted without a recorded leaseability score.
- No property may be accepted while at full capacity without an explicit, logged owner decision to wait.

## OUTPUT / DELIVERABLE
A logged acceptance/decline/waitlist decision on the Discovery Call record, with score, band, and reasoning — readable by anyone, not just the person who made the call.
