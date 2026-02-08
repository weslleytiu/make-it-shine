# Quotes strategy — landing to dashboard

## Goal

Quotes from the landing page contact form appear in the **Dashboard**, where you can **approve** them and **assign a cleaner** (professional).

## Flow

1. **Landing page** — Visitor submits "Get Your Free Quote". Data is saved in Supabase table `quotes` with `status: pending`.
2. **Dashboard** — Card "Quotes to approve" shows the number of pending quotes. Table lists:
   - Pending quotes + approved quotes that don’t have a cleaner yet.
   - For each row: contact (name, email, phone), service type, postcode, status, **Assign cleaner** (dropdown), and **Approve** / **Reject** (only for pending).
3. **Actions**
   - **Approve** — Sets `status` to `approved`. Row stays until a cleaner is assigned.
   - **Reject** — Sets `status` to `rejected`. Row is removed from the table (only pending/approved-without-cleaner are shown).
   - **Assign cleaner** — Sets `professional_id` on the quote. Optional later: "Convert to client & job" to create a Client and Job from the quote.

## Data

- **Table:** `quotes` (see `docs/quotes_migration.sql`). Run that migration in Supabase after the main schema.
- **Types:** `Quote` and related in `src/types/landing.ts`.
- **API:** `api.getQuotes()`, `api.createQuote()`, `api.updateQuote()`.
- **Hooks:** `useQuotes()`, `useCreateQuote()`, `useUpdateQuote()`.

## Optional next steps

- **Convert to client** — Button "Convert to client & job": create a Client from quote (name, email, phone, postcode, type from service), then create a Job with the assigned professional and link to the new client.
- **Quotes page** — Dedicated page under `/dashboard/quotes` with filters (pending / approved / rejected) and full list.
