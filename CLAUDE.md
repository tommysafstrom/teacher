# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `app/`:

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # eslint
```

No test suite exists.

## Next.js version warning

This project uses Next.js 16.x — a version with **breaking changes** from earlier releases. Before writing any Next.js-specific code (routing, data fetching, server components, middleware), read the relevant guide in `app/node_modules/next/dist/docs/`. Do not rely on training data about Next.js APIs.

## Architecture

Single Next.js app (App Router) in `app/`. All data lives in `app/data/db.json` — a flat JSON file, no external database or auth service. `lib/db.ts` provides typed read/write helpers with a module-level promise chain (`writeChain`) as a write lock to prevent concurrent corruption.

Auth is cookie-only: `middleware.ts` checks for a `userId` cookie and redirects unauthenticated requests to `/login`. The login page lets users pick their identity from the users list — no passwords.

## User roles

Two roles drive the routing:
- **requester** — creates observation requests, assigns suppliers, tracks responses (`/requester/…`)
- **supplier** — fills in observation forms for assigned kids (`/supplier/…`)

The teacher flow (kid profile, screening, diagnosis, adjustments) lives at `/kids/[id]/…` and is accessible to all authenticated users.

## Key domain concepts

**Screening** — the `lib/screening.ts` module implements the Skolkompassen questionnaire: 97 checkbox questions across 7 areas (kommunikation, planering, sinnesintryck, uppmärksamhet, impulsivitet, tidsuppfattning, flexibilitet), each question belonging to one of 4 color-coded severity fields. `deriveTraits()` maps checked areas to `ScreeningTrait` values; `buildSummary()` produces a human-readable summary.

**Adjustments** — computed on every `GET /api/kids/[id]/adjustments` call by `lib/adjustments.ts`. They are never persisted in `db.json`. The logic merges the kid's screening traits and diagnoses, looks up matching materials from the library by challenge/trait tag, and returns ranked tips grouped by area (klassrumsmiljö, bemötande, ämne, lektionsstruktur).

**Requests & responses** — a `Request` links a requester, a list of kids, and a list of suppliers. Each `Response` is keyed by `(requestId, supplierId, kidId)`. Responses without `submittedAt` are drafts; once submitted the form locks. `Reminder` records are appended (never updated) each time a requester sends a reminder to a supplier.

## Data model

All types are in `lib/types.ts`. The `DB` interface mirrors `db.json`:
`kids` (with embedded `screenings` and `diagnoses`) · `library` · `users` · `requests` · `responses` · `reminders`
