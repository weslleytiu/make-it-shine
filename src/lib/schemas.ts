import { z } from "zod";

// --- Enums ---
export const ClientTypeEnum = z.enum(["residential", "commercial"]);
export const ContractTypeEnum = z.enum(["fixed", "on_demand"]);
export const FrequencyEnum = z.enum(["weekly", "biweekly", "triweekly", "monthly"]).nullable();
export const ClientStatusEnum = z.enum(["active", "inactive"]);
export const ProfessionalStatusEnum = z.enum(["active", "vacation", "inactive"]);
export const JobTypeEnum = z.enum(["one_time", "recurring"]);
export const JobStatusEnum = z.enum(["scheduled", "in_progress", "completed", "cancelled"]);
export const InvoiceFrequencyEnum = z.enum(["per_job", "weekly", "biweekly", "monthly", "manual"]);
export const InvoiceStatusEnum = z.enum(["draft", "pending", "paid", "overdue", "cancelled"]);

// --- Regex Helpers ---
// Basic UK Phone validation (starts with 07, 01, 02 or +44)
const phoneRegex = /^(\+44|0)[0-9\s]{9,13}$/;
// Basic UK Postcode validation
const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

// --- Schemas ---

export const clientSchema = z.object({
    id: z.string().uuid().optional(), // Optional for creation
    name: z.string().min(2, "Name is required"),
    address: z.string().min(5, "Address is required"),
    postcode: z.string().regex(postcodeRegex, "Invalid UK Postcode"),
    city: z.string().min(2, "City is required"),
    phone: z.string().regex(phoneRegex, "Invalid UK Phone number"),
    email: z.string().email("Invalid email address"),
    type: ClientTypeEnum,
    contractType: ContractTypeEnum,
    frequency: FrequencyEnum.optional(),
    pricePerHour: z.coerce.number().min(0.01, "Price must be positive"),
    status: ClientStatusEnum.default("active"),
    notes: z.string().optional(),
    createdAt: z.date().optional(), // Managed by backend/service
    // Invoice configuration
    invoiceFrequency: InvoiceFrequencyEnum.default("monthly"),
    invoiceDayOfMonth: z.coerce.number().min(1).max(31).optional(),
    invoiceDayOfWeek: z.coerce.number().min(0).max(6).optional(),
    autoGenerateInvoice: z.boolean().default(true),
    invoiceNotes: z.string().optional(),
});

export const professionalAvailabilitySchema = z.object({
    mon: z.boolean().default(false),
    tue: z.boolean().default(false),
    wed: z.boolean().default(false),
    thu: z.boolean().default(false),
    fri: z.boolean().default(false),
    sat: z.boolean().default(false),
    sun: z.boolean().default(false),
});

export const professionalSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, "Name is required"),
    phone: z.string().regex(phoneRegex, "Invalid UK Phone number"),
    email: z.string().email("Invalid email address"),
    ratePerHour: z.coerce.number().min(0.01, "Rate must be positive"),
    availability: professionalAvailabilitySchema,
    status: ProfessionalStatusEnum.default("active"),
    createdAt: z.date().optional(),
});

export const jobSchema = z.object({
    id: z.string().uuid().optional(),
    clientId: z.string().uuid("Client is required"),
    professionalId: z.string().uuid("Professional is required"),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM"),
    durationHours: z.coerce.number().min(0.5, "Min duration 30min"),
    type: JobTypeEnum,
    status: JobStatusEnum.default("scheduled"),
    notes: z.string().optional(),

    // Computed/Snapshot fields
    totalPrice: z.number().optional(),
    cost: z.number().optional(),

    createdAt: z.date().optional(),
    recurringGroupId: z.string().uuid().optional(),
});

export const invoiceSchema = z.object({
    id: z.string().uuid().optional(),
    clientId: z.string().uuid(),
    invoiceNumber: z.string(),
    periodStart: z.date(),
    periodEnd: z.date(),
    issueDate: z.date(),
    dueDate: z.date(),
    status: InvoiceStatusEnum.default("draft"),
    subtotal: z.number(),
    tax: z.number().default(0),
    total: z.number(),
    notes: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const invoiceJobSchema = z.object({
    id: z.string().uuid().optional(),
    invoiceId: z.string().uuid(),
    jobId: z.string().uuid(),
    createdAt: z.date().optional(),
});

// --- Types ---
export type Client = z.infer<typeof clientSchema> & { id: string; createdAt: Date };
export type Professional = z.infer<typeof professionalSchema> & { id: string; createdAt: Date };
export type Job = z.infer<typeof jobSchema> & { id: string; createdAt: Date; totalPrice: number; cost: number };
export type Invoice = z.infer<typeof invoiceSchema> & { id: string; createdAt: Date; updatedAt: Date };
export type InvoiceJob = z.infer<typeof invoiceJobSchema> & { id: string; createdAt: Date };
export type ProfessionalAvailability = z.infer<typeof professionalAvailabilitySchema>;
