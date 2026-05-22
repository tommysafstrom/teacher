# Request Handling — Email & Supplier UX Plan

## Feature Overview

Extend the request/supply flow with three capabilities:

1. **Due dates** — requesters set a deadline when creating a request; overdue items get a visual warning everywhere they appear.
2. **Email notifications** — suppliers receive an email when a request is created or a reminder is sent; the email contains a direct link to the relevant form. No auto-login from the link for now — the supplier logs in normally and lands on the right page.
3. **Enhanced supplier form UX** — a persistent left-side navigation listing all assigned kids across all active requests; submitted items show a green checkmark; overdue items are underlined; submitted responses can be reopened for editing.

---

## Working Convention

**Checkboxes must be kept current.** Mark each task `[x]` as soon as it is done. The checkbox state is the single source of truth; do not rely on memory or git history.

---

## Framework

Builds on the existing stack: **Next.js 15 · TypeScript · Tailwind CSS · local JSON via `lib/db.ts`**. Email is sent via **Nodemailer** with an SMTP transport (configured through env vars). No third-party email service required for local dev — a local SMTP stub (e.g. Mailpit) works fine.

---

## Phases

---

### Phase A — Due Date

> Goal: every request carries an optional deadline; all UIs that show requests expose it.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Extend `lib/types.ts`: add `dueDate?: string` (ISO date) to `Request`
- [x] Extend `lib/db.ts`: pass `dueDate` through when creating / reading requests
- [x] Update `POST /api/requests` to accept and persist `dueDate`
- [x] Add a date input to step 3 of `/requester/requests/new` — Swedish label "Sista svarsdatum (valfritt)"
- [x] Show `dueDate` wherever a request is listed:
  - Requester dashboard (`/requester`): display the date; underline the row if today > dueDate
  - Requester detail (`/requester/requests/[id]`): show date in the header; underline if overdue
  - Supplier inbox (`/supplier`): show date per request; underline overdue request cards
  - Supplier form (`/supplier/requests/[requestId]/kids/[kidId]`): show date in the heading if set; underline if overdue

---

### Phase B — Email Notifications

> Goal: suppliers receive an email with a direct form link when they are assigned a request or sent a reminder.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Add Nodemailer as a dependency (`npm install nodemailer @types/nodemailer`)
- [x] Create `lib/email.ts` — `sendMail(to: string, subject: string, html: string)` using `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` env vars; silently no-op if `SMTP_HOST` is unset (keeps local dev functional without email)
- [x] Add `email` field to `User` in `lib/types.ts` and seed realistic addresses in `data/db.json` for all four users
- [x] On `POST /api/requests`: for each assigned supplier, call `sendMail` with:
  - Subject (Swedish): "Ny förfrågan om observation"
  - Body: supplier's name, list of kid labels, due date if set, and one deep-link per kid: `[APP_BASE_URL]/supplier/requests/[id]/kids/[kidId]`
  - One email per supplier (not one per kid)
- [x] On `POST /api/requests/[id]/reminders/[supplierId]`: call `sendMail` with:
  - Subject: "Påminnelse: obesvarad förfrågan"
  - Body: same structure as initial email but labelled as a reminder
- [x] Add `APP_BASE_URL` env var (default `http://localhost:3000`) used to build links
- [x] Document the required env vars in a comment at the top of `lib/email.ts`

---

### Phase C — Enhanced Supplier Form UX

> Goal: the supplier answer form has a persistent left sidebar showing all open work; completed items have a checkmark; overdue items are underlined; a submitted response can be reopened.

**Suggested agent:** `claude` (Sonnet 4.6)

- [x] Restructure `/supplier/requests/[requestId]/kids/[kidId]/page.tsx` into a two-column layout:
  - Left column (sidebar, ~220 px wide, sticky): navigation list (see below)
  - Right column: the existing answer form
- [x] Sidebar contents: fetch all active requests assigned to this supplier; group by request; for each request show its kids as nav items
  - Active item highlighted (current request + kid)
  - Submitted kid: green checkmark (✓) prefix, dimmed label, still clickable for reopen
  - Unstarted kid: no prefix
  - Started but not submitted: faint dot prefix (·) to indicate draft
  - If a request's dueDate has passed: underline the request heading in the sidebar
- [x] Reopen submitted responses:
  - Add "Redigera svar" button on the answer form when `submitted === true`
  - On click: send `PUT` with `{ answers, reopen: true }` — server clears `submittedAt`, updates `lastActivityAt`
  - Update `PUT /api/requests/[id]/responses/[supplierId]/[kidId]` handler: if `reopen: true` is in the body, clear `submittedAt`
  - Form re-enables; show a Swedish notice: "Svaret är återöppnat och kan redigeras"
- [x] Supplier inbox (`/supplier`): replace the text status badges for submitted items with a ✓ prefix on the kid label (keep badge for in-progress/not-started)

---

## Subagent Summary

| Phase | Agent type | Model | Reason |
|-------|-----------|-------|--------|
| A — Due date | `claude` | Sonnet 4.6 | Type + form + multi-page display update |
| B — Email notifications | `claude` | Sonnet 4.6 | New lib + API side-effects |
| C — Supplier form UX | `claude` | Sonnet 4.6 | Layout restructure + reopen logic |

---

## Data Model Changes

```ts
// lib/types.ts additions / changes

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;   // NEW — used for outbound email
}

interface Request {
  id: string;
  requesterId: string;
  kidIds: string[];
  supplierIds: string[];
  note: string;
  dueDate?: string;   // NEW — ISO date, e.g. "2026-06-15"
  createdAt: string;
  status: "active" | "closed";
}

// Response unchanged — reopen is handled by clearing submittedAt server-side
```

### Updated seed users

| ID   | Name                | Role      | Email                         |
|------|---------------------|-----------|-------------------------------|
| u001 | Anna Lindgren       | supplier  | anna.lindgren@skola.example   |
| u002 | Erik Bergström      | supplier  | erik.bergstrom@skola.example  |
| u003 | Sara Holmberg       | supplier  | sara.holmberg@skola.example   |
| u004 | Malin den magnifika | requester | malin@skola.example           |

---

## Environment Variables

```
APP_BASE_URL=http://localhost:3000   # used for deep links in emails
SMTP_HOST=localhost                  # omit to disable email in dev
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```
