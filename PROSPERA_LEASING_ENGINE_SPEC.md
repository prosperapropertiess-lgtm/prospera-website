# PROSPERA LEASING ENGINE — ARCHITECTURE SPECIFICATION
> Version 1.0 — 2026-08-11
> Status: DRAFT — pending owner decisions (see Section 13)

---

## 1. CONTEXT & INTEGRATION STRATEGY

### What Exists Today (V0)
The codebase already has a leasing foundation:
- 7 Supabase tables: `leasing_properties`, `leasing_checklist`, `leasing_leads`, `leasing_lead_comms`, `leasing_showings`, `leasing_channels`, `leasing_comps`, `leasing_tasks`
- A 6-tab property hub at `/admin/leasing/[id]`
- A dashboard at `/admin/leasing`
- Full API at `/api/admin/leasing/properties/[id]/*`
- Diagnosis engine, readiness score, auto-task creation already partially implemented

### What V1 Adds
The V0 is a tracking tool. V1 transforms it into an **execution engine**:
- Vacancy Campaign model (extends leasing_properties)
- Append-only activity event log
- Campaign stage machine (12 stages with enforced transitions)
- Vacancy economics (daily cost, vacancy loss)
- Speed-to-lead tracking
- Quick Apply (public frictionless first-stage application)
- Structured showing outcomes and objection tracking
- Diagnostic engine (funnel breakpoints)
- Richer lead pipeline (9 stages + LOST with structured reasons)
- Trainability layer (task instructions built into the UI)
- Leasing Command Center (multi-vacancy operations view)

### Integration Rules
- **Auth**: Reuse HMAC cookie session (`isAdminAuthenticated`). No new auth system.
- **Properties**: Reference `properties.id` (UUID) — the Supabase public listings table. Notion properties remain separate (owner management only).
- **Design**: Warm light theme exactly as in current leasing pages (`BG=#F7F5F2`, `SURFACE=#FFFFFF`, `BORDER=#E5E1DC`, `TEXT=#1F2F3A`, `ACCENT=#8B2030`, `GREEN=#2D7A4F`, `AMBER=#B45309`).
- **Email**: Resend only — no SMS.
- **Storage**: Supabase private buckets (same pattern as owner-documents, tenant-documents).
- **Charts**: Recharts (already installed).
- **Do not rewrite** `/admin/leasing/page.tsx` or `/admin/leasing/[id]/page.tsx` from scratch — extend them.

---

## 2. CORE DATA MODEL

### 2.1 Vacancy Campaign (extends leasing_properties)

The existing `leasing_properties` table becomes the **Vacancy Campaign**. The table is extended — not replaced.

**New columns to add to `leasing_properties`:**

```sql
-- Campaign identity
campaign_name          text,                    -- e.g. "1864 Dundas — 2BR Aug 2026"
assigned_coordinator   text,                    -- employee name (text until roles exist)

-- Rent authorization
min_authorized_rent    numeric,                 -- floor set by owner/manager
incentive_description  text,                    -- e.g. "$250 Amazon gift card"
incentive_value        numeric,

-- Dates
campaign_start_date    date,
target_lease_date      date,
market_ready_date      date,                    -- timestamp when MARKET_READY reached

-- Property details for campaign (override from properties table if needed)
available_date         date,
bedrooms               integer,
bathrooms              numeric,
utilities_included     text,                    -- "Heat, Water" etc (display string)
parking_included       boolean,
parking_details        text,
laundry_type           text,                    -- in-suite / shared / coin / none
ac                     boolean,
pet_policy_summary     text,
smoking_allowed        boolean,
max_occupants          integer,

-- Stage machine (replaces status)
stage                  text NOT NULL DEFAULT 'PREPARATION',
-- Values: PREPARATION | MARKET_READY | ACTIVE_MARKETING | LEADS_ACTIVE |
--         SHOWINGS_ACTIVE | APPLICATIONS_ACTIVE | VERIFICATION |
--         APPROVAL | LEASE_PENDING | LEASE_SIGNED | MOVE_IN | CLOSED

-- Stage timestamps
stage_preparation_at     timestamptz,
stage_market_ready_at    timestamptz,
stage_active_marketing_at timestamptz,
stage_leads_active_at    timestamptz,
stage_showings_active_at  timestamptz,
stage_applications_at    timestamptz,
stage_verification_at    timestamptz,
stage_approval_at        timestamptz,
stage_lease_pending_at   timestamptz,
stage_lease_signed_at    timestamptz,
stage_move_in_at         timestamptz,
stage_closed_at          timestamptz,

-- Positioning
positioning_statement  text,
top_strengths          text[],
top_weaknesses         text[],
primary_selling_prop   text,

-- Outcome
outcome                text,                    -- 'leased' | 'withdrawn' | 'cancelled'
outcome_notes          text,
final_rent             numeric,                 -- actual signed rent
```

**Stage machine rules:**
- Forward transitions only (no jumping backward)
- PREPARATION → MARKET_READY requires readiness_score >= required_items_complete
- Required checklist items block MARKET_READY transition
- Stage timestamp is set automatically on transition
- CLOSED is terminal

### 2.2 Activity Event Log (new table)

```sql
CREATE TABLE leasing_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid NOT NULL REFERENCES leasing_properties(id) ON DELETE CASCADE,
  event_type        text NOT NULL,
  -- Event types:
  -- CAMPAIGN_CREATED, STAGE_CHANGED,
  -- CHECKLIST_ITEM_COMPLETED, MARKET_READY_BLOCKED,
  -- LEAD_CREATED, LEAD_CONTACTED, LEAD_STAGE_CHANGED, LEAD_LOST,
  -- COMM_LOGGED,
  -- SHOWING_BOOKED, SHOWING_COMPLETED, SHOWING_NO_SHOW, SHOWING_CANCELLED,
  -- APPLICATION_STARTED, APPLICATION_SUBMITTED,
  -- QUICK_APPLY_SENT,
  -- TASK_CREATED, TASK_COMPLETED,
  -- CHANNEL_ACTIVATED, CHANNEL_DEACTIVATED,
  -- COMP_ADDED,
  -- OWNER_UPDATE_SENT,
  -- RENT_CHANGED, INCENTIVE_CHANGED,
  -- NOTE_ADDED
  actor             text,                        -- 'system' | employee name
  related_entity_type text,                      -- 'lead' | 'showing' | 'task' | 'checklist_item' etc
  related_entity_id uuid,
  metadata          jsonb,                       -- event-specific data
  created_at        timestamptz DEFAULT now()
);
CREATE INDEX ON leasing_events(campaign_id, created_at DESC);
CREATE INDEX ON leasing_events(event_type);
```

### 2.3 Enhanced Leads (extend leasing_leads)

**New columns:**
```sql
-- Contact info
desired_move_date   date,
occupants           integer,
has_pets            boolean,
pet_details         text,
vehicles            integer,

-- Qualification
employment_status   text,
approx_income       numeric,
reason_for_moving   text,

-- Pipeline
pipeline_stage      text NOT NULL DEFAULT 'NEW',
-- Values: NEW | CONTACTED | QUALIFIED | SHOWING_BOOKED | SHOWING_COMPLETED |
--         APPLIED | VERIFYING | APPROVED | LEASED | LOST

lost_reason         text,
-- Values: price | location | bedroom_size | condition | laundry | parking |
--         utilities | timing | rented_elsewhere | stopped_responding | qualification | other
lost_reason_notes   text,

-- Response tracking
first_response_at   timestamptz,               -- for speed-to-lead
last_contacted_at   timestamptz,
next_action         text,
next_action_due     timestamptz,

-- Lead metadata
assigned_to         text,
lead_score          integer,                   -- simple 0-100 (calculated, not AI)
```

**Lead score formula (rule-based, transparent):**
- Income ≥ 3x rent: +30
- Move-in date within campaign window: +20
- No pets (if property doesn't allow): +20
- Responded to contact: +15
- Completed Quick Apply: +15

### 2.4 Enhanced Showings (extend leasing_showings)

**New columns:**
```sql
showing_type        text DEFAULT 'individual',  -- individual | open_house | virtual
confirmation_sent   boolean DEFAULT false,
reminder_sent       boolean DEFAULT false,
follow_up_sent      boolean DEFAULT false,

-- Structured feedback (replaces free-text only)
feedback_price      text,                        -- 'too_high' | 'acceptable' | 'good_value'
feedback_size       text,                        -- 'too_small' | 'acceptable' | 'spacious'
feedback_condition  text,                        -- 'poor' | 'acceptable' | 'excellent'
feedback_laundry    boolean,                     -- was laundry an objection?
feedback_parking    boolean,
feedback_location   boolean,
feedback_layout     boolean,
feedback_utilities  boolean,
quick_apply_sent    boolean DEFAULT false,
quick_apply_sent_at timestamptz,
```

### 2.5 Quick Apply (new table)

```sql
CREATE TABLE leasing_applications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id           uuid NOT NULL REFERENCES leasing_properties(id),
  lead_id               uuid REFERENCES leasing_leads(id),
  token                 text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
                        -- secure token for applicant portal URL

  -- Stage
  stage                 text NOT NULL DEFAULT 'LINK_SENT',
  -- Values: LINK_SENT | PRELIMINARY_SUBMITTED | PRELIMINARY_REVIEW |
  --         DOCUMENTS_REQUESTED | DOCUMENTS_PARTIAL | DOCUMENTS_COMPLETE |
  --         VERIFICATION | APPROVED | REJECTED | WITHDRAWN

  -- Stage timestamps
  link_sent_at          timestamptz DEFAULT now(),
  preliminary_submitted_at timestamptz,
  documents_requested_at   timestamptz,
  documents_complete_at    timestamptz,
  decision_at              timestamptz,

  -- Preliminary info (Quick Apply — no documents)
  legal_name            text,
  phone                 text,
  email                 text,
  desired_move_date     date,
  num_occupants         integer,
  employment_status     text,  -- employed | self_employed | student | retired | other
  employer_name         text,
  approx_monthly_income numeric,
  has_pets              boolean,
  pet_details           text,
  num_vehicles          integer,
  reason_for_moving     text,
  additional_notes      text,

  -- Screening workspace (admin-facing)
  income_ratio          numeric,   -- calculated: income / rent
  review_notes          text,
  reviewed_by           text,
  recommendation        text,      -- 'approve' | 'reject' | 'request_more_info'
  recommendation_notes  text,
  recommendation_at     timestamptz,

  -- Decision
  decision              text,      -- 'approved' | 'rejected' | 'waitlisted'
  decision_by           text,
  decision_notes        text,

  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
```

### 2.6 Application Documents (new table — V2)

```sql
CREATE TABLE leasing_application_docs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES leasing_applications(id) ON DELETE CASCADE,
  doc_type        text NOT NULL,
  -- Values: government_id | proof_of_income | employment_letter |
  --         bank_statement | reference_letter | other
  label           text,
  storage_path    text,            -- private Supabase bucket path
  file_name       text,
  file_size       bigint,
  mime_type       text,
  uploaded_at     timestamptz DEFAULT now(),
  uploaded_by     text,            -- 'applicant' | admin name
  access_log      jsonb DEFAULT '[]'  -- [{accessed_by, accessed_at}]
);
```

### 2.7 Speed-to-Lead (derived + stored)

Speed-to-lead is calculated from:
- `leasing_leads.created_at` (lead received)
- `leasing_leads.first_response_at` (first comm logged with direction=outbound)

Stored as `first_response_at` on the lead row. No separate table needed.

Campaign-level speed metrics calculated on-demand from lead data.

---

## 3. DATABASE MIGRATION PLAN

All changes go into `/supabase/migrations/021_leasing_engine_v1.sql`:

```
1. ALTER leasing_properties — add 30+ new columns
2. CREATE leasing_events table + indexes
3. ALTER leasing_leads — add 10 new columns
4. ALTER leasing_showings — add 10 new columns
5. CREATE leasing_applications table
6. CREATE leasing_application_docs table (placeholder for V2)
7. CREATE leasing_application_docs storage bucket (private)
8. Seed demo data for 1864 Dundas Street
```

---

## 4. API ROUTES

### New routes (V1):

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/leasing/properties/[id]/stage` | Advance campaign stage |
| GET | `/api/admin/leasing/properties/[id]/events` | Activity event log |
| POST | `/api/admin/leasing/properties/[id]/events` | Log manual event |
| GET | `/api/admin/leasing/properties/[id]/metrics` | Computed campaign metrics |
| POST | `/api/admin/leasing/properties/[id]/quick-apply` | Send Quick Apply link to lead |
| GET | `/api/apply/[token]` | Public — get application (applicant view) |
| POST | `/api/apply/[token]` | Public — submit preliminary application |
| GET | `/api/admin/leasing/properties/[id]/applications` | List applications for campaign |
| PATCH | `/api/admin/leasing/properties/[id]/applications` | Update application stage/notes |
| GET | `/api/admin/leasing/command` | Aggregated command center data |

### Modified routes (V1):

| Route | Changes |
|-------|---------|
| `POST /api/admin/leasing/properties` | Add new campaign fields, emit CAMPAIGN_CREATED event |
| `POST /api/admin/leasing/properties/[id]/leads` | Set first_response_at on first outbound comm, emit events |
| `POST /api/admin/leasing/properties/[id]/showings` | Emit events, update stage if first showing |
| `POST /api/admin/leasing/tasks` | Emit TASK_CREATED event |

---

## 5. UI ROUTES

### Modified:

| Route | Changes |
|-------|---------|
| `/admin/leasing` | Add Command Center view, speed-to-lead stat, diagnostic banners |
| `/admin/leasing/[id]` | Add Activity tab, Economics panel, stage machine UI, Quick Apply button |

### New (V1):

| Route | Purpose |
|-------|---------|
| `/admin/leasing/[id]/applications` | Application list + screening workspace |

### New (V2):

| Route | Purpose |
|-------|---------|
| `/apply/[token]` | Public applicant portal (frictionless Quick Apply) |

---

## 6. STAGE MACHINE

```
PREPARATION
    ↓ (all required checklist items complete)
MARKET_READY
    ↓ (at least one channel activated)
ACTIVE_MARKETING
    ↓ (first lead created, auto-advance)
LEADS_ACTIVE
    ↓ (first showing booked, auto-advance)
SHOWINGS_ACTIVE
    ↓ (first application submitted, auto-advance)
APPLICATIONS_ACTIVE
    ↓ (manually advance)
VERIFICATION
    ↓ (manually advance)
APPROVAL
    ↓ (manually advance)
LEASE_PENDING
    ↓ (manually advance)
LEASE_SIGNED
    ↓ (manually advance)
MOVE_IN
    ↓ (manually close)
CLOSED (terminal)
```

Auto-advances happen on events. Manual advances require confirmation. Timestamp is stored for each stage.

---

## 7. AUTOMATION RULES

Every auto-task creation follows: **TRIGGER → TASK CREATED → OWNER → DONE WHEN**

| Trigger | Task Created | Owner | Done When |
|---------|-------------|-------|-----------|
| New lead created | "Respond to [Name]" (URGENT, due 30min) | Assigned coordinator | First outbound comm logged |
| Lead not contacted after 1 hour | "Follow up: [Name] hasn't been contacted" (HIGH) | Assigned coordinator | Comm logged |
| Showing completed | "Record showing outcome" (HIGH, due 2hr) | Assigned coordinator | Feedback recorded |
| Showing: Interested | "Send Quick Apply to [Name]" (HIGH, due 1hr) | Assigned coordinator | quick_apply_sent = true |
| Showing: Maybe | "Follow up with [Name]" (MEDIUM, due 24hr) | Assigned coordinator | Stage updated |
| Application submitted | "Review application: [Name]" (HIGH) | Leasing manager | Application reviewed |
| No leads after 7 days | "Review marketing — no leads yet" (HIGH) | Assigned coordinator | Dismissed/actioned |
| Checklist incomplete at day 3 | "Complete readiness checklist" (HIGH) | Assigned coordinator | Checklist complete |

---

## 8. VACANCY ECONOMICS

Calculated in-page from:
- `leasing_properties.vacant_since` (date)
- `leasing_properties.asking_rent` (monthly)

```
daily_cost = asking_rent × 12 / 365
days_vacant = today - vacant_since
vacancy_loss = daily_cost × days_vacant
incentive_cost = incentive_value (if any)
effective_first_year_rent = asking_rent × 12 - incentive_value
```

Displayed prominently on campaign overview. Updates every page load.

---

## 9. DIAGNOSTIC ENGINE (Rule-Based)

Evaluated per campaign. Triggers shown as banners on dashboard and command center.

| Condition | Diagnosis | Prompt Action |
|-----------|-----------|---------------|
| 0 leads after 7 days in ACTIVE_MARKETING | Marketing not converting | Review price, photos, channels |
| Leads exist but showing rate < 20% | Lead handling / offer | Check response speed, showing availability |
| Showing rate ≥ 30% but 0 applications | Property/offer mismatch | Review showing feedback objections |
| Application started but not submitted in 48hr | Application friction | Follow up, remove barriers |
| Verification > 5 days | Internal bottleneck | Review documents requested |
| No activity (no events) in 48 hours | Stalled campaign | Require coordinator action |

---

## 10. SPEED-TO-LEAD METRICS

Calculated per campaign on demand from lead data:

```
response_times = leads where first_response_at IS NOT NULL
  → (first_response_at - created_at) for each

median_response_minutes
avg_response_minutes
pct_under_5_min
pct_under_15_min
pct_under_1_hour
uncontacted_leads (no outbound comm, > 30min old)
```

Displayed on command center and campaign overview.

---

## 11. QUICK APPLY DESIGN

**URL pattern:** `/apply/[token]`

**What it collects (preliminary only — no documents):**
1. Legal name
2. Phone + email
3. Desired move-in date
4. Number of occupants
5. Employment status + employer name
6. Approximate monthly income
7. Pets (yes/no + details if yes)
8. Vehicles count
9. Reason for moving
10. Additional notes

**Header on the page:**
> Apply in approximately 2 minutes. No documents required at this stage.

**After submission:**
- Application stage → PRELIMINARY_SUBMITTED
- Task created for coordinator: "Review preliminary application — [Name]"
- Event logged: APPLICATION_SUBMITTED
- No automatic approval or rejection

**Security:**
- Token is a UUID — unguessable
- No PII in URL
- Token expires in 30 days or on withdrawal
- HTTPS only (Vercel enforces)
- No analytics scripts on this page

---

## 12. PERMISSIONS (V1 — simplified)

V1 uses the existing single-admin auth. Role system is scaffolded but not enforced:

- `assigned_coordinator` text field on campaign — used for filtering and task ownership display
- Future: swap text for user_id FK when multi-user auth is added
- All API routes remain protected by `isAdminAuthenticated` middleware
- Quick Apply route (`/api/apply/[token]`) is public — guarded by unguessable token only

---

## 13. OPEN DECISIONS — REQUIRES OWNER INPUT BEFORE BUILDING

### Decision 1: Stage machine naming
The spec uses 12 stages. The existing `status` column uses 8 simpler values ('preparing', 'listed', etc.). Should I:
- **Option A**: Add a new `stage` column (keeps old `status` for backward compat, new column for engine)
- **Option B**: Replace `status` with `stage` (cleaner, but breaks existing dashboard code that references `status`)

### Decision 2: Quick Apply — public portal or admin-only?
The spec says applicants get a secure link. Should:
- **Option A**: Build a real public-facing page at `/apply/[token]` that applicants fill out from their phone — requires no login
- **Option B**: Coordinator fills out the preliminary form on behalf of the applicant (internal only, faster to build, lower security surface)

### Decision 3: Owner communication
The spec includes owner update drafts. Should these:
- **Option A**: Actually send emails to owners via Resend (requires owner email lookup)
- **Option B**: Generate a draft the coordinator copies and sends manually (simpler, safer)

### Decision 4: Multiple coordinators / assigned_to
Today there is only Ebin. Is the "assigned coordinator" field:
- **Option A**: A free-text field (e.g. "Sarah") — simple, no auth changes
- **Option B**: Should this block begin implementing multi-user auth now

### Decision 5: Checklist required items
Currently all checklist items are optional. The spec says required items should BLOCK the MARKET_READY stage. Should I:
- **Option A**: Mark specific items as `required = true` — can't advance without them
- **Option B**: Keep readiness score-based (current approach, softer gate)

### Decision 6: Seed data
The spec calls for seeding demo data for 1864 Dundas Street with the $1,245 rent example. Should I:
- **Option A**: Add seed data to the migration (runs once, creates real records)
- **Option B**: Skip seed data — you'll enter real vacancies manually

---

## 14. WHAT V1 DOES NOT INCLUDE

Per the spec's V1 scope:
- No applicant document uploads (V2)
- No applicant portal login/authentication (V2)
- No electronic lease signing (V3)
- No Buildium integration (V3)
- No cohort analytics or expected days-to-lease modeling (V4)
- No AI-generated copy (by design — templates work without AI)
- No SMS (no library installed)
