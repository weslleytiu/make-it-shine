# Invoice Process

This document describes the **business process** for creating and managing invoices in the CRM. For technical implementation details, see [INVOICE_IMPLEMENTATION_PROPOSAL.md](./INVOICE_IMPLEMENTATION_PROPOSAL.md).

---

## 1. Overview

- **Invoice** = a bill grouping one or more **completed jobs** for a **client**, with a billing period, totals, and payment status.
- Each client has **invoice settings** (frequency, auto/manual, due date rules).
- Jobs are only included in invoices when their status is **completed**.

---

## 2. Invoice lifecycle (statuses)

| Status     | Meaning |
|-----------|--------|
| **draft** | Being built; jobs can still be added or removed. Not sent to client. |
| **pending** | Sent to client; awaiting payment. No further edits (or only minor notes). |
| **paid**  | Payment received; closed. |
| **overdue** | Due date passed and still not paid (can be derived from due date + pending). |
| **cancelled** | Invoice voided; not to be paid. |

**Flow:** `draft` → `pending` → `paid`  
Optional: `draft`/`pending` → `cancelled`. `overdue` is a state of `pending` (e.g. due date &lt; today).

---

## 3. When an invoice is created

### 3.1 By client configuration

Each client has:

- **Invoice frequency**
  - **per_job** – One invoice per completed job (invoice created as soon as the job is completed).
  - **weekly** – One invoice per week; all jobs completed in that week are grouped.
  - **biweekly** – One invoice per two-week period.
  - **monthly** – One invoice per month (default).
  - **manual** – Invoices are only created when the user explicitly creates them (no auto-creation).

- **Auto-generate**
  - If **on**: system can create/update draft invoices automatically (e.g. when a job is completed, or on a scheduled day for weekly/monthly).
  - If **off**: invoices are only created manually by the user.

- **Generation day** (for weekly/monthly)
  - **Monthly**: e.g. “day 5 of the month” – used to know when to consider the previous period closed and the invoice ready to send.
  - **Weekly**: e.g. “Mondays” – same idea for weekly periods.

### 3.2 Process by frequency

1. **per_job**
   - When a job is marked **completed** → create one new invoice containing only that job (if auto-generate is on).
   - Invoice can stay in **draft** until the user sends it.

2. **weekly / biweekly / monthly**
   - When a job is marked **completed** → add it to the **draft** invoice for the **current period** for that client (create the draft if it doesn’t exist), if auto-generate is on.
   - “Current period” is defined by the client’s frequency and generation day (e.g. “February 2025” for monthly; “week of 3–9 Feb” for weekly).
   - On the **generation day**, the system can treat the period as closed and the draft as ready to be sent (user can still review before sending).

3. **manual**
   - No automatic creation. User opens “Create invoice” for a client, chooses period (and optionally which completed jobs to include), and the system creates a draft.

---

## 4. What goes into an invoice

- Only jobs with status **completed**.
- Only jobs that are **not yet linked** to any other invoice (each job belongs to at most one invoice).
- Optionally filter by **period** (period start/end) so the invoice reflects only jobs in that range.
- **Totals**: subtotal = sum of jobs’ `totalPrice`; tax (if any); total = subtotal + tax.

---

## 5. User actions (process steps)

| Step | Action | Result |
|------|--------|--------|
| 1 | **Create invoice** (manual or review auto-created draft) | New or existing invoice in **draft**. |
| 2 | **Add/remove jobs** (only in draft) | Invoice lines and totals updated. |
| 3 | **Send invoice** | Status: draft → **pending**. Optionally set due date when sending. |
| 4 | **Mark as paid** | Status: pending → **paid**. Optionally record payment date. |
| 5 | **Cancel invoice** | Status → **cancelled**. Jobs can be released to be included in another invoice (business rule to confirm). |

Optional future actions: edit due date, add notes, export PDF, etc.

---

## 6. Invoice numbering and dates

- **Invoice number**: Unique, e.g. `INV-2025-001`, `INV-2025-002` (year + sequence).
- **Period**: `periodStart` and `periodEnd` (e.g. 1 Feb 2025 – 28 Feb 2025 for monthly).
- **Issue date**: When the invoice is sent (draft → pending); can default to “today”.
- **Due date**: Payment deadline; e.g. issue date + 30 days (configurable per client or global default).

---

## 7. Edge cases and rules

- **Job completed after period end**: Include in the **next** period’s invoice (next week/month), not in the previous one.
- **Job cancelled after being on an invoice**: Define policy (e.g. allow only draft edits; if already sent, credit note or manual adjustment).
- **Two drafts for same client/period**: Avoid; when creating or auto-adding, reuse the existing draft for that client and period.
- **Overdue**: Any invoice with status **pending** and `dueDate < today` is considered **overdue** (can be shown as a separate state or filter).

---

## 8. Summary flow (high level)

1. **Jobs are completed** → according to client settings, they are either added to a draft (weekly/monthly) or create a new invoice (per_job), or nothing (manual).
2. **User reviews drafts** → can add/remove jobs, then **send** → status **pending**.
3. **User marks payment** → status **paid**.
4. **Optional**: cancel draft or pending invoice → **cancelled**.

This process document should stay aligned with the product; the [implementation proposal](./INVOICE_IMPLEMENTATION_PROPOSAL.md) describes how to build it in the system.
