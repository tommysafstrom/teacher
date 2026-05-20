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

- [ ] Create `documentation/architecture.md` — system architecture diagram in Mermaid covering:
  - [ ] Browser → Next.js pages → API routes → `lib/db.ts` → `data/db.json`
  - [ ] Folder structure overview (pages, API, lib, data, documentation)
- [ ] Create `documentation/flow-teacher.md` — user flow diagram in Mermaid covering:
  - [ ] Start → välj elev → elevprofil
  - [ ] Elevprofil → Kartlägg → frågeformulär → spara resultat → tillbaka till profil
  - [ ] Elevprofil → Diagnos → lägg till/ta bort diagnos → tillbaka till profil
  - [ ] Elevprofil → Anpassningar → visa rangordnade tips → länk till materialbibliotek
  - [ ] Materialbibliotek → filtrera på utmaning/ämne
- [ ] Create `documentation/data-model.md` — entity-relationship diagram in Mermaid covering:
  - [ ] Kid ↔ Screening (1:many)
  - [ ] Kid ↔ Diagnosis (1:many)
  - [ ] Diagnosis + Screening traits → Adjustments (derived, not stored)
  - [ ] Adjustment → Material (many:many via challenge tag)
- [ ] Review all three diagrams together and verify they are consistent with the plan before proceeding to Phase 1

---

### Phase 1 — Foundation & Data Model
> Goal: empty project that boots, with an agreed-upon JSON schema for all data.

**Suggested agent:** `claude` (Sonnet 4.6)

- [ ] Scaffold Next.js project with TypeScript and Tailwind CSS
- [ ] Define JSON schema: kids, screenings, diagnoses, adjustments, material library
- [ ] Create seed file `data/db.json` with two kids: Adam (id: `k001`) and Beata (id: `k002`)
- [ ] Implement `lib/db.ts` — typed read/write helpers for the JSON file
- [ ] Verify dev server starts and API routes can read/write the JSON file

---

### Phase 2 — Kid Selection & Profile
> Goal: teacher can pick a kid and see their profile card.

**Suggested agent:** `claude` (Sonnet 4.6)

- [ ] Build `/` page: kid selector showing display labels in Swedish (not real names, just "Elev A / Elev B" or configurable labels)
- [ ] Build `/kids/[id]` page: profile view showing
  - [ ] Kid's label and ID
  - [ ] Summary of active screenings
  - [ ] Summary of diagnoses
  - [ ] Quick-access buttons in Swedish: "Kartlägg" · "Diagnos" · "Anpassningar"
- [ ] API route `GET /api/kids/[id]` returning full kid record

---

### Phase 3 — Screening Module
> Goal: teacher can run a structured questionnaire to learn more about the kid.

**Suggested agent:** `claude` (Sonnet 4.6) for UI + `claude-opus-4-7` for questionnaire design

- [ ] Design screening questionnaire format (categories, questions, scoring logic) — use Opus for nuanced phrasing in Swedish with "-liknande" language (e.g. "uppmärksamhetsliknande", "strukturliknande"), never medical diagnoses
- [ ] Build `/kids/[id]/screen` page with step-by-step questionnaire UI
- [ ] API route `POST /api/kids/[id]/screenings` — saves result to JSON file
- [ ] Display past screening results on profile page (date, summary)
- [ ] Ensure all result labels use neutral, non-clinical Swedish (e.g. "uppmärksamhetsliknande", "strukturliknande")

---

### Phase 4 — Diagnosis Module
> Goal: teacher can record a formal diagnosis and see relevant material.

**Suggested agent:** `claude` (Sonnet 4.6)

- [ ] Build `/kids/[id]/diagnose` page — form to add/remove diagnoses (e.g. dyslexia, autism spectrum, ADHD)
- [ ] API route `POST /api/kids/[id]/diagnoses` — saves to JSON
- [ ] Link each diagnosis to the material library (Phase 6) so tips appear immediately after saving
- [ ] Display active diagnoses on profile with edit capability

---

### Phase 5 — Adjustments Module
> Goal: teacher sees a unified, prioritised list of practical tips derived from screenings + diagnoses.

**Suggested agent:** `claude-opus-4-7` (reasoning-heavy — merging multiple signals into ranked tips)

- [ ] Design adjustment-derivation logic: merge screening traits + diagnoses → ranked tip list
- [ ] Build `/kids/[id]/adjustments` page showing tips grouped by area (all headings and tips in Swedish):
  - [ ] Klassrumsmiljö och schema
  - [ ] Hur du bemöter eleven
  - [ ] Ämnesspecifikt material
  - [ ] Lektionsstruktur
- [ ] API route `GET /api/kids/[id]/adjustments` — runs derivation server-side and returns tip list
- [ ] Each tip links to relevant material in the library

---

### Phase 6 — Material Library
> Goal: curated sample content teachers can be pointed to from adjustments.

**Suggested agent:** `claude-haiku-4-5` (content generation is repetitive and volume-heavy)

- [ ] Define material schema: `{ id, title, type, challenge, subject, url | description }`
- [ ] Seed library with sample entries in Swedish for:
  - [ ] Dyslexi: videotips för historia (första världskriget), matte (bråk)
  - [ ] Autismspektrum: strukturerade lektionsmallar, visuella schemaexempel
  - [ ] Uppmärksamhetsliknande: korta deluppgifter, rörelsepauser
  - [ ] Allmänt: hur du bemöter eleven, schemainrättning
- [ ] Build `/library` page with filter by challenge and subject
- [ ] API route `GET /api/library` with query params for filtering

---

### Phase 7 — Security & Hardening
> Goal: safe to run locally; ready to extend to multi-user later.

**Suggested agent:** `claude` with `/security-review` skill

- [ ] Validate all API route inputs (no path traversal in kid IDs, no raw user strings written to JSON without sanitisation)
- [ ] Add JSON file write-locking (prevent concurrent writes corrupting the file)
- [ ] Confirm no sensitive data leaks in client-side JS bundles
- [ ] Document what would need to change to move from JSON file to a real DB

---

### Phase 8 — Review & Demo
> Goal: walkthrough of the full happy path, fix rough edges.

**Suggested agent:** `claude` with `/verify` skill (Sonnet 4.6)

- [ ] Run full walkthrough: select Adam → view profile → run screening → add diagnosis → view adjustments → browse library
- [ ] Repeat walkthrough for Beata
- [ ] Fix any broken states or missing links
- [ ] Write `README.md` with `npm install && npm run dev` instructions

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
