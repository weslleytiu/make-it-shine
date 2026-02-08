import { supabase } from "@/lib/supabase";
import type { Client, Professional, Job, Invoice, InvoiceJob } from "@/lib/schemas";
import type { Quote } from "@/types/landing";
import { dateToLocalDateString, localDateStringToDate } from "@/lib/utils";

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
  created_at: string;
  updated_at: string;
}

interface DbJob {
  id: string;
  client_id: string;
  professional_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  type: "one_time" | "recurring";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  total_price: number | null;
  cost: number | null;
  recurring_group_id: string | null;
  created_at: string;
  updated_at: string;
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
    availability: db.availability,
    status: db.status,
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
    availability: pro.availability,
    status: pro.status,
  };
}

function dbJobToJob(db: DbJob, client: Client, professional: Professional): Job {
  return {
    id: db.id,
    clientId: db.client_id,
    professionalId: db.professional_id,
    date: localDateStringToDate(db.date),
    startTime: db.start_time,
    durationHours: db.duration_hours,
    type: db.type,
    status: db.status,
    notes: db.notes || undefined,
    totalPrice: db.total_price ?? db.duration_hours * client.pricePerHour,
    cost: db.cost ?? db.duration_hours * professional.ratePerHour,
    createdAt: new Date(db.created_at),
    recurringGroupId: db.recurring_group_id || undefined,
  };
}

function jobToDbJob(job: Omit<Job, "id" | "createdAt" | "totalPrice" | "cost">): Omit<DbJob, "id" | "created_at" | "updated_at" | "total_price" | "cost"> {
  return {
    client_id: job.clientId,
    professional_id: job.professionalId,
    date: dateToLocalDateString(job.date),
    start_time: job.startTime,
    duration_hours: job.durationHours,
    type: job.type,
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
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

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
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        clients:client_id (
          id,
          name,
          price_per_hour
        ),
        professionals:professional_id (
          id,
          name,
          rate_per_hour
        )
      `)
      .order("date", { ascending: false })
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    // Transform the data
    return (data as any[]).map((item) => {
      const dbJob = item as DbJob;
      const client = item.clients as { id: string; name: string; price_per_hour: number };
      const professional = item.professionals as { id: string; name: string; rate_per_hour: number };

      // Create minimal Client and Professional objects for conversion
      const clientObj: Client = {
        id: client.id,
        name: client.name,
        address: "",
        postcode: "",
        city: "",
        phone: "",
        email: "",
        type: "residential",
        contractType: "fixed",
        frequency: null,
        pricePerHour: client.price_per_hour,
        status: "active",
        createdAt: new Date(),
        invoiceFrequency: "monthly",
        autoGenerateInvoice: true,
      };

      const professionalObj: Professional = {
        id: professional.id,
        name: professional.name,
        phone: "",
        email: "",
        ratePerHour: professional.rate_per_hour,
        availability: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        status: "active",
        createdAt: new Date(),
      };

      return dbJobToJob(dbJob, clientObj, professionalObj);
    });
  }

  async getJobsByDate(date: Date): Promise<Job[]> {
    const dateStr = dateToLocalDateString(date);

    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        clients:client_id (
          id,
          name,
          price_per_hour
        ),
        professionals:professional_id (
          id,
          name,
          rate_per_hour
        )
      `)
      .eq("date", dateStr)
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch jobs by date: ${error.message}`);
    }

    // Transform the data
    return (data as any[]).map((item) => {
      const dbJob = item as DbJob;
      const client = item.clients as { id: string; name: string; price_per_hour: number };
      const professional = item.professionals as { id: string; name: string; rate_per_hour: number };

      const clientObj: Client = {
        id: client.id,
        name: client.name,
        address: "",
        postcode: "",
        city: "",
        phone: "",
        email: "",
        type: "residential",
        contractType: "fixed",
        frequency: null,
        pricePerHour: client.price_per_hour,
        status: "active",
        createdAt: new Date(),
        invoiceFrequency: "monthly",
        autoGenerateInvoice: true,
      };

      const professionalObj: Professional = {
        id: professional.id,
        name: professional.name,
        phone: "",
        email: "",
        ratePerHour: professional.rate_per_hour,
        availability: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        status: "active",
        createdAt: new Date(),
      };

      return dbJobToJob(dbJob, clientObj, professionalObj);
    });
  }

  async addJob(job: Omit<Job, "id" | "createdAt" | "totalPrice" | "cost">): Promise<Job> {
    // Fetch client and professional to calculate prices
    const client = await this.getClient(job.clientId);
    const professional = await this.getProfessional(job.professionalId);

    if (!client || !professional) {
      throw new Error("Invalid client or professional");
    }

    const dbJob = jobToDbJob(job);
    const totalPrice = job.durationHours * client.pricePerHour;
    const cost = job.durationHours * professional.ratePerHour;

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        ...dbJob,
        total_price: totalPrice,
        cost: cost,
      })
      .select(`
        *,
        clients:client_id (
          id,
          name,
          price_per_hour
        ),
        professionals:professional_id (
          id,
          name,
          rate_per_hour
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    const item = data as any;
    const dbJobResult = item as DbJob;
    const clientData = item.clients as { id: string; name: string; price_per_hour: number };
    const professionalData = item.professionals as { id: string; name: string; rate_per_hour: number };

    const clientObj: Client = {
      id: clientData.id,
      name: clientData.name,
      address: client.address,
      postcode: client.postcode,
      city: client.city,
      phone: client.phone,
      email: client.email,
      type: client.type,
      contractType: client.contractType,
      frequency: client.frequency,
      pricePerHour: clientData.price_per_hour,
      status: client.status,
      createdAt: client.createdAt,
      invoiceFrequency: client.invoiceFrequency,
      invoiceDayOfMonth: client.invoiceDayOfMonth,
      invoiceDayOfWeek: client.invoiceDayOfWeek,
      autoGenerateInvoice: client.autoGenerateInvoice,
      invoiceNotes: client.invoiceNotes,
    };

    const professionalObj: Professional = {
      id: professionalData.id,
      name: professionalData.name,
      phone: professional.phone,
      email: professional.email,
      ratePerHour: professionalData.rate_per_hour,
      availability: professional.availability,
      status: professional.status,
      createdAt: professional.createdAt,
    };

    return dbJobToJob(dbJobResult, clientObj, professionalObj);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const dbUpdates: Partial<DbJob> = {};

    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.professionalId !== undefined) dbUpdates.professional_id = updates.professionalId;
    if (updates.date !== undefined) dbUpdates.date = dateToLocalDateString(updates.date);
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.durationHours !== undefined) dbUpdates.duration_hours = updates.durationHours;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.recurringGroupId !== undefined) dbUpdates.recurring_group_id = updates.recurringGroupId || null;

    // Recalculate prices if duration, client, or professional changed
    if (updates.durationHours !== undefined || updates.clientId !== undefined || updates.professionalId !== undefined) {
      // Fetch current job to get all needed data
      const currentJob = await this.getJobs();
      const jobToUpdate = currentJob.find((j) => j.id === id);

      if (jobToUpdate) {
        const clientId = updates.clientId ?? jobToUpdate.clientId;
        const professionalId = updates.professionalId ?? jobToUpdate.professionalId;
        const durationHours = updates.durationHours ?? jobToUpdate.durationHours;

        const client = await this.getClient(clientId);
        const professional = await this.getProfessional(professionalId);

        if (client && professional) {
          dbUpdates.total_price = durationHours * client.pricePerHour;
          dbUpdates.cost = durationHours * professional.ratePerHour;
        }
      }
    }

    const { data, error } = await supabase
      .from("jobs")
      .update(dbUpdates)
      .eq("id", id)
      .select(`
        *,
        clients:client_id (
          id,
          name,
          price_per_hour
        ),
        professionals:professional_id (
          id,
          name,
          rate_per_hour
        )
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to update job: ${error.message}`);
    }

    if (!data) return null;

    const item = data as any;
    const dbJobResult = item as DbJob;

    const client = await this.getClient(dbJobResult.client_id);
    const professional = await this.getProfessional(dbJobResult.professional_id);

    if (!client || !professional) {
      throw new Error("Client or professional not found");
    }

    return dbJobToJob(dbJobResult, client, professional);
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

  async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from("invoices")
      .select("invoice_number")
      .like("invoice_number", `INV-${year}-%`)
      .order("invoice_number", { ascending: false })
      .limit(1);
    if (!data || data.length === 0) return `INV-${year}-001`;
    const last = (data[0] as { invoice_number: string }).invoice_number;
    const match = last.match(/INV-\d{4}-(\d+)/);
    const num = match ? parseInt(match[1], 10) + 1 : 1;
    return `INV-${year}-${String(num).padStart(3, "0")}`;
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
