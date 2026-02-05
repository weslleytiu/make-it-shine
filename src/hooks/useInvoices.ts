import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Invoice } from "@/lib/schemas";

export function useInvoices(clientId?: string) {
  return useQuery({
    queryKey: ["invoices", clientId],
    queryFn: () => api.getInvoices(clientId),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  });
}

export function useInvoiceJobs(invoiceId: string) {
  return useQuery({
    queryKey: ["invoices", invoiceId, "jobs"],
    queryFn: () => api.getJobsInInvoice(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useUninvoicedCompletedJobs(clientId: string) {
  return useQuery({
    queryKey: ["invoices", "uninvoiced", clientId],
    queryFn: () => api.getUninvoicedCompletedJobs(clientId),
    enabled: !!clientId,
  });
}

/** Clients that have uninvoiced completed work in the given period (for Create Invoice dropdown). */
export function useClientsWithUninvoicedWorkInPeriod(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: ["invoices", "clients-with-work", periodStart, periodEnd],
    queryFn: () =>
      api.getClientsWithUninvoicedWorkInPeriod(new Date(periodStart), new Date(periodEnd)),
    enabled: !!periodStart && !!periodEnd,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => api.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => api.updateInvoice(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      if (updated?.id) queryClient.invalidateQueries({ queryKey: ["invoices", updated.id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useGenerateInvoiceForPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      periodStart,
      periodEnd,
      options,
    }: {
      clientId: string;
      periodStart: Date;
      periodEnd: Date;
      options?: { dueDays?: number; notes?: string };
    }) => api.generateInvoiceForPeriod(clientId, periodStart, periodEnd, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["invoices", "uninvoiced", variables.clientId] });
    },
  });
}

export function useAddJobToInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, jobId }: { invoiceId: string; jobId: string }) =>
      api.addJobToInvoice(invoiceId, jobId),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId, "jobs"] });
    },
  });
}

export function useRemoveJobFromInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, jobId }: { invoiceId: string; jobId: string }) =>
      api.removeJobFromInvoice(invoiceId, jobId),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId, "jobs"] });
    },
  });
}
