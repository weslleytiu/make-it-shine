// API Service - Uses Supabase for data persistence
// This file maintains the same interface as the previous MockApiService
// to ensure compatibility with existing hooks and components

import { supabaseService } from "./supabaseService";
import type { Client, Professional, Job, Invoice } from "@/lib/schemas";

class ApiService {
  // --- Clients ---
  async getClients(): Promise<Client[]> {
    return await supabaseService.getClients();
  }

  async getClient(id: string): Promise<Client | undefined> {
    return await supabaseService.getClient(id);
  }

  async addClient(client: Omit<Client, "id" | "createdAt">): Promise<Client> {
    return await supabaseService.addClient(client);
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    return await supabaseService.updateClient(id, updates);
  }

  async deleteClient(id: string): Promise<void> {
    return await supabaseService.deleteClient(id);
  }

  // --- Professionals ---
  async getProfessionals(): Promise<Professional[]> {
    return await supabaseService.getProfessionals();
  }

  async getProfessional(id: string): Promise<Professional | undefined> {
    return await supabaseService.getProfessional(id);
  }

  async addProfessional(pro: Omit<Professional, "id" | "createdAt">): Promise<Professional> {
    return await supabaseService.addProfessional(pro);
  }

  async updateProfessional(id: string, updates: Partial<Professional>): Promise<Professional | null> {
    return await supabaseService.updateProfessional(id, updates);
  }

  async deleteProfessional(id: string): Promise<void> {
    return await supabaseService.deleteProfessional(id);
  }

  // --- Jobs ---
  async getJobs(): Promise<Job[]> {
    return await supabaseService.getJobs();
  }

  async getJobsByDate(date: Date): Promise<Job[]> {
    return await supabaseService.getJobsByDate(date);
  }

  async addJob(job: Omit<Job, "id" | "createdAt" | "totalPrice" | "cost">): Promise<Job> {
    return await supabaseService.addJob(job);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    return await supabaseService.updateJob(id, updates);
  }

  async deleteJob(id: string): Promise<void> {
    return await supabaseService.deleteJob(id);
  }

  // --- Invoices ---
  async getInvoices(clientId?: string): Promise<Invoice[]> {
    return await supabaseService.getInvoices(clientId);
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return await supabaseService.getInvoice(id);
  }

  async createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
    return await supabaseService.createInvoice(invoice);
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    return await supabaseService.updateInvoice(id, updates);
  }

  async deleteInvoice(id: string): Promise<void> {
    return await supabaseService.deleteInvoice(id);
  }

  async getJobsInInvoice(invoiceId: string): Promise<Job[]> {
    return await supabaseService.getJobsInInvoice(invoiceId);
  }

  async addJobToInvoice(invoiceId: string, jobId: string): Promise<void> {
    return await supabaseService.addJobToInvoice(invoiceId, jobId);
  }

  async removeJobFromInvoice(invoiceId: string, jobId: string): Promise<void> {
    return await supabaseService.removeJobFromInvoice(invoiceId, jobId);
  }

  async getUninvoicedCompletedJobs(clientId: string): Promise<Job[]> {
    return await supabaseService.getUninvoicedCompletedJobs(clientId);
  }

  async getClientsWithUninvoicedWorkInPeriod(periodStart: Date, periodEnd: Date): Promise<Client[]> {
    return await supabaseService.getClientsWithUninvoicedWorkInPeriod(periodStart, periodEnd);
  }

  async generateInvoiceForPeriod(
    clientId: string,
    periodStart: Date,
    periodEnd: Date,
    options?: { dueDays?: number; notes?: string }
  ): Promise<Invoice> {
    return await supabaseService.generateInvoiceForPeriod(clientId, periodStart, periodEnd, options);
  }
}

export const api = new ApiService();
