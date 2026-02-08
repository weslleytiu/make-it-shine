# Service Types Strategy (Regular vs Deep Clean)

This document describes how the system handles **different hourly rates** for **Regular** vs **Deep clean** services: client billing (revenue) and professional cost (payroll).

---

## 1. Business Rule

- **Regular clean:** Use the client’s standard price per hour and the professional’s standard rate per hour.
- **Deep clean:** Use the client’s **deep clean price per hour** (if set) and the professional’s **deep clean rate per hour** (if set). If not set, fall back to the regular rate.

So:
- **Revenue (totalPrice)** = `durationHours × clientEffectiveRate`
- **Cost** = `durationHours × professionalEffectiveRate`

Where the effective rates depend on the job’s **service kind** and the optional deep-clean rates on client and professional.

---

## 2. Data Model

### 2.1 Client

| Field | Type | Notes |
|-------|------|--------|
| `pricePerHour` | number | Standard price per hour (existing). |
| `deepCleanPricePerHour` | number \| null | Optional. Price per hour for deep clean. If null, deep clean jobs use `pricePerHour`. |

### 2.2 Professional

| Field | Type | Notes |
|-------|------|--------|
| `ratePerHour` | number | Standard rate per hour (existing). |
| `deepCleanRatePerHour` | number \| null | Optional. Rate per hour for deep clean. If null, deep clean jobs use `ratePerHour`. |

### 2.3 Job

| Field | Type | Notes |
|-------|------|--------|
| `serviceKind` | `"regular"` \| `"deep_clean"` | Which service type this job is. Default `"regular"`. |

Existing jobs without `service_kind` are treated as `"regular"`.

---

## 3. Calculation Rules

- **Client effective rate (for totalPrice):**
  - If `job.serviceKind === "deep_clean"` and `client.deepCleanPricePerHour != null` → use `client.deepCleanPricePerHour`
  - Else → use `client.pricePerHour`

- **Professional effective rate (for cost):**
  - If `job.serviceKind === "deep_clean"` and `professional.deepCleanRatePerHour != null` → use `professional.deepCleanRatePerHour`
  - Else → use `professional.ratePerHour`

- **Formulas:**
  - `totalPrice = durationHours × clientEffectiveRate`
  - `cost = durationHours × professionalEffectiveRate`

These are applied when **creating** a job and when **updating** a job (whenever duration, client, professional, or service kind change).

---

## 4. Where It Applies

- **Invoices:** Use `job.totalPrice` (already stored); no change to invoice logic.
- **Finance:** Revenue/cost/profit use `job.totalPrice` and `job.cost`; no change.
- **Payment list (payroll):** Uses `job.cost`; no change.

---

## 5. UI

- **Client form:** Optional field “Deep clean price/hour (£)”.
- **Professional form:** Optional field “Deep clean rate/hour (£)”.
- **Job form:** “Service” selector: **Regular** | **Deep clean** (default Regular).

---

## 6. Implementation Summary

| Layer | Changes |
|-------|--------|
| DB | `clients.deep_clean_price_per_hour` (nullable), `professionals.deep_clean_rate_per_hour` (nullable), `jobs.service_kind` ('regular' \| 'deep_clean', default 'regular'). |
| Schemas | Client: `deepCleanPricePerHour` optional. Professional: `deepCleanRatePerHour` optional. Job: `serviceKind` with default `'regular'`. |
| Supabase service | Map new fields; in addJob/updateJob compute totalPrice and cost using effective rates. getJobs/getJobsByDate select new columns and pass to dbJobToJob. |
| ClientDialog | Add “Deep clean price/hour” input. |
| ProfessionalDialog | Add “Deep clean rate/hour” input. |
| JobDialog | Add “Service” select (Regular / Deep clean). |
