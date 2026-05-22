# Email Supplier Notifications — Implementation Plan

## Feature Overview

Wire up real outbound email for the request/supply flow:

1. **Supplier email config** — a dedicated `data/supplier-emails.json` maps each supplierId to an email address; all suppliers currently point to the same test inbox (`tommy.safstrom@gmail.com`).
2. **Personalised subjects** — every email sent to a supplier is prefixed with the supplier's first name so the recipient can distinguish emails at a glance in a shared inbox (e.g. `Anna: Ny förfrågan om observation`).
3. **Actual SMTP sending** — configure nodemailer to send through Gmail SMTP (env vars in `.env.local`); email is still silently skipped when `SMTP_HOST` is unset so local dev without credentials stays functional.

---

## Working Convention

**Checkboxes must be kept current.** Mark each task `[x]` as soon as it is done. The checkbox state is the single source of truth; do not rely on memory or git history.

---

## Framework

Builds on the existing stack: **Next.js 16 · TypeScript · Tailwind CSS · Nodemailer · local JSON via `lib/db.ts`**. Email transport is nodemailer configured through env vars. Gmail SMTP is the recommended transport for real delivery; a local SMTP stub (e.g. Mailpit) works for dev.

---

## Phases

---

### Phase A — Supplier Email Config File

> Goal: supplier email addresses live in a dedicated JSON file, separate from the user roster in `db.json`.

- [x] Create `app/data/supplier-emails.json` — object mapping supplierId → email address:
  ```json
  {
    "u001": "tommy.safstrom@gmail.com",
    "u002": "tommy.safstrom@gmail.com",
    "u003": "tommy.safstrom@gmail.com"
  }
  ```
- [x] Export `getSupplierEmail(supplierId: string): string | undefined` from `lib/email.ts` — reads from the JSON file; returns `undefined` if supplierId is not in the map
- [x] Update `POST /api/requests` — replace `supplier.email` lookup (from db.json User) with `getSupplierEmail(supplierId)`; skip if undefined
- [x] Update `POST /api/requests/[id]/reminders/[supplierId]` — same replacement

---

### Phase B — Personalised Subject Prefix

> Goal: every email subject is prefixed with the supplier's first name so a shared test inbox can distinguish which "person" the email is for.

- [x] In `buildRequestEmail` in `lib/email.ts`: extract the first word of `supplierName` as `firstName`
- [x] Prepend `"${firstName}: "` to the subject string in both the request and reminder cases
  - New request: `Anna: Ny förfrågan om observation`
  - Reminder: `Anna: Påminnelse: obesvarad förfrågan om observation`

---

### Phase C — Gmail SMTP Configuration

> Goal: real email is sent through Gmail SMTP when credentials are present in `.env.local`.

- [x] Create `.env.local.example` at the project root documenting the required env vars:
  ```
  APP_BASE_URL=http://localhost:3000
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=tommy.safstrom@gmail.com
  SMTP_PASS=                        # Gmail App Password (not your account password)
  ```
- [x] Update `from` address in `sendMail` to use `process.env.SMTP_USER` when set, falling back to `noreply@skola.example`
- [x] Verify the existing nodemailer transport (`STARTTLS` on port 587 with `auth: { user, pass }`) is correct for Gmail — it is; no transport changes needed

---

## Subagent Summary

| Phase | Agent | Reason |
|-------|-------|--------|
| A — Email config file | `claude` Sonnet 4.6 | New JSON file + helper + two API route patches |
| B — Subject prefix | `claude` Sonnet 4.6 | Single function edit in `lib/email.ts` |
| C — SMTP config | `claude` Sonnet 4.6 | Env var doc + `from` address fix |

---

## Environment Variables

```
APP_BASE_URL=http://localhost:3000   # base URL for deep links in emails
SMTP_HOST=smtp.gmail.com            # omit to disable email entirely
SMTP_PORT=587
SMTP_USER=tommy.safstrom@gmail.com  # also used as the From address
SMTP_PASS=                          # Gmail App Password
```

> To generate a Gmail App Password: Google Account → Security → 2-Step Verification → App passwords. Create one named "teacher-tool" and paste it here.

---

## Files Changed

| File | Change |
|------|--------|
| `app/data/supplier-emails.json` | **new** — supplierId → email map |
| `app/lib/email.ts` | add `getSupplierEmail`, subject prefix, `from` fix |
| `app/app/api/requests/route.ts` | use `getSupplierEmail` |
| `app/app/api/requests/[id]/reminders/[supplierId]/route.ts` | use `getSupplierEmail` |
| `.env.local.example` | **new** — Gmail SMTP documentation |
