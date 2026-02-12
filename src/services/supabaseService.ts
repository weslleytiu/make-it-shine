import { supabase } from "@/lib/supabase";
import type { Client, Professional, Job, Invoice, InvoiceJob, PaymentRun, PaymentRunItem } from "@/lib/schemas";
import type { Quote } from "@/types/landing";
import { dateToLocalDateString, localDateStringToDate } from "@/lib/utils";

/** Normalize DB time (e.g. "09:00:00") to HH:MM for form/schema validation */
function normalizeTimeToHHMM(time: string): string {
  if (!time) return time;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;
  const h = match[1].padStart(2, "0");
  const m = match[2];
  return `${h}:${m}`;
}

// Database types (snake_case from Supabase)
interface DbClient {
  id: string;
  name: string;
  address: string;
  postcode: string;
  city: string;
  phone: string;
  email: string;
  type: "residential" | "commercial";
  contract_type: "fixed" | "on_demand";
  frequency: "weekly" | "biweekly" | "triweekly" | "monthly" | null;
  price_per_hour: number;
  deep_clean_price_per_hour?: number | null;
  status: "active" | "inactive";
  notes: string | null;
  created_at: string;
  updated_at: string;
  invoice_frequency?: "per_job" | "weekly" | "biweekly" | "monthly" | "manual" | null;
  invoice_day_of_month?: number | null;
  invoice_day_of_week?: number | null;
  auto_generate_invoice?: boolean | null;
  invoice_notes?: string | null;
}

interface DbInvoice {
  id: string;
  client_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DbInvoiceJob {
  id: string;
  invoice_id: string;
  job_id: string;
  created_at: string;
}

interface DbProfessional {
  id: string;
  name: string;
  phone: string;
  email: string;
  rate_per_hour: number;
  deep_clean_rate_per_hour?: number | null;
  availability: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
  };
  status: "active" | "vacation" | "inactive";
  account_holder_name?: string | null;
  sort_code?: string | null;
  account_number?: string | null;
  created_at: string;
  updated_at: string;
}

interface DbPaymentRun {
  id: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

interface DbPaymentRunItem {
  id: string;
  payment_run_id: string;
  professional_id: string;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  external_reference: string | null;
  created_at: string;
}

interface DbJob {
  id: string;
  client_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  type: "one_time" | "recurring";
  service_kind?: "regular" | "deep_clean";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  total_price: number | null;
  cost: number | null;
  recurring_group_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DbJobProfessional {
  job_id: string;
  professional_id: string;
  cost: number;
}

interface DbJobOccurrenceStatus {
  job_id: string;
  occurrence_date: string;
  status: string;
}

interface DbQuote {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  postcode: string;
  preferred_contact: "Phone" | "WhatsApp" | "Email";
  message: string | null;
  status: "pending" | "approved" | "rejected" | "converted";
  professional_id: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

// Helper functions to convert between DB and app types
function dbQuoteToQuote(db: DbQuote): Quote {
  return {
    id: db.id,
    fullName: db.full_name,
    email: db.email,
    phone: db.phone,
    serviceType: db.service_type,
    postcode: db.postcode,
    preferredContact: db.preferred_contact,
    message: db.message ?? null,
    status: db.status,
    professionalId: db.professional_id ?? null,
    source: db.source,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function quoteToDbQuote(
  q: Omit<Quote, "id" | "createdAt" | "updatedAt">
): Omit<DbQuote, "id" | "created_at" | "updated_at"> {
  return {
    full_name: q.fullName,
    email: q.email,
    phone: q.phone,
    service_type: q.serviceType,
    postcode: q.postcode,
    preferred_contact: q.preferredContact,
    message: q.message ?? null,
    status: q.status,
    professional_id: q.professionalId ?? null,
    source: q.source,
  };
}

function dbClientToClient(db: DbClient): Client {
  return {
    id: db.id,
    name: db.name,
    address: db.address,
    postcode: db.postcode,
    city: db.city,
    phone: db.phone,
    email: db.email,
    type: db.type,
    contractType: db.contract_type,
    frequency: db.frequency,
    pricePerHour: db.price_per_hour,
    deepCleanPricePerHour: db.deep_clean_price_per_hour ?? undefined,
    status: db.status,
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    invoiceFrequency: (db.invoice_frequency as Client["invoiceFrequency"]) ?? "monthly",
    invoiceDayOfMonth: db.invoice_day_of_month ?? undefined,
    invoiceDayOfWeek: db.invoice_day_of_week ?? undefined,
    autoGenerateInvoice: db.auto_generate_invoice ?? true,
    invoiceNotes: db.invoice_notes || undefined,
  };
}

function clientToDbClient(client: Omit<Client, "id" | "createdAt">): Omit<DbClient, "id" | "created_at" | "updated_at"> {
  return {
    name: client.name,
    address: client.address,
    postcode: client.postcode,
    city: client.city,
    phone: client.phone,
    email: client.email,
    type: client.type,
    contract_type: client.contractType,
    frequency: client.frequency ?? null,
    price_per_hour: client.pricePerHour,
    deep_clean_price_per_hour: client.deepCleanPricePerHour ?? null,
    status: client.status,
    notes: client.notes || null,
    invoice_frequency: client.invoiceFrequency ?? "monthly",
    invoice_day_of_month: client.invoiceDayOfMonth ?? null,
    invoice_day_of_week: client.invoiceDayOfWeek ?? null,
    auto_generate_invoice: client.autoGenerateInvoice ?? true,
    invoice_notes: client.invoiceNotes || null,
  };
}

function dbProfessionalToProfessional(db: DbProfessional): Professional {
  return {
    id: db.id,
    name: db.name,
    phone: db.phone,
    email: db.email,
    ratePerHour: db.rate_per_hour,
    deepCleanRatePerHour: db.deep_clean_rate_per_hour ?? undefined,
    availability: db.availability,
    status: db.status,
    accountHolderName: db.account_holder_name ?? undefined,
    sortCode: db.sort_code ?? undefined,
    accountNumber: db.account_number ?? undefined,
    createdAt: new Date(db.created_at),
  };
}

function professionalToDbProfessional(
  pro: Omit<Professional, "id" | "createdAt">
): Omit<DbProfessional, "id" | "created_at" | "updated_at"> {
  return {
    name: pro.name,
    phone: pro.phone,
    email: pro.email,
    rate_per_hour: pro.ratePerHour,
    deep_clean_rate_per_hour: pro.deepCleanRatePerHour ?? null,
    availability: pro.availability,
    status: pro.status,
    account_holder_name: pro.accountHolderName || null,
    sort_code: pro.sortCode || null,
    account_number: pro.accountNumber || null,
  };
}

function dbPaymentRunToPaymentRun(db: DbPaymentRun): PaymentRun {
  return {
    id: db.id,
    periodStart: localDateStringToDate(db.period_start),
    periodEnd: localDateStringToDate(db.period_end),
    createdAt: new Date(db.created_at),
  };
}

function dbPaymentRunItemToPaymentRunItem(db: DbPaymentRunItem): PaymentRunItem {
  return {
    id: db.id,
    paymentRunId: db.payment_run_id,
    professionalId: db.professional_id,
    amount: Number(db.amount),
    status: db.status,
    paidAt: db.paid_at ? new Date(db.paid_at) : null,
    externalReference: db.external_reference ?? undefined,
    createdAt: new Date(db.created_at),
  };
}

function getEffectiveClientRate(client: Client, serviceKind: "regular" | "deep_clean"): number {
  if (serviceKind === "deep_clean" && client.deepCleanPricePerHour != null) {
    return client.deepCleanPricePerHour;
  }
  return client.pricePerHour;
}

function getEffectiveProfessionalRate(professional: Professional, serviceKind: "regular" | "deep_clean"): number {
  if (serviceKind === "deep_clean" && professional.deepCleanRatePerHour != null) {
    return professional.deepCleanRatePerHour;
  }
  return professional.ratePerHour;
}

function dbJobToJob(
  db: DbJob,
  professionalIds: string[],
  professionalCosts?: { professionalId: string; cost: number }[],
  occurrenceStatuses?: Record<string, string>
): Job {
  const serviceKind = db.service_kind ?? "regular";
  const totalPrice = db.total_price ?? 0;
  const cost = db.cost ?? 0;
  return {
    id: db.id,
    clientId: db.client_id,
    professionalIds,
    date: localDateStringToDate(db.date),
    startTime: normalizeTimeToHHMM(db.start_time),
    durationHours: db.duration_hours,
    type: db.type,
    serviceKind,
    status: db.status,
    notes: db.notes || undefined,
    totalPrice,
    cost,
    professionalCosts,
    createdAt: new Date(db.created_at),
    recurringGroupId: db.recurring_group_id || undefined,
    occurrenceStatuses,
  };
}

function jobToDbJob(job: Omit<Job, "id" | "createdAt" | "totalPrice" | "cost">): Omit<DbJob, "id" | "created_at" | "updated_at" | "total_price" | "cost"> {
  return {
    client_id: job.clientId,
    date: dateToLocalDateString(job.date),
    start_time: job.startTime,
    duration_hours: job.durationHours,
    type: job.type,
    service_kind: job.serviceKind ?? "regular",
    status: job.status,
    notes: job.notes || null,
    recurring_group_id: job.recurringGroupId || null,
  };
}

function dbInvoiceToInvoice(db: DbInvoice): Invoice {
  return {
    id: db.id,
    clientId: db.client_id,
    invoiceNumber: db.invoice_number,
    periodStart: new Date(db.period_start),
    periodEnd: new Date(db.period_end),
    issueDate: new Date(db.issue_date),
    dueDate: new Date(db.due_date),
    status: db.status,
    subtotal: Number(db.subtotal),
    tax: Number(db.tax),
    total: Number(db.total),
    notes: db.notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function invoiceToDbInvoice(inv: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Omit<DbInvoice, "id" | "created_at" | "updated_at"> {
  return {
    client_id: inv.clientId,
    invoice_number: inv.invoiceNumber,
    period_start: inv.periodStart.toISOString(),
    period_end: inv.periodEnd.toISOString(),
    issue_date: inv.issueDate.toISOString(),
    due_date: inv.dueDate.toISOString(),
    status: inv.status,
    subtotal: inv.subtotal,
    tax: inv.tax,
    total: inv.total,
    notes: inv.notes || null,
  };
}

function dbInvoiceJobToInvoiceJob(db: DbInvoiceJob): InvoiceJob {
  return {
    id: db.id,
    invoiceId: db.invoice_id,
    jobId: db.job_id,
    createdAt: new Date(db.created_at),
  };
}

class SupabaseService {
  // --- Clients ---
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return (data as DbClient[]).map(dbClientToClient);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return undefined;
      }
      throw new Error(`Failed to fetch client: ${error.message}`);
    }

    return data ? dbClientToClient(data as DbClient) : undefined;
  }

  async addClient(client: Omit<Client, "id" | "createdAt">): Promise<Client> {
    const dbClient = clientToDbClient(client);

    const { data, error } = await supabase.from("clients").insert(dbClient).select().single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return dbClientToClient(data as DbClient);
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const dbUpdates: Partial<DbClient> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.postcode !== undefined) dbUpdates.postcode = updates.postcode;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.contractType !== undefined) dbUpdates.contract_type = updates.contractType;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency ?? null;
    if (updates.pricePerHour !== undefined) dbUpdates.price_per_hour = updates.pricePerHour;
    if (updates.deepCleanPricePerHour !== undefined) dbUpdates.deep_clean_price_per_hour = updates.deepCleanPricePerHour ?? null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.invoiceFrequency !== undefined) dbUpdates.invoice_frequency = updates.invoiceFrequency;
    if (updates.invoiceDayOfMonth !== undefined) dbUpdates.invoice_day_of_month = updates.invoiceDayOfMonth ?? null;
    if (updates.invoiceDayOfWeek !== undefined) dbUpdates.invoice_day_of_week = updates.invoiceDayOfWeek ?? null;
    if (updates.autoGenerateInvoice !== undefined) dbUpdates.auto_generate_invoice = updates.autoGenerateInvoice;
    if (updates.invoiceNotes !== undefined) dbUpdates.invoice_notes = updates.invoiceNotes || null;

    const { data, error } = await supabase.from("clients").update(dbUpdates).eq("id", id).select().single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to update client: ${error.message}`);
    }

    return data ? dbClientToClient(data as DbClient) : null;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }

  // --- Professionals ---
  async getProfessionals(): Promise<Professional[]> {
    const { data, error } = await supabase.from("professionals").select("*").order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch professionals: ${error.message}`);
    }

    return (data as DbProfessional[]).map(dbProfessionalToProfessional);
  }

  async getProfessional(id: string): Promise<Professional | undefined> {
    const { data, error } = await supabase.from("professionals").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return undefined;
      }
      throw new Error(`Failed to fetch professional: ${error.message}`);
    }

    return data ? dbProfessionalToProfessional(data as DbProfessional) : undefined;
  }

  async addProfessional(pro: Omit<Professional, "id" | "createdAt">): Promise<Professional> {
    const dbPro = professionalToDbProfessional(pro);

    const { data, error } = await supabase.from("professionals").insert(dbPro).select().single();

    if (error) {
      throw new Error(`Failed to create professional: ${error.message}`);
    }

    return dbProfessionalToProfessional(data as DbProfessional);
  }

  async updateProfessional(id: string, updates: Partial<Professional>): Promise<Professional | null> {
    const dbUpdates: Partial<DbProfessional> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.ratePerHour !== undefined) dbUpdates.rate_per_hour = updates.ratePerHour;
    if (updates.deepCleanRatePerHour !== undefined) dbUpdates.deep_clean_rate_per_hour = updates.deepCleanRatePerHour ?? null;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.accountHolderName !== undefined) dbUpdates.account_holder_name = updates.accountHolderName || null;
    if (updates.sortCode !== undefined) dbUpdates.sort_code = updates.sortCode || null;
    if (updates.accountNumber !== undefined) dbUpdates.account_number = updates.accountNumber || null;

    const { data, error } = await supabase.from("professionals").update(dbUpdates).eq("id", id).select().single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to update professional: ${error.message}`);
    }

    return data ? dbProfessionalToProfessional(data as DbProfessional) : null;
  }

  async deleteProfessional(id: string): Promise<void> {
    const { error } = await supabase.from("professionals").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete professional: ${error.message}`);
    }
  }

  // --- Jobs ---
  async getJobs(): Promise<Job[]> {
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .order("date", { ascending: false })
      .order("start_time", { ascending: true });

    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    const dbJobs = (jobsData ?? []) as DbJob[];
    if (dbJobs.length === 0) return [];

    const jobIds = dbJobs.map((j) => j.id);
    const { data: jpData, error: jpError } = await supabase
      .from("job_professionals")
      .select("job_id, professional_id, cost")
      .in("job_id", jobIds);

    if (jpError) {
      throw new Error(`Failed to fetch job professionals: ${jpError.message}`);
    }

    const jpRows = (jpData ?? []) as DbJobProfessional[];
    const professionalIdsByJobId = new Map<string, string[]>();
    const professionalCostsByJobId = new Map<string, { professionalId: string; cost: number }[]>();
    for (const jp of jpRows) {
      const arr = professionalIdsByJobId.get(jp.job_id) ?? [];
      arr.push(jp.professional_id);
      professionalIdsByJobId.set(jp.job_id, arr);
      const costs = professionalCostsByJobId.get(jp.job_id) ?? [];
      costs.push({ professionalId: jp.professional_id, cost: Number(jp.cost) });
      professionalCostsByJobId.set(jp.job_id, costs);
    }

    const recurringJobIds = dbJobs.filter((j) => j.type === "recurring").map((j) => j.id);
    let occurrenceStatusByJob = new Map<string, Record<string, string>>();
    if (recurringJobIds.length > 0) {
      const { data: occData } = await supabase
        .from("job_occurrence_status")
        .select("job_id, occurrence_date, status")
        .in("job_id", recurringJobIds);
      const rows = (occData ?? []) as DbJobOccurrenceStatus[];
      for (const row of rows) {
        const map = occurrenceStatusByJob.get(row.job_id) ?? {};
        map[row.occurrence_date] = row.status;
        occurrenceStatusByJob.set(row.job_id, map);
      }
    }

    return dbJobs.map((dbJob) => {
      const professionalIds = professionalIdsByJobId.get(dbJob.id) ?? [];
      const professionalCosts = professionalCostsByJobId.get(dbJob.id);
      const occurrenceStatuses = occurrenceStatusByJob.get(dbJob.id);
      return dbJobToJob(dbJob, professionalIds, professionalCosts, occurrenceStatuses);
    });
  }

  async getJobsByDate(date: Date): Promise<Job[]> {
    const dateStr = dateToLocalDateString(date);

    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("date", dateStr)
      .order("start_time", { ascending: true });

    if (jobsError) {
      throw new Error(`Failed to fetch jobs by date: ${jobsError.message}`);
    }

    const dbJobs = (jobsData ?? []) as DbJob[];
    if (dbJobs.length === 0) return [];

    const jobIds = dbJobs.map((j) => j.id);
    const { data: jpData, error: jpError } = await supabase
      .from("job_professionals")
      .select("job_id, professional_id, cost")
      .in("job_id", jobIds);

    if (jpError) {
      throw new Error(`Failed to fetch job professionals: ${jpError.message}`);
    }

    const jpRows = (jpData ?? []) as DbJobProfessional[];
    const professionalIdsByJobId = new Map<string, string[]>();
    const professionalCostsByJobId = new Map<string, { professionalId: string; cost: number }[]>();
    for (const jp of jpRows) {
      const arr = professionalIdsByJobId.get(jp.job_id) ?? [];
      arr.push(jp.professional_id);
      professionalIdsByJobId.set(jp.job_id, arr);
      const costs = professionalCostsByJobId.get(jp.job_id) ?? [];
      costs.push({ professionalId: jp.professional_id, cost: Number(jp.cost) });
      professionalCostsByJobId.set(jp.job_id, costs);
    }

    const recurringJobIds = dbJobs.filter((j) => j.type === "recurring").map((j) => j.id);
    let occurrenceStatusByJob = new Map<string, Record<string, string>>();
    if (recurringJobIds.length > 0) {
      const { data: occData } = await supabase
        .from("job_occurrence_status")
        .select("job_id, occurrence_date, status")
        .in("job_id", recurringJobIds);
      const rows = (occData ?? []) as DbJobOccurrenceStatus[];
      for (const row of rows) {
        const map = occurrenceStatusByJob.get(row.job_id) ?? {};
        map[row.occurrence_date] = row.status;
        occurrenceStatusByJob.set(row.job_id, map);
      }
    }

    return dbJobs.map((dbJob) => {
      const professionalIds = professionalIdsByJobId.get(dbJob.id) ?? [];
      const professionalCosts = professionalCostsByJobId.get(dbJob.id);
      const occurrenceStatuses = occurrenceStatusByJob.get(dbJob.id);
      return dbJobToJob(dbJob, professionalIds, professionalCosts, occurrenceStatuses);
    });
  }

  async addJob(job: Omit<Job, "id" | "createdAt" | "totalPrice" | "cost">): Promise<Job> {
    const client = await this.getClient(job.clientId);
    if (!client) throw new Error("Invalid client");
    if (!job.professionalIds?.length) throw new Error("At least one cleaner is required to schedule this job.");

    const serviceKind = job.serviceKind ?? "regular";
    if (serviceKind === "deep_clean") {
      const hasDeepCleanPrice = client.deepCleanPricePerHour != null && client.deepCleanPricePerHour > 0;
      if (!hasDeepCleanPrice) {
        throw new Error("This client does not have a deep clean hourly rate. Set it in the client profile or choose Regular service.");
      }
    }
    const clientRate = getEffectiveClientRate(client, serviceKind);
    const professionalCosts: { professionalId: string; cost: number }[] = [];

    for (const proId of job.professionalIds) {
      const pro = await this.getProfessional(proId);
      if (!pro) throw new Error(`Invalid professional: ${proId}`);
      const cost = job.durationHours * getEffectiveProfessionalRate(pro, serviceKind);
      professionalCosts.push({ professionalId: proId, cost });
    }

    const totalPrice = job.durationHours * clientRate * job.professionalIds.length;
    const totalCost = professionalCosts.reduce((sum, p) => sum + p.cost, 0);

    const dbJob = jobToDbJob(job);
    const { data: jobRow, error: jobError } = await supabase
      .from("jobs")
      .insert({
        ...dbJob,
        total_price: totalPrice,
        cost: totalCost,
      })
      .select("*")
      .single();

    if (jobError) throw new Error(`Failed to create job: ${jobError.message}`);
    const dbJobResult = jobRow as DbJob;

    const { error: jpError } = await supabase.from("job_professionals").insert(
      professionalCosts.map((p) => ({
        job_id: dbJobResult.id,
        professional_id: p.professionalId,
        cost: p.cost,
      }))
    );
    if (jpError) {
      await supabase.from("jobs").delete().eq("id", dbJobResult.id);
      throw new Error(`Failed to link professionals to job: ${jpError.message}`);
    }

    return dbJobToJob(dbJobResult, job.professionalIds, professionalCosts);
  }

  async updateJob(id: string, updates: Partial<Job> & { occurrenceDate?: Date }): Promise<Job | null> {
    const allJobs = await this.getJobs();
    const jobToUpdate = allJobs.find((j) => j.id === id);
    if (!jobToUpdate) return null;

    const occurrenceDate = updates.occurrenceDate;
    const isRecurringOccurrenceUpdate =
      jobToUpdate.type === "recurring" &&
      occurrenceDate != null &&
      updates.status !== undefined;

    if (isRecurringOccurrenceUpdate) {
      const dateStr = dateToLocalDateString(occurrenceDate);
      const { error: occError } = await supabase
        .from("job_occurrence_status")
        .upsert(
          { job_id: id, occurrence_date: dateStr, status: updates.status },
          { onConflict: "job_id,occurrence_date" }
        );
      if (occError) throw new Error(`Failed to update occurrence status: ${occError.message}`);
      if (Object.keys(updates).filter((k) => !["occurrenceDate", "status"].includes(k)).length === 0) {
        const updatedJob = await this.getJobs();
        return updatedJob.find((j) => j.id === id) ?? null;
      }
    }

    const dbUpdates: Partial<DbJob> = {};
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.date !== undefined) dbUpdates.date = dateToLocalDateString(updates.date);
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.durationHours !== undefined) dbUpdates.duration_hours = updates.durationHours;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined && !isRecurringOccurrenceUpdate) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.recurringGroupId !== undefined) dbUpdates.recurring_group_id = updates.recurringGroupId || null;
    if (updates.serviceKind !== undefined) dbUpdates.service_kind = updates.serviceKind;

    const professionalIds = updates.professionalIds ?? jobToUpdate.professionalIds;
    if (professionalIds.length === 0) throw new Error("At least one cleaner is required to schedule this job.");
    const durationHours = updates.durationHours ?? jobToUpdate.durationHours;
    const serviceKind = updates.serviceKind ?? jobToUpdate.serviceKind ?? "regular";
    const clientId = updates.clientId ?? jobToUpdate.clientId;

    if (serviceKind === "deep_clean") {
      const client = await this.getClient(clientId);
      const hasDeepCleanPrice = client && client.deepCleanPricePerHour != null && client.deepCleanPricePerHour > 0;
      if (!hasDeepCleanPrice) {
        throw new Error("This client does not have a deep clean hourly rate. Set it in the client profile or choose Regular service.");
      }
    }

    const recalc =
      updates.durationHours !== undefined ||
      updates.clientId !== undefined ||
      updates.professionalIds !== undefined ||
      updates.serviceKind !== undefined;

    if (recalc) {
      const client = await this.getClient(clientId);
      if (client) {
        const clientRate = getEffectiveClientRate(client, serviceKind);
        dbUpdates.total_price = durationHours * clientRate * professionalIds.length;
      }
      let totalCost = 0;
      for (const proId of professionalIds) {
        const pro = await this.getProfessional(proId);
        if (pro) totalCost += durationHours * getEffectiveProfessionalRate(pro, serviceKind);
      }
      dbUpdates.cost = totalCost;
    }

    const { data, error } = await supabase
      .from("jobs")
      .update(dbUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to update job: ${error.message}`);
    }
    if (!data) return null;

    if (Array.isArray(updates.professionalIds)) {
      await supabase.from("job_professionals").delete().eq("job_id", id);
      if (professionalIds.length > 0) {
        const client = await this.getClient(clientId);
        if (client) {
          const rows: { job_id: string; professional_id: string; cost: number }[] = [];
          for (const proId of professionalIds) {
            const pro = await this.getProfessional(proId);
            if (pro) {
              const cost = durationHours * getEffectiveProfessionalRate(pro, serviceKind);
              rows.push({ job_id: id, professional_id: proId, cost });
            }
          }
          if (rows.length > 0) {
            const { error: insertErr } = await supabase.from("job_professionals").insert(rows);
            if (insertErr) throw new Error(`Failed to update job professionals: ${insertErr.message}`);
          }
        }
      }
    }

    const refreshed = await this.getJobs();
    return refreshed.find((j) => j.id === id) ?? null;
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  // --- Invoices ---
  async getInvoices(clientId?: string): Promise<Invoice[]> {
    let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
    return (data as DbInvoice[]).map(dbInvoiceToInvoice);
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }
    return data ? dbInvoiceToInvoice(data as DbInvoice) : undefined;
  }

  async createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
    const dbInv = invoiceToDbInvoice(invoice);
    const { data, error } = await supabase.from("invoices").insert(dbInv).select().single();
    if (error) throw new Error(`Failed to create invoice: ${error.message}`);
    return dbInvoiceToInvoice(data as DbInvoice);
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const dbUpdates: Partial<DbInvoice> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.issueDate !== undefined) dbUpdates.issue_date = updates.issueDate.toISOString();
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate.toISOString();
    if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal;
    if (updates.tax !== undefined) dbUpdates.tax = updates.tax;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    const { data, error } = await supabase.from("invoices").update(dbUpdates).eq("id", id).select().single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to update invoice: ${error.message}`);
    }
    return data ? dbInvoiceToInvoice(data as DbInvoice) : null;
  }

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete invoice: ${error.message}`);
  }

  async getInvoiceJobs(invoiceId: string): Promise<InvoiceJob[]> {
    const { data, error } = await supabase.from("invoice_jobs").select("*").eq("invoice_id", invoiceId);
    if (error) throw new Error(`Failed to fetch invoice jobs: ${error.message}`);
    return (data as DbInvoiceJob[]).map(dbInvoiceJobToInvoiceJob);
  }

  async getJobsInInvoice(invoiceId: string): Promise<Job[]> {
    const links = await this.getInvoiceJobs(invoiceId);
    if (links.length === 0) return [];
    const jobs = await this.getJobs();
    const jobIds = new Set(links.map((l) => l.jobId));
    return jobs.filter((j) => jobIds.has(j.id));
  }

  async addJobToInvoice(invoiceId: string, jobId: string): Promise<void> {
    const { error } = await supabase.from("invoice_jobs").insert({ invoice_id: invoiceId, job_id: jobId });
    if (error) throw new Error(`Failed to add job to invoice: ${error.message}`);
    const inv = await this.getInvoice(invoiceId);
    if (!inv) return;
    const jobs = await this.getJobsInInvoice(invoiceId);
    const subtotal = jobs.reduce((sum, j) => sum + (j.totalPrice ?? 0), 0);
    await this.updateInvoice(invoiceId, { subtotal, total: subtotal + inv.tax });
  }

  async removeJobFromInvoice(invoiceId: string, jobId: string): Promise<void> {
    const { error } = await supabase.from("invoice_jobs").delete().eq("invoice_id", invoiceId).eq("job_id", jobId);
    if (error) throw new Error(`Failed to remove job from invoice: ${error.message}`);
    const jobs = await this.getJobsInInvoice(invoiceId);
    const subtotal = jobs.reduce((sum, j) => sum + (j.totalPrice ?? 0), 0);
    const inv = await this.getInvoice(invoiceId);
    await this.updateInvoice(invoiceId, { subtotal, total: subtotal + (inv?.tax ?? 0) });
  }

  async getUninvoicedCompletedJobs(clientId: string): Promise<Job[]> {
    const allJobs = await this.getJobs();
    const completedForClient = allJobs.filter((j) => j.clientId === clientId && j.status === "completed");
    const { data: linked } = await supabase.from("invoice_jobs").select("job_id");
    const invoicedIds = new Set((linked || []).map((r: { job_id: string }) => r.job_id));
    return completedForClient.filter((j) => !invoicedIds.has(j.id));
  }

  /** Clients that have at least one completed job in the period that is not yet on any invoice. */
  async getClientsWithUninvoicedWorkInPeriod(periodStart: Date, periodEnd: Date): Promise<Client[]> {
    const allJobs = await this.getJobs();
    const { data: linked } = await supabase.from("invoice_jobs").select("job_id");
    const invoicedIds = new Set((linked || []).map((r: { job_id: string }) => r.job_id));
    const start = new Date(periodStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);
    const startT = start.getTime();
    const endT = end.getTime();
    const jobsInPeriod = allJobs.filter((j) => {
      if (j.status !== "completed" || invoicedIds.has(j.id)) return false;
      const t = j.date.getTime();
      return t >= startT && t <= endT;
    });
    const clientIds = [...new Set(jobsInPeriod.map((j) => j.clientId))];
    if (clientIds.length === 0) return [];
    const allClients = await this.getClients();
    return allClients
      .filter((c) => clientIds.includes(c.id) && c.status === "active")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Format: INV-000942 (6-digit sequence). Last used was INV-000941, so next is 000942. */
  async getNextInvoiceNumber(): Promise<string> {
    const { data } = await supabase
      .from("invoices")
      .select("invoice_number")
      .order("invoice_number", { ascending: false })
      .limit(1);
    const lastNum = 941; // Last invoice number used before reset/import
    let next = lastNum + 1;
    if (data && data.length > 0) {
      const last = (data[0] as { invoice_number: string }).invoice_number;
      const match = last.match(/INV-0*(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n >= lastNum) next = n + 1;
      }
    }
    return `INV-${String(next).padStart(6, "0")}`;
  }

  // --- Payment Runs ---
  async getPaymentRuns(): Promise<PaymentRun[]> {
    const { data, error } = await supabase
      .from("payment_runs")
      .select("*")
      .order("period_start", { ascending: false });
    if (error) throw new Error(`Failed to fetch payment runs: ${error.message}`);
    return (data as DbPaymentRun[]).map(dbPaymentRunToPaymentRun);
  }

  async getPaymentRun(id: string): Promise<PaymentRun | undefined> {
    const { data, error } = await supabase.from("payment_runs").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return undefined;
      throw new Error(`Failed to fetch payment run: ${error.message}`);
    }
    return data ? dbPaymentRunToPaymentRun(data as DbPaymentRun) : undefined;
  }

  /** Create a payment run for the period: sums completed job costs per professional from job_professionals. */
  async createPaymentRun(periodStart: Date, periodEnd: Date): Promise<PaymentRun> {
    const startStr = dateToLocalDateString(periodStart);
    const endStr = dateToLocalDateString(periodEnd);
    const allJobs = await this.getJobs();
    const startT = new Date(periodStart).setHours(0, 0, 0, 0);
    const endT = new Date(periodEnd).setHours(23, 59, 59, 999);
    const completedInPeriod = allJobs.filter((j) => {
      if (j.status !== "completed") return false;
      const t = j.date.getTime();
      return t >= startT && t <= endT;
    });
    const jobIds = completedInPeriod.map((j) => j.id);
    if (jobIds.length === 0) {
      const { data: runData, error: runError } = await supabase
        .from("payment_runs")
        .insert({ period_start: startStr, period_end: endStr })
        .select()
        .single();
      if (runError) throw new Error(`Failed to create payment run: ${runError.message}`);
      return dbPaymentRunToPaymentRun(runData as DbPaymentRun);
    }
    const { data: jpData, error: jpError } = await supabase
      .from("job_professionals")
      .select("professional_id, cost")
      .in("job_id", jobIds);
    if (jpError) throw new Error(`Failed to fetch job professionals: ${jpError.message}`);
    const amountByProfessional = new Map<string, number>();
    for (const row of (jpData ?? []) as { professional_id: string; cost: number }[]) {
      amountByProfessional.set(row.professional_id, (amountByProfessional.get(row.professional_id) ?? 0) + Number(row.cost));
    }
    const { data: runData, error: runError } = await supabase
      .from("payment_runs")
      .insert({ period_start: startStr, period_end: endStr })
      .select()
      .single();
    if (runError) throw new Error(`Failed to create payment run: ${runError.message}`);
    const run = dbPaymentRunToPaymentRun(runData as DbPaymentRun);
    const items = Array.from(amountByProfessional.entries())
      .filter(([, amount]) => amount > 0)
      .map(([professionalId, amount]) => ({
        payment_run_id: run.id,
        professional_id: professionalId,
        amount,
        status: "pending",
      }));
    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("payment_run_items").insert(items);
      if (itemsError) throw new Error(`Failed to create payment run items: ${itemsError.message}`);
    }
    return run;
  }

  async getPaymentRunItems(paymentRunId: string): Promise<PaymentRunItem[]> {
    const { data, error } = await supabase
      .from("payment_run_items")
      .select("*")
      .eq("payment_run_id", paymentRunId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`Failed to fetch payment run items: ${error.message}`);
    return (data as DbPaymentRunItem[]).map(dbPaymentRunItemToPaymentRunItem);
  }

  /** Mark a payment run item as paid (simulated; future: Revolut API). */
  async markPaymentRunItemPaid(itemId: string): Promise<PaymentRunItem | null> {
    const { data, error } = await supabase
      .from("payment_run_items")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", itemId)
      .select()
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to mark item as paid: ${error.message}`);
    }
    return data ? dbPaymentRunItemToPaymentRunItem(data as DbPaymentRunItem) : null;
  }

  async generateInvoiceForPeriod(
    clientId: string,
    periodStart: Date,
    periodEnd: Date,
    options?: { dueDays?: number; notes?: string }
  ): Promise<Invoice> {
    const uninvoiced = await this.getUninvoicedCompletedJobs(clientId);
    const periodStartTime = periodStart.getTime();
    const periodEndTime = periodEnd.getTime();
    const jobsInPeriod = uninvoiced.filter((j) => {
      const t = j.date.getTime();
      return t >= periodStartTime && t <= periodEndTime;
    });
    const subtotal = jobsInPeriod.reduce((sum, j) => sum + (j.totalPrice ?? 0), 0);
    const tax = 0;
    const total = subtotal + tax;
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + (options?.dueDays ?? 30));
    const invoiceNumber = await this.getNextInvoiceNumber();
    const invoice = await this.createInvoice({
      clientId,
      invoiceNumber,
      periodStart,
      periodEnd,
      issueDate,
      dueDate,
      status: "draft",
      subtotal,
      tax,
      total,
      notes: options?.notes,
    });
    for (const job of jobsInPeriod) {
      await this.addJobToInvoice(invoice.id, job.id);
    }
    const updated = await this.getInvoice(invoice.id);
    return updated ?? invoice;
  }

  // --- Quotes (landing page requests) ---
  async getQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch quotes: ${error.message}`);
    }

    return (data as DbQuote[]).map(dbQuoteToQuote);
  }

  async createQuote(
    payload: Omit<Quote, "id" | "createdAt" | "updatedAt">
  ): Promise<Quote> {
    const dbRow = quoteToDbQuote(payload);

    const { data, error } = await supabase
      .from("quotes")
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quote: ${error.message}`);
    }

    return dbQuoteToQuote(data as DbQuote);
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
    const dbUpdates: Partial<DbQuote> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
    if (updates.postcode !== undefined) dbUpdates.postcode = updates.postcode;
    if (updates.preferredContact !== undefined)
      dbUpdates.preferred_contact = updates.preferredContact;
    if (updates.message !== undefined) dbUpdates.message = updates.message ?? null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.professionalId !== undefined)
      dbUpdates.professional_id = updates.professionalId ?? null;

    const { data, error } = await supabase
      .from("quotes")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to update quote: ${error.message}`);
    }

    return data ? dbQuoteToQuote(data as DbQuote) : null;
  }
}

export const supabaseService = new SupabaseService();
