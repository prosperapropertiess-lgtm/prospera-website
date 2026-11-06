# Rental market dashboard

Admin → Leasing → Rental Market (`/admin/market`). Private, behind the admin login.

## Source
- Google Sheet "London Rent Market Data" (`MARKET_SHEET_ID`, defaults to `18EObfz4KTuyIEVq6vKQCpnIdXGlip9ayda-IbrZN2R4`), tabs `Listings` and `Summary`. Read-only; never written to.
- Server reads use the existing service account (`GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`, or `GSC_SERVICE_ACCOUNT_JSON`). The Sheet must be shared with that address as Viewer. Data & Sync shows the exact address when access is missing.

## Updates
- Scheduled: `/api/cron/market-sync`, Fridays 10:00 Toronto. vercel.json fires at 14:00 and 15:00 UTC; only the run that is 10:00 in Toronto proceeds (DST-safe). `?force=1` skips the hour check.
- Manual: Data & Sync → Refresh now (`POST /api/admin/market/sync`, `{ dryRun?: boolean }`).
- Agent import: `POST /api/admin/market/import` with `Authorization: Bearer $MARKET_IMPORT_SECRET` and `{ tabs: [{ name, grid: string[][] }], dryRun?, sourceUrl? }`. Same pipeline as the Sheet read.
- None of these start a Facebook scan. They read what the scanner last wrote.

## Pipeline (lib/market/ingest.ts)
1. Lock (one run at a time), log an attempt in `market_ingestions`.
2. Read Listings by header name; keep extra columns; skip blank rows without stopping.
3. One observation per `listing_id` (IDs stay text). Identical repeats merge `source_queries`; conflicting repeats are flagged `duplicate_conflict` and kept out of rents.
4. Parse Summary: scan date/label, source-reported counts, every section with source row numbers.
5. Scan identity = scan date + label from the Summary. Same identity + same content → `unchanged` (logged, no new data point). Same identity + different content → new revision, older revision marked superseded. No scan date → stored as "unverified".
6. Snapshot inserted unpublished, observations written, then `published_at` set. Failures leave the last good snapshot in place.
7. Summary's Prospera rows are upserted into `market_watchlist` (manual edits to comparison settings/notes are kept).

## Rules (lib/market/core.ts, shared by every screen and export)
- Cohorts: `whole` (price_basis whole_unit, type not room, valid price), `room` (per_room, valid price), `review` (room typed but whole_unit, or unknown basis), `none` (no usable price or duplicate conflict). Whole and room rents never share a statistic.
- Quantiles: linear interpolation at (n−1)p. Percentile of a subject: midrank. Outliers: IQR fences (≥8 values), only excluded when the user ticks the option.
- Sample labels: 0 none, 1–4 very small, 5–9 small.
- Missing values are "Not stated", never "no". `5+` bedrooms is a category, not 5. Month-only availability dates never get a year.
- Corrections (`market_overrides`) are applied on top of source values at read time, per listing or per scan, with history and undo.

## Tables
`market_snapshots` (raw grids kept in `raw`), `market_observations`, `market_ingestions`, `market_watchlist`, `market_overrides`, `market_saved_views`. Backups follow Supabase's normal backups; raw grids make any scan re-importable.

## Limits
- One scan exists so far (Nov 6, 2026). Trends, price changes and "not seen again" fill in from the second scan.
- Not seen ≠ rented: scans are newest-first and capped at 20 pages per search.
- No map: listings have no coordinates.
