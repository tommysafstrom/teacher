# Request & Supply Module — Implementation Plan

## Feature Overview

Extend the teacher support tool with a two-role collaboration model:

- **Suppliers** — teachers who are asked to observe and report on specific kids.
- **Requesters** — coordinators who assign observation tasks to suppliers, monitor progress, and consolidate answers.

There are three supplier teachers (**Anna Lindgren**, **Erik Bergström**, **Sara Holmberg**) and one requester (**Malin den magnifika**). The requester can target any combination of kids and suppliers in a single request. Suppliers fill in their observations kid-by-kid, and the requester can see all responses side-by-side, track reminder history, and watch live supplier activity.

All user-facing text (labels, buttons, headings, status messages) must be in **Swedish**. The codebase (variable names, file names, comments) stays in **English**.

---

## Working Convention

**Checkboxes must be kept current.** Mark each task `[x]` as soon as it is done — not at the end of a phase. Any agent or developer working from this plan is required to update the relevant checkbox before moving on to the next task. The checkbox state is the single source of truth for what is complete; do not rely on memory or git history to infer progress.

---

## Framework

Builds on the existing stack: **Next.js 15 · TypeScript · Tailwind CSS · local JSON file** via `lib/db.ts`. No authentication framework needed — users select their identity from a list on first visit (stored in `localStorage` / a session cookie). This keeps the local-tool feel while enabling per-user views.

---

## Phases

---

### Phase 0 — Architecture & Data-Model Update
> Goal: extend the documentation diagrams to cover the new entities before writing code.

**Suggested agent:** `claude` (Opus 4.7 — cross-entity reasoning)

- [x] Update `documentation/data-model.md` — add ER diagram sections for:
  - `USER` (id, name, role: supplier | requester)
  - `REQUEST` (id, requesterId, kidIds[], supplierIds[], createdAt, status)
  - `RESPONSE` (id, requestId, supplierId, kidId, answers{}, submittedAt, lastActivityAt)
  - `REMINDER` (id, requestId, supplierId, sentAt)
  - Relationships: REQUEST →many RESPONSE, REQUEST →many REMINDER, USER →many REQUEST
- [x] Update `documentation/architecture.md` — add new pages and API routes to the diagram
- [x] Update `documentation/flow-teacher.md` — add supplier flow and requester flow as separate swim-lanes
- [x] Verify diagrams are internally consistent before proceeding

---

### Phase 1 — User Model & Identity Selection
> Goal: users can pick who they are; the app remembers the choice for the session.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Extend `lib/types.ts`:
  - `User { id, name, role: "supplier" | "requester" }`
  - `DB.users: User[]`
- [x] Extend `lib/db.ts` read/write helpers to handle `users`
- [x] Seed `data/db.json` with the four named users:
  - `u001` — Anna Lindgren (supplier)
  - `u002` — Erik Bergström (supplier)
  - `u003` — Sara Holmberg (supplier)
  - `u004` — Malin den magnifika (requester)
- [x] Build `/login` page — Swedish heading "Vem är du?", card grid of all four users; clicking one sets a session cookie `userId=uXXX` and redirects to the appropriate dashboard
- [x] Add middleware (`middleware.ts`) that reads `userId` cookie and redirects unauthenticated visitors to `/login`
- [x] API route `GET /api/users` — returns all users (used by the login page)

---

### Phase 2 — Seed Data Expansion
> Goal: enough kids in the database for realistic requester workflows.

**Suggested agent:** `claude` (Haiku 4.5 — repetitive content generation)

- [x] Add ten more kids to `data/db.json` (keeping existing k001 Adam and k002 Beata):
  - `k003` Carl · `k004` Diana · `k005` Emil · `k006` Fanny
  - `k007` Gustav · `k008` Hanna · `k009` Ivan · `k010` Julia
  - `k011` Karin · `k012` Ludvig
- [x] Each new kid starts with empty screenings and diagnoses
- [x] Verify dev server still boots cleanly after the seed expansion

---

### Phase 3 — Request Data Model & API
> Goal: the database can store requests, responses, and reminders; API routes expose them.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Extend `lib/types.ts`:
  - `Request { id, requesterId, kidIds, supplierIds, note, createdAt, status: "active"|"closed" }`
  - `Response { id, requestId, supplierId, kidId, answers: Record<string,string>, submittedAt?: string, lastActivityAt: string }`
  - `Reminder { id, requestId, supplierId, sentAt: string }`
  - `DB.requests`, `DB.responses`, `DB.reminders`
- [x] Extend `lib/db.ts` with helpers for all three new collections
- [x] API routes:
  - `POST /api/requests` — create a new request (validate kidIds, supplierIds)
  - `GET /api/requests` — list requests visible to the current user (requester sees all; supplier sees only their own)
  - `GET /api/requests/[id]` — full request detail including all responses and reminders
  - `DELETE /api/requests/[id]` — requester only; marks request closed (does not delete history)
  - `DELETE /api/requests/[id]/suppliers/[supplierId]` — remove one supplier assignment from a request
  - `PUT /api/requests/[id]/responses/[supplierId]/[kidId]` — supplier saves (partial or final) answers; sets `lastActivityAt`, optionally `submittedAt`
  - `GET /api/requests/[id]/responses/[supplierId]/[kidId]` — load saved answers (for draft restore)
  - `POST /api/requests/[id]/reminders/[supplierId]` — record a reminder sent to a supplier

---

### Phase 4 — Requester Dashboard & Request Creation
> Goal: Malin can create requests, see their status, and manage assignments.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Build `/requester` page — requester's main dashboard:
  - List of all active requests with: creation date, number of kids, list of assigned suppliers, how many responses submitted vs. expected
  - Per-supplier: badge showing submitted / in-progress / not-started status
  - "Skapa ny förfrågan" button
  - "Ta bort tilldelning" (remove supplier from request) per supplier row
  - "Stäng förfrågan" button per request
- [x] Build `/requester/requests/new` page — multi-step form:
  - Step 1: select one or more kids (checkbox grid, Swedish labels)
  - Step 2: select one or more suppliers (checkbox grid with names)
  - Step 3: optional note in Swedish; confirm and submit
  - On submit: POST to `/api/requests`, redirect to `/requester`
- [x] Build `/requester/requests/[id]` page — consolidated answer view:
  - For each kid in the request: a column per supplier showing their submitted answers (or "ej svar ännu")
  - Activity log: who last saved, when, whether submitted or draft
  - Reminder panel: per supplier, shows first-sent date and count of reminders; "Skicka påminnelse" button (calls `POST /api/requests/[id]/reminders/[supplierId]`)

---

### Phase 5 — Supplier Dashboard & Answer Form
> Goal: suppliers can see their assigned requests and fill in observations per kid.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Build `/supplier` page — supplier's inbox:
  - List of active requests assigned to this supplier
  - Per request: list of kids with status (ej påbörjad / påbörjad / inskickad)
  - Link to the answer form for each kid
- [x] Build `/supplier/requests/[requestId]/kids/[kidId]` page — answer form:
  - Swedish heading showing the kid's label and the request note
  - The form is the **Skolkompassen questionnaire** (same as `/kids/[id]/screen`) — all 97 checkbox items grouped by area and sub-area with colour-coded field borders
  - "Spara utkast" button — PUT to response with `{ answers: { q1: "false", q2: "true", … } }` (checkbox state as string booleans); no `submittedAt`; updates `lastActivityAt`
  - "Skicka in" button — first POSTs to `/api/kids/[kidId]/screenings` to create the actual Screening record, then PUTs to the response with `{ submit: true, answers: { screeningId, traits } }` to mark submitted
  - On load: restore checkbox state from the draft response if it exists and has no `screeningId`
  - "Vad andra har svarat" panel — shows traits from other suppliers' submitted screenings (read from `answers.traits` on submitted responses)

---

### Phase 6 — Live Activity Visibility
> Goal: requester can see whether a supplier has started but not submitted.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] In the requester's consolidated view (`/requester/requests/[id]`), add status indicators derived from `Response.lastActivityAt` vs `Response.submittedAt`:
  - "Ej påbörjad" — no response record exists
  - "Påbörjad (ej inskickad)" — `lastActivityAt` set but `submittedAt` null
  - "Inskickad" — `submittedAt` set
- [x] Add a last-activity timestamp next to each in-progress indicator so the requester can see exactly when the supplier last touched the form
- [x] Requester dashboard (`/requester`) shows the same three-state badge at the request-list level for a quick overview

---

### Phase 7 — Reminder Scheduling
> Goal: requester can log reminders and see reminder history per supplier per request.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] In `/requester/requests/[id]`, the reminder panel per supplier shows:
  - Date of first reminder sent (or "Inga påminnelser skickade" if none)
  - Total count of reminders sent
  - "Skicka påminnelse" button — creates a `Reminder` record via POST; the button is disabled if the supplier has already submitted
- [x] API `GET /api/requests/[id]` includes `reminders[]` in the response so the page can derive counts client-side
- [x] (No actual email sending — the reminder is a logged event. The requester uses this record to track manual outreach.)

---

### Phase 8 — Navigation & Role Routing
> Goal: clean navigation that adapts to the logged-in role.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Add a persistent top nav bar to `app/layout.tsx`:
  - Shows current user's name
  - Role-appropriate links: requester → "Förfrågningar" + existing tool links; supplier → "Mina förfrågningar" + existing tool links
  - "Byt användare" link → `/login`
- [x] Ensure existing `/`, `/kids/[id]/*`, and `/library` pages still work for both roles (they are shared utilities)
- [x] Supplier pages redirect to `/login` if accessed by a requester, and vice versa

---

### Phase 9 — Security & Hardening
> Goal: input validation on all new routes; no privilege escalation.

**Suggested agent:** `claude` with `/security-review` skill

- [x] Validate `userId` cookie on every new API route — reject mismatched roles (supplier cannot POST to `/api/requests`, requester cannot PUT to response routes)
- [x] Allowlist `kidId` pattern `/^k\d{3}$/`, `userId` pattern `/^u\d{3}$/`, `requestId` pattern `/^req-\d+$/`, `supplierId` same as userId
- [x] Clamp and sanitise free-text answer fields (max 2000 chars per field, trim whitespace)
- [x] Confirm write-lock in `lib/db.ts` covers all new collections

---

### Phase 10 — Review & Demo
> Goal: full walkthrough of both role flows, fix rough edges.

**Suggested agent:** `claude` with `/verify` skill (Sonnet 4.6)

- [ ] Requester flow: log in as Malin → create request for 3 kids → assign 2 suppliers → view request detail
- [ ] Supplier flow: log in as Anna → see incoming request → fill in answers for kid 1 → save draft → submit → fill in kid 2
- [ ] Back to requester: see Anna's submitted answers, see Erik's in-progress status, send Erik a reminder
- [ ] Remove Erik's assignment from the request; verify his partial response is retained in history
- [ ] Repeat key paths for Sara Holmberg as the third supplier
- [ ] Fix any broken states, missing translations, or stale UI after actions

> **Note:** `node` is not available in the current shell environment — the live walkthrough requires running `npm run dev` manually. Use `/verify` once Node is available.

---

## Subagent Summary

| Phase | Agent type | Model | Reason |
|-------|-----------|-------|--------|
| 0 — Diagram update | `claude` | Opus 4.7 | Cross-entity reasoning, consistent Mermaid authoring |
| 1 — User model & login | `claude` | Sonnet 4.6 | Standard coding + middleware |
| 2 — Seed data | `claude` | Haiku 4.5 | Repetitive JSON generation |
| 3 — Request API | `claude` | Sonnet 4.6 | Standard CRUD routes |
| 4 — Requester dashboard | `claude` | Sonnet 4.6 | Standard UI + multi-step form |
| 5 — Supplier form | `claude` | Sonnet 4.6 | Standard UI + draft/submit pattern |
| 6 — Activity visibility | `claude` | Sonnet 4.6 | Derived state, status badges |
| 7 — Reminder scheduling | `claude` | Sonnet 4.6 | Append-only log + UI |
| 8 — Navigation & routing | `claude` | Sonnet 4.6 | Layout + role guards |
| 9 — Security hardening | `claude` + `/security-review` | Sonnet 4.6 | Input validation + role checks |
| 10 — Verify & demo | `claude` + `/verify` | Sonnet 4.6 | Live app walkthrough |

---

## Data Model (additions to existing DB)

```ts
// New types — added to lib/types.ts
type UserRole = "supplier" | "requester";

interface User {
  id: string;         // "u001"
  name: string;       // "Anna Lindgren"
  role: UserRole;
}

interface Request {
  id: string;         // "req-001"
  requesterId: string;
  kidIds: string[];
  supplierIds: string[];
  note: string;
  createdAt: string;  // ISO datetime
  status: "active" | "closed";
}

interface Response {
  id: string;          // "resp-001"
  requestId: string;
  supplierId: string;
  kidId: string;
  answers: Record<string, string>;  // field label → free text
  submittedAt?: string;             // null = draft
  lastActivityAt: string;
}

interface Reminder {
  id: string;          // "rem-001"
  requestId: string;
  supplierId: string;
  sentAt: string;
}

// Extended DB
interface DB {
  kids: Kid[];
  library: Material[];
  users: User[];
  requests: Request[];
  responses: Response[];
  reminders: Reminder[];
}
```

### Seeded users

| ID   | Name              | Role      |
|------|-------------------|-----------|
| u001 | Anna Lindgren     | supplier  |
| u002 | Erik Bergström    | supplier  |
| u003 | Sara Holmberg     | supplier  |
| u004 | Malin den magnifika | requester |

### Kids after seed expansion (12 total)

| ID   | Label  | ID   | Label  |
|------|--------|------|--------|
| k001 | Adam   | k007 | Gustav |
| k002 | Beata  | k008 | Hanna  |
| k003 | Carl   | k009 | Ivan   |
| k004 | Diana  | k010 | Julia  |
| k005 | Emil   | k011 | Karin  |
| k006 | Fanny  | k012 | Ludvig |
