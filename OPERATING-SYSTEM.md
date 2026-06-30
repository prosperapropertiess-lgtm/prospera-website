# Prospera Properties — Operating System Design

> The goal is not to build software. The goal is to design a company where software does the work.

---

## 1. System Architecture

### Core Principle
The company is a state machine. Every property, tenant, lease, and maintenance request exists in a defined state. Every state change triggers automated workflows. Humans only intervene at decision boundaries.

### Architecture: Event-Driven Microservices on a Monolith

**Why not microservices from day one?** Because you're 1 person managing 20-50 properties. Microservices add operational overhead (deployment, monitoring, inter-service communication) that kills small teams. Instead:

**Modular Monolith** (Next.js + Supabase) that's structured like microservices internally but deployed as one unit. When you hit 500+ properties, extract the highest-traffic modules.

```
┌─────────────────────────────────────────────────────────┐
│                    PROSPERA OS                          │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Leasing  │  │ Maint.   │  │ Finance  │             │
│  │ Engine   │  │ Engine   │  │ Engine   │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │              │              │                   │
│  ┌────▼──────────────▼──────────────▼────┐             │
│  │         EVENT BUS (Supabase Realtime   │             │
│  │         + Postgres NOTIFY/LISTEN)      │             │
│  └────┬──────────────┬──────────────┬────┘             │
│       │              │              │                   │
│  ┌────▼─────┐  ┌─────▼────┐  ┌─────▼────┐             │
│  │ Workflow │  │    AI    │  │  Comms   │             │
│  │ Engine   │  │  Agents  │  │  Engine  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │           POSTGRES (Supabase)           │           │
│  │  + Row Level Security                   │           │
│  │  + Realtime subscriptions               │           │
│  │  + Edge Functions (workflows)           │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Notion  │  │  Resend  │  │  Claude  │             │
│  │  (Ops)   │  │  (Email) │  │  (AI)    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Technology Decisions

| Component | Choice | Why |
|-----------|--------|-----|
| **App framework** | Next.js (App Router) | Already built. SSR for SEO, API routes for backend, React for UI. One deployable. |
| **Database** | Supabase (Postgres) | Row-level security, realtime, storage, edge functions, auth. One platform. |
| **Ops hub** | Notion | You already live here. Don't fight it. Sync to it, don't replace it. |
| **AI** | Claude API (Anthropic) | Best reasoning, best at following complex instructions, honest about limitations. |
| **Email** | Resend | Already integrated. Reliable, good API. |
| **Workflow engine** | Vercel Cron + Supabase Edge Functions + Postgres triggers | No need for Temporal or AWS Step Functions at this scale. Postgres `pg_cron` + triggers handle 95% of workflows. |
| **Communication** | Resend (email) + Twilio (SMS, future) + Intercom (chat, future) | Start with email. Add SMS when you hit 100+ properties. |
| **Payments** | Stripe Connect (future) | Not needed until you automate rent collection. Manual e-transfers work at 20 properties. |
| **Document signing** | Built-in (HMAC signatures, already working) | You don't need DocuSign at this scale. |
| **Maps/Location** | Google Maps API | Already integrated. |

### What NOT to build
- Don't build a custom CMS — use Notion
- Don't build a custom accounting system — use QuickBooks/Wave and sync
- Don't build a custom phone system — use your cell phone until 100+ properties
- Don't build tenant rent payment until you have 50+ units
- Don't build a mobile app — responsive web works

---

## 2. Complete Domain Model

### Entity Relationship Map

```
OWNER (1) ──── owns ────── (N) PROPERTY
PROPERTY (1) ── contains ── (N) UNIT
UNIT (1) ────── leased ──── (0..1) LEASE (active)
LEASE (1) ───── binds ───── (1..N) TENANT
TENANT (1) ──── submits ─── (N) MAINTENANCE_REQUEST
MAINTENANCE_REQUEST (1) ── assigned ── (0..1) VENDOR
VENDOR (1) ──── completes ── (N) WORK_ORDER
PROPERTY (1) ── generates ── (N) LEAD
LEAD (1) ────── becomes ──── (0..1) APPLICATION
APPLICATION (1) ─ becomes ── (0..1) LEASE
OWNER (1) ────── receives ── (N) FINANCIAL_REPORT
UNIT (1) ────── has ──────── (N) INSPECTION
```

### Core Entities

#### Owner
```
id, name, email, phone, properties[], 
communication_preference (email|sms|both),
report_frequency (monthly|weekly),
onboarding_status, notion_id,
satisfaction_score (computed),
portal_token
```

#### Property
```
id, owner_id, address, city, type, units[],
status (onboarding|active|inactive),
notion_id, supabase_id,
neighbourhood_data, walk_score, transit_score,
images[], virtual_tour_url
```

#### Unit
```
id, property_id, unit_number (null for single-family),
bedrooms, bathrooms, sqft, rent_amount,
status (vacant|occupied|notice|turnover),
lease_id (active), listing_id (if vacant),
appliances[], features[], amenities[]
```

#### Tenant
```
id, name, email, phone, unit_id, lease_id,
status (active|notice|former),
payment_history[], satisfaction_score,
portal_token, move_in_date, move_out_date,
credit_score_range, income_verified,
emergency_contact
```

#### Lease
```
id, unit_id, tenant_ids[], owner_id,
start_date, end_date, rent_amount,
deposit_amount, deposit_held,
status (draft|active|expiring|expired|terminated),
renewal_status (pending|offered|accepted|declined),
document_url, signed_at,
terms (month-to-month|12-months|24-months)
```

#### Lead
```
id, property_id, source (website|kijiji|facebook|referral|walk-in),
name, email, phone, 
status (new|contacted|showing_scheduled|showed|applied|lost),
score (computed), notes,
inquiry_date, last_contact,
assigned_agent_id
```

#### Application
```
id, lead_id, unit_id, tenant_name, tenant_email,
status (submitted|screening|approved|rejected|withdrawn),
credit_check, income_verification, landlord_reference,
employment_verification, ai_score, ai_report,
documents[], decision_date, decided_by
```

#### Maintenance Request
```
id, unit_id, tenant_id, property_id,
category (plumbing|electrical|hvac|appliance|structural|pest|other),
priority (emergency|urgent|normal|low),
status (submitted|triaged|assigned|scheduled|in_progress|completed|closed),
description, photos[],
ai_diagnosis, troubleshooting_steps[],
vendor_id, work_order_id,
created_at, resolved_at, resolution_time_hours,
tenant_satisfaction_rating
```

#### Vendor
```
id, name, company, phone, email,
specialties[], service_area[],
hourly_rate, reliability_score (computed),
response_time_avg, completion_rate,
insurance_verified, license_number,
active_work_orders_count
```

#### Work Order
```
id, maintenance_request_id, vendor_id,
property_id, unit_id,
description, scope_of_work,
estimated_cost, actual_cost,
status (created|sent|accepted|scheduled|in_progress|completed|invoiced|paid),
scheduled_date, completed_date,
before_photos[], after_photos[],
owner_approved (for costs above threshold)
```

#### Financial Record
```
id, property_id, unit_id, type (rent|expense|deposit|fee),
amount, date, category,
description, receipt_url,
status (pending|received|overdue|written_off)
```

#### Communication
```
id, type (email|sms|call|note),
direction (inbound|outbound),
from_entity (owner|tenant|vendor|lead|system),
from_id, to_entity, to_id,
subject, body, 
channel (resend|twilio|manual),
created_at, read_at
```

#### Activity Log
```
id, entity_type, entity_id,
action (created|updated|status_changed|assigned|escalated),
actor (system|ai|user:ebin),
details (jsonb), created_at
```

---

## 3. Event-Driven Architecture

### Event Catalog

| Event | Producer | Consumers | Business Impact |
|-------|----------|-----------|-----------------|
| `lead.created` | Website prequalification form, Kijiji inquiry, Facebook message | AI Leasing Agent, CRM, Notification service | Start lead nurture sequence |
| `lead.prequalified` | Prequalification API | Viewing scheduler, Agent notification | Schedule viewing |
| `viewing.scheduled` | Calendar system | Email service (tenant + agent + owner), Calendar sync | Confirmation + reminders triggered |
| `viewing.completed` | Agent marks complete | Follow-up workflow, Application prompt email | 2hr follow-up, 48hr nudge |
| `application.submitted` | Application form | AI Screener, Document processor, Agent notification | Start screening pipeline |
| `application.screened` | AI Screening Agent | Owner notification (for approval), Agent dashboard | Decision needed |
| `application.approved` | Owner/Agent decision | Lease generator, Move-in workflow, Tenant onboarding | Start move-in process |
| `lease.signed` | E-signature system | Notion sync, Financial setup, Key handover workflow | Tenant is committed |
| `tenant.moved_in` | Agent marks complete | Welcome sequence, Portal setup, Inspection scheduler | Property is occupied |
| `rent.due` | Cron (1st of month) | Payment reminder email, Collections workflow | Revenue event |
| `rent.received` | Payment processor / manual entry | Owner statement, Financial records, Streak tracker | Revenue confirmed |
| `rent.overdue` | Cron (5th of month) | Collections Agent, Escalation workflow | Revenue at risk |
| `maintenance.submitted` | Tenant portal | AI Triage Agent, Priority classifier, Vendor matcher | Service needed |
| `maintenance.emergency` | AI Triage Agent | Immediate vendor dispatch, Owner notification, After-hours escalation | Critical response |
| `maintenance.assigned` | AI/Agent | Vendor notification, Tenant update, Work order created | Service in progress |
| `maintenance.completed` | Vendor marks complete | Tenant satisfaction survey, Owner update, Invoice processing | Issue resolved |
| `lease.expiring_90d` | Cron | Renewal workflow, Market rent analysis, Owner consultation | Retention decision |
| `lease.renewal_offered` | System | Tenant notification, Response tracking | Waiting for decision |
| `tenant.notice_given` | Tenant or system | Turnover workflow, Listing activation, Move-out inspection scheduler | Vacancy incoming |
| `unit.vacant` | Move-out completed | Listing goes live, Turnover checklist, Tenant matching | Revenue loss started |
| `owner.report_due` | Cron (3rd of month) | Report generator, Notion data pull, Email delivery | Owner communication |
| `inspection.due` | Cron | Scheduling workflow, Tenant notification | Compliance |

### Event Payload Standard
```typescript
interface BusinessEvent {
  id: string;              // UUID
  type: string;            // e.g., "maintenance.submitted"
  entity_type: string;     // e.g., "maintenance_request"
  entity_id: string;       // UUID of the entity
  actor: string;           // "system" | "ai:triage" | "user:ebin" | "tenant:uuid"
  data: Record<string, unknown>;  // Event-specific payload
  metadata: {
    timestamp: string;
    source: string;        // "web" | "api" | "cron" | "webhook"
    correlation_id: string; // For tracing related events
  };
}
```

---

## 4. State Machines

### Lead Lifecycle
```
[NEW] ──→ [CONTACTED] ──→ [SHOWING_SCHEDULED] ──→ [SHOWED] ──→ [APPLIED] ──→ [PLACED]
  │            │                   │                  │             │
  └──→ [LOST]  └──→ [LOST]        └──→ [NO_SHOW]     └──→ [LOST]  └──→ [REJECTED]
                                        │
                                        └──→ [RESCHEDULED] ──→ [SHOWED]
```
**Automated actions:**
- NEW → CONTACTED: AI sends inquiry response within 5 minutes
- CONTACTED → SHOWING_SCHEDULED: AI suggests available times
- SHOWED → (no action in 48h) → AI sends follow-up
- LOST: AI asks for feedback, adds to nurture list

### Application Lifecycle
```
[SUBMITTED] ──→ [SCREENING] ──→ [REVIEWED] ──→ [APPROVED] ──→ [LEASE_OFFERED]
                    │                │              │
                    └──→ [DOCS_NEEDED]  │          └──→ [CONDITIONALLY_APPROVED]
                         │             │
                         └──→ [SCREENING] └──→ [REJECTED]
```
**Automated actions:**
- SUBMITTED: AI runs initial screening (credit, income ratio, red flags)
- SCREENING: Auto-pull credit, verify employment via email, check references
- REVIEWED: AI generates recommendation with confidence score
- APPROVED: Auto-generate lease, send for signing
- REJECTED: Send professional decline email, add to waitlist for other properties

### Maintenance Lifecycle
```
[SUBMITTED] ──→ [TRIAGED] ──→ [ASSIGNED] ──→ [SCHEDULED] ──→ [IN_PROGRESS] ──→ [COMPLETED] ──→ [CLOSED]
     │              │             │              │                │
     │              └──→ [SELF_RESOLVED]         │                └──→ [REQUIRES_FOLLOWUP]
     │              │                            │
     └──→ [EMERGENCY] ──→ [DISPATCHED]           └──→ [RESCHEDULED]
```
**Automated actions:**
- SUBMITTED: AI diagnoses issue, suggests troubleshooting steps
- TRIAGED: AI assigns priority, matches vendor by specialty + availability + rating
- ASSIGNED: Auto-notify vendor with work order details
- COMPLETED: Send satisfaction survey to tenant, update vendor rating
- If resolution_time > 48h for normal priority: escalate to owner notification

### Lease Lifecycle
```
[DRAFT] ──→ [SENT] ──→ [SIGNED] ──→ [ACTIVE] ──→ [EXPIRING] ──→ [RENEWAL_OFFERED]
                                        │              │              │
                                        │              │              ├──→ [RENEWED]
                                        │              │              └──→ [TERMINATING]
                                        │              │
                                        └──→ [MONTH_TO_MONTH]
                                        │
                                        └──→ [NOTICE_GIVEN] ──→ [TERMINATING] ──→ [ENDED]
```
**Automated actions:**
- 90 days before expiry: Pull market comps, recommend rent adjustment, notify owner
- 60 days: Send renewal offer to tenant
- 30 days: If no response, escalate; begin pre-listing preparation
- NOTICE_GIVEN: Activate turnover checklist, list unit, start tenant matching

### Rent Collection Lifecycle
```
[DUE] ──→ [REMINDER_SENT] ──→ [RECEIVED] ──→ [RECONCILED]
  │            │
  │            └──→ [OVERDUE_5D] ──→ [OVERDUE_15D] ──→ [OVERDUE_30D] ──→ [COLLECTIONS]
  │                     │                │                  │
  │                     └──→ [RECEIVED]  └──→ [RECEIVED]   └──→ [RECEIVED]
  │                                                              │
  └──→ [PARTIAL] ──→ [BALANCE_DUE]                              └──→ [N4_ISSUED]
```
**Automated actions:**
- 3 days before due: Friendly reminder email
- Day 1 overdue: "Just checking in" email
- Day 5: Formal late notice
- Day 15: Owner notification + N4 preparation
- Day 30: Escalate to human decision (LTB filing consideration)

---

## 5. Workflow Automation Design

### Critical Workflows

#### 1. New Lead → Placed Tenant (Leasing Pipeline)
```
TRIGGER: Lead created (any source)
├── [0 min]   AI responds to inquiry with property details + prequalification link
├── [5 min]   If prequalified → auto-schedule viewing from calendar availability
├── [1 hr]    If not prequalified → nurture email with other listings
├── [24h before viewing] Reminder email with address, parking, what to bring
├── [1h before] "See you soon" reminder
├── [2h after viewing] "How was it?" follow-up with application link
├── [48h no response] Nudge email with urgency signal
├── [Application submitted] AI screens within 10 minutes
├── [AI approved] Owner notified with full file for final decision
├── [Owner approved] Lease auto-generated, sent for e-signing
├── [Lease signed] Move-in workflow triggered
ESCALATION: If lead goes cold for 7 days → human review
FAILURE: If AI screening fails → queue for manual review
```

#### 2. Maintenance Request → Resolution
```
TRIGGER: Tenant submits maintenance request
├── [0 min]   AI analyzes description + photos
│             ├── Emergency? → Immediate vendor dispatch + owner notification
│             ├── Self-fixable? → Send troubleshooting guide, check back in 24h
│             └── Needs vendor → Match vendor by specialty + availability + rating
├── [5 min]   Vendor notified with work order
├── [2h]      If vendor hasn't responded → try next vendor
├── [24h]     Tenant update: "Your request is being handled by [vendor], scheduled for [date]"
├── [On completion] Before/after photos required from vendor
├── [Post-completion] Tenant satisfaction survey
├── [Invoice received] If under owner threshold → auto-approve. If over → owner approval needed.
ESCALATION: Emergency not responded to in 30 min → Ebin's phone rings
FAILURE: No vendor available → manual dispatch
```

#### 3. Lease Renewal
```
TRIGGER: Lease expiry date - 90 days
├── [90 days] Pull market comps for the area
├── [90 days] Calculate recommended rent (based on comps, tenant history, vacancy risk)
├── [90 days] Send owner: "Lease expiring. Here's our recommendation: [analysis]"
├── [Owner decides] → rent amount confirmed
├── [75 days] Send tenant renewal offer with new terms
├── [60 days] If no response → follow-up
├── [45 days] If declined → activate vacancy workflow
├── [Accepted] Generate new lease, send for signing
ESCALATION: Owner unresponsive for 7 days → phone call
```

#### 4. Monthly Owner Report
```
TRIGGER: 3rd of every month at 1pm
├── Pull all financial data from Notion (rent received, expenses, maintenance)
├── AI generates narrative summary highlighting:
│   ├── Rent collection status (paid/outstanding)
│   ├── Maintenance completed and costs
│   ├── Tenant updates (if any)
│   ├── Market position (is rent competitive?)
│   └── Upcoming items (lease renewals, inspections)
├── Generate financial statement (income - expenses = net)
├── Email report to owner
├── Update Notion with "report sent" timestamp
FAILURE: If Notion data incomplete → flag for manual review before sending
```

#### 5. Vacancy → Filled
```
TRIGGER: Unit status changes to "vacant"
├── [0h]   Generate listing from property data (AI writes description)
├── [0h]   Publish to website
├── [0h]   Generate Kijiji/Facebook marketplace copy with property link
├── [1h]   Email matching waitlisted tenants from prequalification database
├── [12h]  Lawn sign order triggered (if applicable)
├── [Daily] Track inquiry count, prequalification rate, viewing conversion
├── [7 days] If <5 inquiries → AI recommends price adjustment
├── [14 days] If no showings → escalate to human review of listing/pricing
├── [Tenant placed] Deactivate listing, update status, notify owner
METRIC: Target fill time ≤ 21 days
```

#### 6. Move-In Process
```
TRIGGER: Lease signed
├── [0h]   Create tenant record in Notion
├── [0h]   Generate tenant portal token
├── [0h]   Send tenant welcome email with portal link
├── [24h before] Send move-in checklist (what to bring, parking, key pickup)
├── [Move-in day] Inspection checklist (photos, condition report)
├── [Move-in day] Key handover
├── [Day 1]  Welcome email: emergency contacts, garbage schedule, how to submit maintenance
├── [Day 7]  Check-in: "How's everything going?"
├── [Day 30] First satisfaction check
```

#### 7. Move-Out Process
```
TRIGGER: Notice given or lease terminated
├── [Immediately] Schedule move-out inspection
├── [30 days before] Send tenant move-out checklist (cleaning expectations, key return)
├── [14 days before] Schedule turnover vendors (cleaning, painting if needed)
├── [Move-out day] Inspection with photos
├── [Move-out day] Compare against move-in photos (AI diff)
├── [1 day after] Assess damages, calculate deposit return/deduction
├── [10 days after] Send deposit return or itemized deduction list (Ontario: within 10 days)
├── [If vacant] Trigger vacancy workflow
```

---

## 6. AI Agent Layer

### Agent 1: Leasing Coordinator
**Role:** Handle 90% of the leasing pipeline without human involvement.
```
RESPONSIBILITIES:
- Respond to all listing inquiries within 5 minutes
- Answer property questions from listing data
- Pre-qualify leads via the qualification form
- Schedule viewings from calendar availability
- Send reminders and follow-ups
- Generate listing descriptions from property data
- Recommend pricing based on market data

TOOLS:
- Property database (read)
- Calendar API (read/write)
- Email (send)
- Prequalification form (generate links)
- Market data (read)

PERMISSIONS:
- CAN: respond to inquiries, schedule viewings, send emails, generate listings
- CANNOT: approve applications, sign leases, make pricing decisions, negotiate

DECISION BOUNDARIES:
- If lead asks about price negotiation → escalate to human
- If lead has special circumstances (co-signer, guarantor, etc.) → escalate
- If lead asks legal questions → redirect to appropriate resources

MEMORY:
- Conversation history per lead
- Property details
- Previous interactions with this email/phone

ESCALATION:
- Inquiry it can't answer → flag for human response within 4 hours
- Hot lead (high score, ready to apply) → immediate human notification
```

### Agent 2: Maintenance Triage
**Role:** Classify, diagnose, and route every maintenance request.
```
RESPONSIBILITIES:
- Read maintenance description + analyze photos
- Classify priority (emergency/urgent/normal/low)
- Attempt self-resolution (send troubleshooting guide)
- Match to best vendor (specialty + rating + availability + cost)
- Generate work order with scope of work
- Keep tenant updated on status

TOOLS:
- Maintenance database (read/write)
- Vendor database (read)
- Photo analysis (vision API)
- Email/SMS (send to tenant + vendor)

PERMISSIONS:
- CAN: classify, diagnose, assign vendor for normal/low priority, send updates
- CANNOT: approve costs above owner threshold, handle emergencies alone

DECISION BOUNDARIES:
- Emergency (water leak, no heat in winter, gas smell, fire) → immediate human alert + vendor dispatch
- Cost estimate > $500 → owner approval required before dispatching
- Structural issues → always escalate

MEMORY:
- Property maintenance history
- Known recurring issues at this address
- Vendor performance for this type of work
```

### Agent 3: Collections
**Role:** Follow up on late rent with escalating firmness.
```
RESPONSIBILITIES:
- Send payment reminders (friendly → formal → legal)
- Track payment promises and follow up
- Generate N4 notices when authorized
- Report delinquency patterns to owner

TOOLS:
- Payment database (read)
- Email/SMS (send)
- N4 template generator
- Owner notification

PERMISSIONS:
- CAN: send reminders, track promises, generate N4 drafts
- CANNOT: file LTB applications, negotiate payment plans, waive fees

DECISION BOUNDARIES:
- After 30 days → human decision on legal action
- If tenant disputes amount → escalate immediately
- If tenant claims hardship → escalate to human for empathy-required conversation

TONE:
Day 1-5: Friendly, "just checking in"
Day 5-15: Professional, "this is overdue"
Day 15-30: Formal, "action required"
Day 30+: Legal language, human-drafted
```

### Agent 4: Owner Relations
**Role:** Keep owners informed and satisfied without manual work.
```
RESPONSIBILITIES:
- Generate monthly reports
- Answer owner questions from their property data
- Proactively flag issues (late rent, upcoming vacancies, market shifts)
- Recommend rent adjustments based on market data
- Handle routine owner requests (statements, documents, tax receipts)

TOOLS:
- Notion data (read)
- Financial records (read)
- Market data (read)
- Email (send)
- Document storage (read)

PERMISSIONS:
- CAN: generate reports, answer data questions, make recommendations
- CANNOT: make decisions about tenants, approve expenses, change rent without owner consent

ESCALATION:
- Owner complaint → immediate human response
- Owner considering terminating management → immediate human response
- Legal questions → redirect to lawyer
```

### Agent 5: Operations Intelligence
**Role:** Continuously analyze the entire operation and surface risks.
```
RESPONSIBILITIES:
- Monitor all properties for anomalies
- Predict vacancy risk (lease expiry + tenant satisfaction + market conditions)
- Predict payment risk (payment history + employment status + seasonal patterns)
- Identify underperforming vendors
- Flag operational bottlenecks
- Generate weekly operations summary for Ebin

TOOLS:
- All databases (read-only)
- Analytics/metrics
- External market data

OUTPUT:
- Daily risk dashboard
- Weekly ops summary
- Proactive alerts when metrics cross thresholds
```

### Where Humans Remain Essential

| Function | Why Human |
|----------|-----------|
| Final tenant approval | Legal liability, judgment call |
| Pricing decisions | Business strategy |
| Emergency response coordination | Lives at stake |
| LTB/legal proceedings | Legal process |
| Owner relationship (disputes, termination) | Empathy, negotiation |
| Property inspections | Physical presence |
| Key handover | Physical presence |
| Vendor negotiation (large jobs) | Cost judgment |
| New owner sales/onboarding (first meeting) | Trust building |

---

## 7. Operational Intelligence Layer

### Key Metrics & Signals

#### Vacancy Risk Score (per unit)
```
INPUTS:
- Days until lease expiry
- Tenant satisfaction score (from surveys, maintenance response time)
- Rent vs market rate (overpriced = higher risk)
- Tenant communication frequency (sudden silence = risk)
- Payment history (late payments = risk)
- Number of maintenance requests (too many = unhappy)

OUTPUT: 0-100 risk score
THRESHOLD: >70 = immediate action required
ACTION: Notify owner, begin retention strategy, prepare listing
```

#### Payment Risk Score (per tenant)
```
INPUTS:
- Payment history (last 6 months)
- Days late (trend line)
- Employment status
- Seasonal pattern (e.g., always late in January)
- Communication responsiveness

OUTPUT: 0-100 risk score
THRESHOLD: >60 = proactive outreach
ACTION: Early reminder, flexible payment arrangement offer
```

#### Vendor Quality Score
```
INPUTS:
- Response time (how fast they accept work orders)
- Completion time vs estimate
- Cost vs estimate
- Tenant satisfaction rating
- Callback rate (same issue reoccurs?)
- Photo documentation quality

OUTPUT: 0-100 quality score
THRESHOLD: <50 = remove from preferred list
ACTION: Auto-prioritize higher-rated vendors
```

#### Owner Satisfaction Score
```
INPUTS:
- Report engagement (opens, time spent)
- Communication frequency (are they asking questions?)
- Vacancy duration at their properties
- Rent collection rate
- Maintenance cost trend
- Portal usage

OUTPUT: 0-100 satisfaction score
THRESHOLD: <60 = proactive outreach from Ebin
```

#### Leasing Efficiency
```
METRICS:
- Average days to fill (target: ≤21)
- Lead-to-showing conversion (target: ≥40%)
- Showing-to-application conversion (target: ≥30%)
- Application-to-lease conversion (target: ≥60%)
- Cost per lead by channel
- Listing view-to-inquiry rate
```

### Predictive Models (Phase 4+)

1. **Vacancy Prediction**: Given lease expiry date, tenant satisfaction, and market conditions → probability of vacancy and expected fill time
2. **Rent Optimization**: Given comparables, amenities, condition, and seasonal demand → optimal rent price for minimum vacancy
3. **Maintenance Prediction**: Given property age, last maintenance, and weather → predict upcoming maintenance needs
4. **Churn Prediction**: Given tenant behavior patterns → likelihood of not renewing

---

## 8. Autonomous Company Design

### The 5-Person Company That Does the Work of 25

#### Human Roles (5 people)

**1. Ebin (CEO/Operations)**
- Final decision-maker on all tenant approvals
- Owner relationship management (new sales, disputes, high-touch)
- Pricing strategy
- Emergency escalation handler
- Weekly operations review (30 min with AI summary)

**2. Leasing Coordinator (1 person, could be part-time)**
- Conduct in-person viewings
- Handle edge-case leads that AI escalates
- Physical key handovers
- Move-in/move-out inspections
- Lawn sign placement

**3. Maintenance Coordinator (1 person, eventually)**
- Handle emergency dispatches
- Vendor relationship management
- Quality control on completed work
- Property inspections

**4. Bookkeeper (part-time, outsourced)**
- Monthly reconciliation
- Tax preparation
- Owner statement verification

**5. Admin/Customer Service (1 person, eventually)**
- Handle phone calls that can't be AI-handled
- Document management
- Mail processing
- General admin

#### AI Roles (replace 15-20 humans)

| Traditional Role | AI Replacement | How |
|-----------------|----------------|-----|
| Receptionist (2-3 people) | AI Leasing Agent | Answers all inquiries 24/7 |
| Leasing agents (3-4 people) | AI + 1 human for viewings | AI handles 90% of pipeline, human shows properties |
| Tenant screening (1-2 people) | AI Screener | Auto-pulls credit, income, references |
| Rent collection (1-2 people) | AI Collections + automation | Reminders, follow-ups, N4 generation |
| Maintenance dispatch (2-3 people) | AI Triage + automation | Classify, route, track, follow-up |
| Owner reporting (1-2 people) | AI Report Generator | Monthly reports auto-generated |
| Marketing (1-2 people) | AI Content Generator | Listings, social posts, emails |
| Accounting support (1-2 people) | Automation + bookkeeper | Auto-categorize, auto-reconcile |
| Customer service (2-3 people) | AI Tenant/Owner support | Handle 80% of routine inquiries |

#### Interaction Model
```
TENANT → AI Agent (first contact) → Human (only if escalated)
OWNER → AI Agent (reports, routine questions) → Ebin (relationships, decisions)
VENDOR → Automated work orders → Human (quality disputes only)
LEAD → AI Agent (qualification, scheduling) → Human (physical viewing)
```

### Scale Thresholds

| Properties | Team Size | AI Dependency |
|-----------|-----------|---------------|
| 20-50 | 1 (Ebin) | High — AI handles 70% |
| 50-100 | 2 (+ leasing coordinator) | Higher — AI handles 80% |
| 100-250 | 3-4 (+ maintenance coord) | Very high — AI handles 85% |
| 250-500 | 5 | Maximum — AI handles 90% |
| 500-1000 | 8-10 | AI handles 90%, humans handle scale |
| 1000+ | 15-20 | AI handles 90%, need regional coordinators |

Traditional company at 500 properties: **40-50 employees**
Prospera at 500 properties: **5-8 employees**

---

## 9. Internal Command Center

### Single-Screen Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│  PROSPERA COMMAND CENTER                          Jun 29, 2026  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─── REVENUE ───┐  ┌─── PORTFOLIO ──┐  ┌─── PIPELINE ───┐    │
│  │ MTD: $42,500  │  │ 47 units       │  │ 12 active leads │    │
│  │ YTD: $298,000 │  │ 44 occupied    │  │ 3 viewings today│    │
│  │ ▲ 8% vs LY   │  │ 3 vacant       │  │ 5 applications  │    │
│  │ 2 overdue     │  │ 93.6% occ.     │  │ 2 awaiting sig  │    │
│  └───────────────┘  └────────────────┘  └────────────────┘    │
│                                                                  │
│  ┌─── MAINTENANCE ──────────────────────────────────────────┐   │
│  │ Open: 7  │  Emergency: 0  │  Avg Resolution: 2.1 days   │   │
│  │ ▓▓▓▓▓▓▓░░░ 70% within SLA                               │   │
│  │                                                           │   │
│  │ ⚡ Unit 3, 456 Dundas: Leak in kitchen — vendor en route  │   │
│  │ ⏱ Unit 1, 89 Adelaide: HVAC tune-up — scheduled Wed      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── RISK ALERTS ──────────────┐  ┌─── OWNER HEALTH ──────┐   │
│  │ 🔴 Rent 15+ days late: 1    │  │ 😊 Happy: 18          │   │
│  │ 🟡 Lease expiring <60d: 2   │  │ 😐 Neutral: 2         │   │
│  │ 🟡 Vacancy >14 days: 1     │  │ 😟 At risk: 0         │   │
│  │ 🟢 Vendor reliability <70: 0│  │ NPS: 78               │   │
│  └──────────────────────────────┘  └────────────────────────┘   │
│                                                                  │
│  ┌─── AI ACTIVITY (last 24h) ───────────────────────────────┐   │
│  │ 📧 23 emails sent (12 tenant, 8 lead, 3 vendor)         │   │
│  │ 🤖 5 maintenance requests triaged                        │   │
│  │ 📋 2 applications screened                               │   │
│  │ 📊 1 owner report generated                              │   │
│  │ ⚠️ 1 escalation to human (tenant hardship claim)         │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── TODAY'S ACTION ITEMS ─────────────────────────────────┐   │
│  │ □ Approve application: Sarah Chen → Unit 2, 89 Adelaide  │   │
│  │ □ Call owner: Randy L. — lease renewal pricing decision   │   │
│  │ □ Review: AI flagged unusual maintenance pattern at #221  │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Principles
1. **Exception-based** — only shows what needs human attention
2. **Real-time** — updates via Supabase Realtime subscriptions
3. **Action-oriented** — every item has a clear next action
4. **Risk-first** — problems surface before they become crises
5. **One screen** — no clicking through 5 tabs to understand the business

---

## 10. Competitive Advantage Analysis

### Prospera vs Traditional PM Company

| Metric | Traditional | Prospera | Advantage |
|--------|------------|---------|-----------|
| **Lead response time** | 4-24 hours | <5 minutes | 48x faster |
| **Application screening** | 2-5 days | 10 minutes | 288x faster |
| **Maintenance triage** | 30 min - 4 hours | Instant | Eliminates wait |
| **Monthly owner report** | Manual, often late | Auto-generated, always on time | 100% reliability |
| **Vacancy fill time** | 30-45 days | 14-21 days | 30-50% faster |
| **Staff per 100 units** | 4-6 employees | 1-2 employees | 60-75% less labor |
| **Management fee** | 8-12% of rent | 8% (competitive pricing) | Better margins at lower price |
| **24/7 availability** | No (office hours) | Yes (AI agents) | Always on |
| **Tenant satisfaction** | Survey says: 3.2/5 | Target: 4.5/5 | Better retention |
| **Owner communication** | Reactive (when asked) | Proactive (AI-driven) | Trust building |
| **Cost per unit managed** | $80-120/month | $30-50/month | 50-60% lower |
| **Scaling cost** | Linear (more staff) | Logarithmic (more AI) | 10x scale advantage |

### Unit Economics Comparison (at 200 units, avg rent $1,800)

**Traditional Company:**
```
Revenue: 200 × $1,800 × 10% = $36,000/mo
Staff: 10 people × $4,000 avg = $40,000/mo
Overhead: $8,000/mo
Profit: -$12,000/mo (LOSING MONEY at 10%, need 12%+ fee)
```

**Prospera:**
```
Revenue: 200 × $1,800 × 8% = $28,800/mo
Staff: 3 people × $4,500 avg = $13,500/mo
AI/Software: $2,000/mo (Claude, Supabase, Vercel, Resend, Google)
Overhead: $3,000/mo
Profit: $10,300/mo (35.7% margin at LOWER fee)
```

**The moat:** Traditional companies can't match your price AND your service level. They'd need to hire more people (cost goes up) or cut service (quality goes down). You do both better because software scales and humans don't.

---

## 11. Implementation Plan

### Phase 1: MVP Foundation (CURRENT — 80% done)
**Timeline:** Already built
**Status:** Live

What exists:
- ✅ Property listing system with full detail wizard
- ✅ AI-generated listings, descriptions, highlights, life simulation
- ✅ Tenant pre-qualification funnel with scoring
- ✅ Neighbourhood intelligence (Google Maps auto-fetch)
- ✅ Landlord onboarding with placement agreement
- ✅ Market comp report with interactive rent simulator
- ✅ Viewing booking with ICS calendar + email confirmations
- ✅ Post-viewing automated follow-up sequence (24h, 1h, post, 48h nudge)
- ✅ Tenant matching on new publish (auto-email waitlisted tenants)
- ✅ Marketplace description auto-generation (Kijiji/Facebook)
- ✅ Notion sync for properties
- ✅ Owner portal with financial dashboards
- ✅ Tenant portal with maintenance submission
- ✅ Monthly owner report auto-generation
- ✅ SEO automation (blog writer, optimizer, GSC integration)
- ✅ Admin panel with all management tools

What's missing from Phase 1:
- ☐ Fix the agreement signing loop
- ☐ Proper Notion sync for ALL entities (tenants, owners, not just properties)
- ☐ Owner report includes all expense categories
- ☐ Listing views tracking on tenant-facing pages

**Expected ROI:** Operational. This is the base.

---

### Phase 2: Automation (Next 30 days)
**Goal:** Eliminate 80% of manual repetitive tasks

Features:
1. **Automated rent reminders** — email sequence: 3 days before → day of → 1 day late → 5 days late → 15 days late
2. **Lease expiry workflow** — auto-detect, pull comps, notify owner, send renewal to tenant
3. **Automated move-in/move-out checklists** — triggered by lease dates
4. **Vendor work order system** — create, assign, track, invoice
5. **Inspection scheduling** — auto-schedule at 6-month intervals, send tenant notification
6. **Owner statement automation** — pull Notion data, calculate net, email PDF

Dependencies:
- Rent tracking needs consistent data entry (manual until Stripe)
- Vendor database needs to be populated

Risks:
- Automating rent reminders before rent collection is systematized could send wrong amounts
- Lease renewal automation requires accurate lease expiry dates in database

**Expected ROI:** Save 15-20 hours/week of manual work

---

### Phase 3: AI Agents (60-90 days)
**Goal:** AI handles first contact and triage for all incoming requests

Features:
1. **AI Leasing Agent** — responds to all listing inquiries within 5 minutes via email
2. **AI Maintenance Triage** — classify every request, suggest troubleshooting, route to vendor
3. **AI Application Screener** — analyze credit, income, references and generate recommendation
4. **AI Owner Q&A** — answer routine owner questions from their data (rent status, maintenance updates)
5. **Smart vendor matching** — match maintenance requests to best vendor by specialty + rating

Dependencies:
- Phase 2 workflows must be stable
- Vendor database with ratings and specialties
- Clear escalation paths defined and tested

Risks:
- AI gives wrong answer to tenant/owner → brand damage
- AI misclassifies maintenance priority → safety risk
- Need robust fallback: "I'm connecting you with Ebin directly"

Mitigations:
- All AI responses include "This is an automated response. For urgent matters, call (519) 697-1227"
- Emergency keywords trigger immediate human alert
- AI confidence threshold: below 70% → escalate to human

**Expected ROI:** Handle 3x more leads without adding staff. Save 10-15 hours/week on routine communication.

---

### Phase 4: Operational Intelligence (90-180 days)
**Goal:** The system tells you what's going to happen before it happens

Features:
1. **Vacancy risk predictor** — flag tenants likely to not renew
2. **Rent optimization engine** — continuous market monitoring, recommend adjustments
3. **Vendor quality scoring** — auto-compute from resolution times and tenant ratings
4. **Owner health scoring** — detect at-risk owner relationships
5. **Payment risk scoring** — predict late payments before they happen
6. **Command center dashboard** — single screen showing everything
7. **Weekly AI ops summary** — Ebin gets a briefing every Monday

Dependencies:
- 6+ months of data in the system
- Accurate and consistent data entry
- Phase 3 AI agents generating activity data

Risks:
- Not enough data to make good predictions at small scale
- False positives cause unnecessary interventions

**Expected ROI:** Prevent 2-3 vacancies per year ($3,600-5,400 each). Catch 1-2 maintenance issues before they become expensive ($500-2,000 each). Total: $15,000-25,000/year saved.

---

### Phase 5: Autonomous Operations (6-12 months)
**Goal:** The company runs itself. Ebin handles exceptions only.

Features:
1. **Fully autonomous leasing pipeline** — lead to signed lease with minimal human involvement
2. **Automated rent collection** — Stripe Connect, auto-reconcile, auto-deposit to owner
3. **Self-healing maintenance** — common issues get auto-dispatched without human review
4. **Predictive maintenance** — schedule work before things break
5. **AI-generated market reports** for owner acquisition (sales tool)
6. **Owner self-service portal** — statements, documents, decisions without calling Ebin
7. **Tenant self-service portal** — pay rent, submit requests, view documents, renew lease

Dependencies:
- All previous phases stable and reliable
- 100+ units under management to justify investment
- Stripe Connect integration for payment automation
- Legal review of AI-generated communications

Risks:
- Over-automation alienates owners who value personal relationship
- System failure without human backup = catastrophic
- Regulatory changes (Ontario RTA) require manual policy updates

Mitigations:
- "High-touch" flag on owners who prefer personal communication
- Always have manual override for every automated process
- Quarterly regulatory review checklist

**Expected ROI:** At 200 units, this system replaces $300,000+/year in labor costs while delivering better service than a 10-person team.

---

## Summary

This is not a software project. This is a company design.

The software is the company. Every process, every decision tree, every communication is codified. Humans handle what requires judgment, empathy, or physical presence. Everything else runs on automation and AI.

**The competitive moat is not the technology — it's the operational efficiency.** A competitor can copy the tech stack. They can't copy the operational discipline, the data you've accumulated, the AI training, or the workflow optimizations you've refined over time.

At 500 units, a traditional company needs 40 people and charges 12% fees. You need 5 people and charge 8%. You make more money. Your tenants get better service. Your owners get better reports. And you sleep through the night because the AI is handling the 2am calls.

That's the company.
