# Teacher Support Tool — Implementation Plan

## Project Overview

A locally-run browser tool that helps teachers support kids with special needs.
Teachers select a kid, view their profile, run screenings, add diagnoses, and get
tailored adjustment tips and material. Data is stored in a local JSON file. Kids
are identified by ID only (privacy-first).

---

## Framework Recommendation

**Next.js (TypeScript)** — runs locally via `npm run dev`, handles file I/O through
API routes (no separate server needed), straightforward to harden into a proper
multi-user app later, and has the largest ecosystem for adding auth, DB, etc.

Stack: Next.js 15 · TypeScript · Tailwind CSS (utility-only, no fancy graphics) · local JSON file via `fs` in API routes.

**Language:** All user-facing text (labels, buttons, headings, tips, material titles, error messages, questionnaire questions) must be written in Swedish. The codebase (variable names, comments, file names) stays in English.

---

## Phases

---

### Phase 0 — Architecture & Flow Documentation
> Goal: produce Mermaid diagrams that capture the full system before a line of code is written. Saved under `documentation/`.

**Suggested agent:** `claude` (Opus 4.7 — reasoning over the full design to produce accurate, complete diagrams)

- [x] Create `documentation/architecture.md` — system architecture diagram in Mermaid covering:
  - [x] Browser → Next.js pages → API routes → `lib/db.ts` → `data/db.json`
  - [x] Folder structure overview (pages, API, lib, data, documentation)
- [x] Create `documentation/flow-teacher.md` — user flow diagram in Mermaid covering:
  - [x] Start → välj elev → elevprofil
  - [x] Elevprofil → Kartlägg → frågeformulär → spara resultat → tillbaka till profil
  - [x] Elevprofil → Diagnos → lägg till/ta bort diagnos → tillbaka till profil
  - [x] Elevprofil → Anpassningar → visa rangordnade tips → länk till materialbibliotek
  - [x] Materialbibliotek → filtrera på utmaning/ämne
- [x] Create `documentation/data-model.md` — entity-relationship diagram in Mermaid covering:
  - [x] Kid ↔ Screening (1:many)
  - [x] Kid ↔ Diagnosis (1:many)
  - [x] Diagnosis + Screening traits → Adjustments (derived, not stored)
  - [x] Adjustment → Material (many:many via challenge tag)
- [x] Review all three diagrams together and verify they are consistent with the plan before proceeding to Phase 1

---

### Phase 1 — Foundation & Data Model
> Goal: empty project that boots, with an agreed-upon JSON schema for all data.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Scaffold Next.js project with TypeScript and Tailwind CSS
- [x] Define JSON schema: kids, screenings, diagnoses, adjustments, material library (`lib/types.ts`)
- [x] Create seed file `data/db.json` with two kids: Adam (id: `k001`) and Beata (id: `k002`), plus 10 sample library items
- [x] Implement `lib/db.ts` — typed read/write helpers with promise-chain write-lock
- [x] Implement `lib/adjustments.ts` — rule-based derivation of adjustments from traits + diagnoses
- [x] Implement `lib/screening.ts` — 16-question Swedish questionnaire + trait-derivation logic
- [x] Verify dev server starts and API routes can read/write the JSON file (`npm run build` passes, all 11 routes generated)

---

### Phase 2 — Kid Selection & Profile
> Goal: teacher can pick a kid and see their profile card.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Build `/` page: kid selector showing display labels in Swedish
- [x] Build `/kids/[id]` page: profile view showing
  - [x] Kid's label and ID
  - [x] Summary of active screenings
  - [x] Summary of diagnoses
  - [x] Quick-access buttons in Swedish: "Kartlägg" · "Diagnos" · "Anpassningar"
- [x] API route `GET /api/kids/[id]` returning full kid record

---

### Phase 3 — Screening Module
> Goal: teacher can run a structured questionnaire to learn more about the kid.

**Suggested agent:** `claude` (Sonnet 4.6) for UI + `claude-opus-4-7` for questionnaire design

- [x] Design screening questionnaire format — 16 questions across 6 areas, mean-score threshold logic, Swedish "-liknande" labels
- [x] Build `/kids/[id]/screen` page with step-by-step questionnaire UI (grouped by area, 0–3 scale)
- [x] API route `POST /api/kids/[id]/screenings` — validates input, derives traits, saves to JSON
- [x] Display past screening results on profile page (date, summary)
- [x] Ensure all result labels use neutral, non-clinical Swedish (e.g. "uppmärksamhetsliknande", "strukturliknande")

---

### Phase 4 — Diagnosis Module
> Goal: teacher can record a formal diagnosis and see relevant material.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Build `/kids/[id]/diagnose` page — add/remove diagnoses (dyslexi, adhd, autismspektrum, dyskalkyli, språkstörning)
- [x] API route `POST /api/kids/[id]/diagnoses` — allowlist-validated, saves to JSON
- [x] API route `DELETE /api/kids/[id]/diagnoses?diagnosisId=` — removes by ID
- [x] Link each diagnosis to the material library (adjustments page links to library)
- [x] Display active diagnoses on profile with date

---

### Phase 5 — Adjustments Module
> Goal: teacher sees a unified, prioritised list of practical tips derived from screenings + diagnoses.

**Suggested agent:** `claude-opus-4-7` (reasoning-heavy — merging multiple signals into ranked tips)

- [x] Design adjustment-derivation logic — 18 rules across 4 areas, triggered by challenge/trait union
- [x] Build `/kids/[id]/adjustments` page showing tips grouped by area:
  - [x] Klassrumsmiljö och schema
  - [x] Hur du bemöter eleven
  - [x] Ämnesspecifikt material
  - [x] Lektionsstruktur
- [x] API route `GET /api/kids/[id]/adjustments` — derives tips server-side, returns list
- [x] Each tip shows linked material items with links to library

---

### Phase 6 — Material Library
> Goal: curated sample content teachers can be pointed to from adjustments.

**Suggested agent:** `claude-haiku-4-5` (content generation is repetitive and volume-heavy)

- [x] Define material schema: `{ id, title, type, challenges[], subject, url?, description }`
- [x] Seed library with 10 sample entries in Swedish for:
  - [x] Dyslexi: introduktionsfilm, historia (första världskriget), matte (bråk)
  - [x] Autismspektrum: lektionsmall med tydlig struktur, visuellt dagsschema
  - [x] Uppmärksamhetsliknande: korta deluppgifter, rörelsepaus
  - [x] Allmänt: bemötande autismspektrum, minnesstöd, schemainrättning
- [x] Build `/library` page with filter-by-challenge buttons
- [x] API route `GET /api/library` with `?challenge=` and `?subject=` params

---

### Phase 7 — Security & Hardening
> Goal: safe to run locally; ready to extend to multi-user later.

**Suggested agent:** `claude` with `/security-review` skill

- [x] Validate all API route inputs — regex allowlist on all IDs (`/^k\d{3}$/`, `/^diag-\d+$/`, `/^q\d+$/`), diagnosis labels allowlisted, scores clamped 0–3
- [x] Add JSON file write-locking — promise-chain serialises concurrent writes in `lib/db.ts`
- [x] Confirm no sensitive data in client bundles — only typed API calls, no fs imports in client components
- [x] Document migration path in `app/README.md` — swap `lib/db.ts` for Prisma/SQLite, add NextAuth

---

### Phase 8 — Review & Demo
> Goal: walkthrough of the full happy path, fix rough edges.

**Suggested agent:** `claude` with `/verify` skill (Sonnet 4.6)

- [x] Run full walkthrough: select Adam → view profile → run screening → add diagnosis → view adjustments → browse library
- [x] Repeat walkthrough for Beata (dyslexi + autismspektrum — adjustments correctly derived)
- [x] Fix any broken states or missing links — all API responses validated
- [x] Write `README.md` with `npm install && npm run dev` instructions

---

## Subagent Summary

| Phase | Agent type | Model | Reason |
|-------|-----------|-------|--------|
| 0 — Architecture diagrams | `claude` | Opus 4.7 | Full-system reasoning, Mermaid authoring |
| 1 — Scaffold & schema | `claude` | Sonnet 4.6 | Standard coding task |
| 2 — Kid selection & profile | `claude` | Sonnet 4.6 | Standard UI + API |
| 3 — Screening (questionnaire design) | `claude` | Opus 4.7 | Nuanced language, ethical framing |
| 3 — Screening (UI + API) | `claude` | Sonnet 4.6 | Standard coding |
| 4 — Diagnosis module | `claude` | Sonnet 4.6 | Standard coding |
| 5 — Adjustments logic | `claude` | Opus 4.7 | Multi-signal reasoning, ranking logic |
| 6 — Material library content | `claude` | Haiku 4.5 | High-volume content generation in Swedish |
| 7 — Security hardening | `claude` + `/security-review` | Sonnet 4.6 | Code review + input validation |
| 8 — Verify & demo | `claude` + `/verify` | Sonnet 4.6 | Live app walkthrough |

---

## Data Model (sketch)

```json
{
  "kids": [
    {
      "id": "k001",
      "label": "Adam",
      "screenings": [],
      "diagnoses": [],
      "notes": ""
    }
  ],
  "library": []
}
```

Screening result shape:
```json
{
  "id": "scr-001",
  "date": "2026-05-20",
  "traits": ["structure-leaning", "attention-leaning"],
  "raw": { "q1": 3, "q2": 1 }
}
```

Diagnosis shape:
```json
{ "id": "diag-001", "date": "2026-05-20", "label": "dyslexia" }
```
