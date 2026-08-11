# PROSPERA LEASING ENGINE — V1 BUILD PLAN
> Version 1.0 — 2026-08-11
> Status: AWAITING OWNER DECISIONS (see SPEC Section 13)

---

## Build Sequence

V1 is broken into 6 milestones, each independently deployable and testable.
Build in order. Do not skip ahead.

---

## MILESTONE 1 — Database Foundation
**Objective:** Extend the existing schema to support the full V1 data model.

### Files affected:
- `supabase/migrations/021_leasing_engine_v1.sql` (new)

### Database changes:
1. `ALTER TABLE leasing_properties` — add stage machine columns, economic columns, positioning columns, coordinator field
2. `CREATE TABLE leasing_events` — append-only activity log
3. `ALTER TABLE leasing_leads` — add pipeline_stage, lost_reason, first_response_at, next_action fields
4. `ALTER TABLE leasing_showings` — add structured feedback columns, quick_apply_sent
5. `CREATE TABLE leasing_applications` — Quick Apply and full application
6. `ALTER TABLE leasing_checklist` — add `required` boolean column
7. Data: update existing `leasing_properties.stage` from old `status` values
8. Seed: 1864 Dundas demo campaign (if approved in Decision 6)

### Acceptance criteria:
- Migration runs clean on Supabase with no errors
- All existing leasing data preserved
- `leasing_events` table exists and is empty
- `leasing_applications` table exists and is empty
- TypeScript types still compile

---

## MILESTONE 2 — API Layer
**Objective:** Add new API routes and update existing routes to emit events and handle new fields.

### Files affected:
- `app/api/admin/leasing/properties/route.ts` (modify)
- `app/api/admin/leasing/properties/[id]/route.ts` (modify)
- `app/api/admin/leasing/properties/[id]/leads/route.ts` (modify)
- `app/api/admin/leasing/properties/[id]/showings/route.ts` (modify)
- `app/api/admin/leasing/properties/[id]/stage/route.ts` (new)
- `app/api/admin/leasing/properties/[id]/events/route.ts` (new)
- `app/api/admin/leasing/properties/[id]/metrics/route.ts` (new)
- `app/api/admin/leasing/properties/[id]/quick-apply/route.ts` (new)
- `app/api/admin/leasing/properties/[id]/applications/route.ts` (new)
- `app/api/admin/leasing/command/route.ts` (new)
- `app/api/apply/[token]/route.ts` (new — public)

### API changes:
1. `POST /properties` — emit `CAMPAIGN_CREATED` event, accept new fields
2. `POST /leads` — set `first_response_at` on first outbound comm, emit events, update pipeline_stage
3. `POST /showings` — emit events, update stage to SHOWINGS_ACTIVE if first showing
4. `POST /[id]/stage` — validate transition, set timestamp, emit `STAGE_CHANGED` event
5. `GET /[id]/events` — paginated activity log
6. `GET /[id]/metrics` — compute speed-to-lead, funnel stats, economics
7. `POST /[id]/quick-apply` — create application record, generate token, return link
8. `GET /[id]/applications` — list applications with lead info
9. `PATCH /[id]/applications` — update application stage, notes, recommendation
10. `GET /command` — all active campaigns with their tasks, metrics, diagnostics
11. `GET /apply/[token]` — public: return campaign info + partial application (no auth)
12. `POST /apply/[token]` — public: submit preliminary application, create event

### Acceptance criteria:
- All existing leasing functionality still works
- New lead logs `first_response_at` on first outbound comm
- Stage advance returns 400 if transition is invalid
- `/apply/[token]` returns 404 for invalid/expired token
- `/apply/[token]` POST creates application record and event
- `/command` returns all active campaigns with correct metrics

---

## MILESTONE 3 — Campaign Overview (Property Hub Upgrade)
**Objective:** Upgrade the property hub `/admin/leasing/[id]` to show economics, stage machine, and activity log.

### Files affected:
- `app/admin/leasing/[id]/page.tsx` (modify — add panels to existing Overview tab)

### UI changes:
1. **Economics panel** (top of Overview tab):
   - Days Vacant badge (prominent, colored by age)
   - Estimated Vacancy Loss (`$X,XXX`)
   - Daily Cost rate
   - Incentive display (if set)
   - Effective first-year rent

2. **Stage machine UI** (below header):
   - Visual stage strip (12 stages, current highlighted)
   - "Advance to [next stage]" button (disabled if blocked by checklist)
   - Blocked state shows exactly which required checklist items remain

3. **Activity tab** (new 7th tab):
   - Chronological event feed
   - Event type icon + description + actor + timestamp
   - "Log Note" button for manual entries

4. **Speed-to-lead card** (Overview stat row):
   - Median response time for this campaign
   - Uncontacted leads count (with red badge if > 0)

5. **Quick Apply button** on lead cards:
   - Appears after showing marked as "Interested"
   - Opens modal: confirm lead email, sends link, marks quick_apply_sent

### Acceptance criteria:
- Vacancy loss shows correctly for a unit vacant 17 days at $1,245
- Stage strip shows current stage highlighted
- "Advance stage" button is disabled when required checklist items are incomplete
- Activity tab loads events in chronological order
- Quick Apply button appears on interested leads and creates application record

---

## MILESTONE 4 — Leasing Command Center
**Objective:** Upgrade `/admin/leasing` dashboard to a true command center.

### Files affected:
- `app/admin/leasing/page.tsx` (modify)

### UI changes:
1. **Top stats row** (4 cards):
   - Active Vacancies
   - Total Vacancy Loss (sum across all campaigns)
   - Uncontacted Leads (red badge if > 0)
   - Tasks Due Today

2. **Speed-to-lead card** (new):
   - Median response time across all campaigns
   - % responded within 15 minutes
   - Uncontacted leads requiring immediate action

3. **Campaign cards** (enhanced):
   - Stage badge (not just status)
   - Economics: days vacant + estimated loss
   - Risk level: HIGH / MEDIUM / LOW (from diagnostic engine)
   - Primary diagnosis message ("High views, low inquiries — review pricing")
   - Today's tasks count for this campaign
   - Assigned coordinator

4. **Diagnostic banners** (per campaign card):
   - Inline alert when a funnel breakpoint is detected
   - Link to relevant tab on property hub

5. **Filtering**:
   - By stage
   - By risk level
   - By coordinator (when multi-user is added)

### Acceptance criteria:
- Total vacancy loss aggregates correctly
- Diagnostic banners appear for campaigns matching breakpoint rules
- Speed-to-lead stats display (or "No data yet" if no leads)
- Campaign cards show stage badge not just old status

---

## MILESTONE 5 — Enhanced Lead Pipeline
**Objective:** Upgrade the Leads tab in the property hub to full 9-stage pipeline with structured loss tracking.

### Files affected:
- `app/admin/leasing/[id]/page.tsx` (modify — Leads tab)

### UI changes:
1. **Pipeline view** at top of Leads tab:
   - Horizontal funnel showing count at each stage
   - Clickable stages to filter the lead list below

2. **Enhanced lead cards**:
   - Pipeline stage selector (9 stages + LOST)
   - When marking LOST: structured reason dropdown + notes field
   - Speed badge: shows response time on each lead (green < 15min, amber < 1hr, red > 1hr)
   - Lead score pill (0-100, calculated from income, timing, etc.)
   - Next action field + due date

3. **"Mark as LOST" modal**:
   - Required: structured reason (price / location / size / condition / laundry / parking / utilities / timing / rented elsewhere / stopped responding / qualification / other)
   - Optional: notes
   - On submit: logs `LEAD_LOST` event, updates stage

4. **Quick filters**: All / Needs Response / Showing Booked / Applied / Lost

### Acceptance criteria:
- Marking a lead LOST requires selecting a structured reason
- Lost leads are visually de-emphasized but remain visible with filter
- Speed badge shows correctly based on first_response_at vs created_at
- Pipeline funnel counts match actual lead stages

---

## MILESTONE 6 — Showing Outcome Upgrade + Quick Apply Flow
**Objective:** Make the showing feedback structured and complete the Quick Apply send flow.

### Files affected:
- `app/admin/leasing/[id]/page.tsx` (modify — Showings tab)

### UI changes:
1. **Showing feedback form** (post-showing modal):
   - Outcome: Interested / Maybe / Not Interested (existing)
   - Structured objections checklist (price / size / condition / laundry / parking / location / layout / utilities)
   - Open notes field
   - "Send Quick Apply now" toggle (appears when Interested)

2. **Quick Apply send confirmation**:
   - Shows lead email
   - Confirms unit details
   - On confirm: creates application, sends email via Resend, marks quick_apply_sent
   - Email: "Here's your application link — takes 2 minutes, no documents needed"

3. **Showing list enhancements**:
   - Show quick_apply_sent badge on interested showings
   - Show structured objections summary (comma-separated tags)

4. **Objection frequency** (bottom of Showings tab):
   - Tally of most common objections across all showings
   - Shows "3 prospects mentioned price" etc.

### Acceptance criteria:
- Structured feedback checkboxes all save correctly
- Quick Apply email sends when triggered (check Resend logs)
- Application record created with correct token
- Objection tally accurately reflects all showing feedback

---

## POST-MILESTONE: TypeScript + Deploy

After all milestones:
1. `npx tsc --noEmit` — zero errors
2. `git add` all changed files
3. `git commit` with clear message
4. `git push` → Vercel auto-deploys

---

## V2 SCOPE (not in V1 build plan)

- Public applicant portal at `/apply/[token]` (mobile-first, no login)
- Document upload requests + Supabase private storage
- Verification workspace (admin reviews docs)
- Application progress bar (applicant sees what's still needed)
- Automated follow-up emails (via Resend + cron)

## V3 SCOPE

- Owner approval workflow + owner-facing email summary
- Lease generation + e-sign integration
- Move-in workflow auto-creation
- Payment/deposit tracking

## V4 SCOPE

- Cohort analytics
- Expected days-to-lease modeling
- Channel attribution (source-to-lease)
- Historical benchmarks
