# Prospera Properties — Tech Roadmap

_Updated weekly by the IT agent. This is the product brain — what has been built, what is planned, and where we are going._

---

## Product Vision

Prospera Properties is being built into a full property management platform that can eventually be licensed to other property management companies across Ontario and Canada. Every feature should be:
- Generic enough to work for any property management company
- Focused on tenant or landlord experience first
- Built with clean architecture (no hardcoded Prospera-specific logic where possible)
- Designed to create "wow" moments in a future product demo

---

## Current Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Supabase (database + auth + storage)
- Vercel (hosting — free hobby plan)
- Resend (email — free plan: 3,000 emails/month)
- Zoho CRM (contact management)
- Buildium (property management operations — external)

## Free Plan Limits to Watch
- Vercel: 100GB bandwidth/month, 100 serverless function invocations/day on hobby
- Supabase: 500MB database, 1GB file storage, 50,000 monthly active users
- Resend: 3,000 emails/month, 100/day

---

## Feature Backlog (Priority Order)

### High Priority — Tenant Experience
- [ ] **Maintenance Request Portal** — tenant submits request with photo, gets status updates, landlord notified
- [ ] **Tenant Dashboard** — view lease details, payment history, open maintenance requests
- [ ] **Move-in Checklist** — digital form tenant completes on move-in with photo upload
- [ ] **Document Portal** — tenant can download their lease, inspection reports, notices

### High Priority — Landlord Experience
- [ ] **Owner Financial Dashboard** — monthly income, expenses, net cash flow per property
- [ ] **Vacancy Rate Tracker** — days vacant per property, cost of vacancy
- [ ] **Automated Owner Statement** — monthly PDF emailed to landlord automatically
- [ ] **Tenant Communication Log** — all communications in one place per tenant

### Medium Priority — Platform
- [ ] **Multi-company Architecture** — data isolation so the platform can serve multiple property management companies
- [ ] **White-label Settings** — company name, logo, colors configurable per client
- [ ] **Onboarding Flow** — landlord signs up, adds properties, invites tenants in one smooth flow
- [ ] **Mobile-first Tenant App** — PWA or responsive web app tenants actually use on their phone

### Low Priority — Growth
- [ ] **Referral System** — landlords refer other landlords, get discount on management fee
- [ ] **Review/Testimonial Collection** — automated email asks happy tenants and landlords for Google reviews
- [ ] **Landlord Resource Hub** — downloadable Ontario-specific templates (lease, inspection form, N4 letter)

---

## Completed Features
- [x] Property listings with Supabase
- [x] Admin panel (property management, outreach logging)
- [x] Business dashboard (Zoho CRM pipeline, Meta ads, outreach stats)
- [x] Blog with SEO agent (automated weekly posts)
- [x] Subscribe/newsletter capture
- [x] Zoho CRM integration (contacts synced on subscribe)
- [x] Resend email templates (landlord welcome, tenant welcome)
- [x] Area pages (London, St. Thomas, Strathroy)
- [x] LocalBusiness schema
- [x] Sitemap + robots

---

## Performance Notes
- Homepage uses Framer Motion particle animation — watch bundle size
- Blog posts are statically generated — good for performance
- No image optimization issues found yet
- Supabase queries are direct from client on admin pages — consider moving to server actions for security

---

## Last IT Agent Run
Never — first run pending (Wednesday)

## This Week's Proposal
Pending
