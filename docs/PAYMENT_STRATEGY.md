# Payment Management Strategy (Payroll)

This document describes how companies typically handle payroll/payment management, and the strategy for implementing the **payment list** and **Revolut API** integration in the Make It Shine project. It also adds **bank account** to the professional (employee) registration to the planning.

---

## 1. How Companies Handle Payment Management (Payroll)

### 1.1 Typical Payroll Flow

1. **Accumulation period**  
   Companies define a pay period (e.g. weekly, biweekly, monthly). Work done in that period is aggregated per employee.

2. **Calculation**  
   For each employee:
   - Hours worked (from completed jobs/shifts) × rate = **gross amount**
   - Optional: deductions (tax, pension, etc.). For cleaners/contractors this is often just the gross amount.

3. **Payment list / payroll run**  
   A list of employees to be paid with:
   - Name, amount, bank details (for transfer)
   - Status: **pending** → **paid** (and optionally **processing**, **failed**).

4. **Execution**  
   Payments are sent via:
   - **Bank transfer** (BACS in UK, SEPA in EU) – most common for staff/contractors.
   - **Payment providers** (e.g. Revolut Business, Wise, PayPal) – same idea: list of payees + amounts, then “pay” button or batch.

5. **Reconciliation**  
   After payment:
   - Mark as **paid** in the system.
   - Optionally store payment reference, date, and link to bank/Revolut transaction for audit.

### 1.2 What We Need in the App

- **Per professional (employee):**
  - **Bank account details** (account name, sort code, account number for UK; or IBAN/BIC for international) – stored in professional registration.
- **Payment list (payroll run):**
  - Period (e.g. month).
  - Rows: professional name, amount to pay (from completed jobs in period), bank details (easy access), **status** (e.g. pending / paid).
  - **Tick / button** to mark as paid (simulated now; later will call Revolut API).
- **Future:** Integration with **Revolut (bank)** to trigger real payments; the “mark as paid” action will eventually confirm payment via API instead of being manual/simulated.

---

## 2. Add Bank Account to Professional Registration (Planning)

### 2.1 Scope

- Add **bank account** fields to the **professional** entity (cadastro do funcionário).
- Used for: displaying in the payment list and, in the future, sending payment instructions to Revolut.

### 2.2 Suggested Fields (UK-oriented; can extend for IBAN later)

| Field               | Type   | Required | Notes                                      |
|---------------------|--------|----------|--------------------------------------------|
| `accountHolderName` | string | Yes      | Name as on bank account                    |
| `sortCode`          | string | Yes (UK) | Format: 12-34-56 or 123456                 |
| `accountNumber`     | string | Yes (UK) | 8 digits (UK)                              |
| `iban`              | string | No       | Optional, for international                |
| `bic`               | string | No       | Optional, for international                |

- Validation: UK sort code (6 digits) and account number (8 digits); optional IBAN/BIC if we support international later.
- In UI: new section “Bank details” in the professional form (create/edit); optional “Copy” or “View” in payment list for quick access.

### 2.3 Implementation Order (in relation to payment list)

1. **Database:** Add columns to `professionals` (or a `professional_bank_details` table if you prefer to keep PII separate).
2. **Schema & types:** Extend `professionalSchema` and `Professional` type with bank fields.
3. **ProfessionalDialog:** Add form fields for bank details.
4. **Supabase service / API:** Read/write new fields; ensure RLS and permissions are correct.

This should be done **before** or **in parallel with** the payment list so the list can show and use bank data.

---

## 3. Payment List (Lista de Pagamentos) – Strategy

### 3.1 Purpose

- One screen (or section) that shows **employees to be paid** for a chosen period.
- Columns: professional name, amount to pay, bank details (or easy access), status (e.g. pending/paid), and a **tick/button to mark as paid** (simulated for now).

### 3.2 Data Model

- **Source of amounts:** Completed jobs in the selected period.  
  For each professional:  
  `amount = sum(job.cost)` for jobs with `status = 'completed'` and `job.date` in the period.
- **Status:** We need a place to store “paid” per professional per period. Two options:

  **Option A – Payment run table (recommended)**  
  - New table: `payment_runs` (e.g. `id`, `period_start`, `period_end`, `created_at`, `created_by`).  
  - New table: `payment_run_items` (e.g. `id`, `payment_run_id`, `professional_id`, `amount`, `status` ['pending' | 'paid'], `paid_at`, `external_reference` for future Revolut id).  
  - One “run” per period (e.g. monthly). User can “Create payment run” for a month, then mark items as paid.  
  - Pros: clear history, audit trail, matches how companies do payroll runs.

  **Option B – Simpler: no run table**  
  - Only derive amounts from jobs; store “paid” in a small table like `professional_period_payments` (`professional_id`, `period_start`, `period_end`, `paid_at`).  
  - Pros: simpler. Cons: less like a formal “run” and harder to attach Revolut batch id later.

**Recommendation:** Option A (payment_runs + payment_run_items) for clarity and future Revolut integration (one batch = one run).

### 3.3 UI / UX

- **Location:** Under **Finance** (e.g. tab “Payment list” or “Payroll”) or a dedicated “Payments” page; link from sidebar.
- **Period selector:** e.g. month (same idea as current Finance page).
- **Actions:**
  - “Create payment run” (or “Generate list”) for the selected period: computes amounts from completed jobs, creates `payment_run` + `payment_run_items` (all pending).
  - List shows: Professional name, amount, bank details (expandable or “View” to avoid clutter), status, **Mark as paid** (tick/button).
- **Mark as paid:**  
  - **Now:** Simulated – only update status to `paid` and set `paid_at` (and optionally show a toast “Simulated; Revolut integration coming later”).  
  - **Later:** Call Revolut API to create transfer, then on success update status and store `external_reference`.

### 3.4 Easy Access to Bank Data

- In the payment list row: “View bank details” or a small expand/collapse to show account holder, sort code, account number (masked if needed).
- Optional: “Copy sort code + account number” for pasting into online banking.
- Bank data comes from the professional’s registration (section 2).

---

## 4. Revolut API Integration (Future)

- **Now:** “Mark as paid” is **simulated** (only updates DB; no external API).
- **Later:** When integrating Revolut:
  - Use Revolut Business API (or equivalent) to create transfers/payouts.
  - On “Mark as paid” (or “Pay selected”): call API with amount + beneficiary bank details (from professional); on success set status to `paid` and store Revolut transaction/reference in `payment_run_items`.
- Design the **payment_run_items** table with an `external_reference` (or similar) field so we can store Revolut payout id and support idempotency/retries.

---

## 5. Implementation Order Summary

| Order | Item                                      | Dependencies                    |
|-------|-------------------------------------------|---------------------------------|
| 1     | Add bank account to professional (DB + schema + form) | None                            |
| 2     | Payment runs: DB tables + API + “Create run” logic    | Jobs, professionals (with bank) |
| 3     | Payment list UI: list, period, “Mark as paid” (simulated) | Payment runs API                 |
| 4     | (Later) Revolut API: real “Mark as paid”               | Payment list, Revolut credentials|

---

## 6. Checklist for Planning

- [x] Bank account in professional registration (added to this strategy).
- [x] Payment list: employees to pay, amounts, tick to set status to paid.
- [x] Easy access to bank data from the list.
- [x] Revolut integration: simulated for now; real integration later.
- [x] Implementation order and data model (payment_runs + payment_run_items) defined.

This strategy can be used to update the main implementation order document (e.g. `IMPLEMENTATION_ORDER.md`) so that “Bank account for professionals” and “Payment list / payroll” are explicit phases after the current Supabase + Invoice work.
