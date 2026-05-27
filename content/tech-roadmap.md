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
- app/listings/page.tsx is a use-client component querying Supabase directly from the browser, exposing the anon key in the client bundle — should be refactored to a server component
- app/admin/page.tsx uses raw img tags (lines 129, 171) instead of next/image, missing optimization
- No Suspense boundaries found anywhere in the app — async pages would benefit from Suspense for better loading UX
- Supabase queries are direct from client on admin pages — consider moving to server actions for security
- **[2026-05-20]** app/page.tsx is a 678-line use-client component — the entire homepage renders client-side including Framer Motion, inflating the JS bundle significantly
- **[2026-05-20]** Only the google-reviews API route sets a revalidate cache; all other API routes hit upstream services on every request with no caching
- **[2026-05-20]** app/admin/properties/page.tsx uses raw img tags (lines 128 and 175) instead of next/image, missing automatic optimization and lazy loading
- **[2026-05-27]** Both `framer-motion` and `motion` are listed as separate dependencies in package.json — these are the same package (Framer Motion v12 rebranded as `motion`), effectively doubling the animation library bundle contribution; one should be removed
- **[2026-05-27]** app/platform/page.tsx is a 1,130-line `use client` component with no server-rendered sections; large static portions could be split into server components to reduce JS hydration cost
- **[2026-05-27]** No loading.tsx files or Suspense boundaries exist outside admin/seo — all async routes have no skeleton or loading states, causing full-page blank delays on slower connections

---

## Last IT Agent Run
2026-05-27

## This Week's Proposal
Maintenance Request Portal — MVP
