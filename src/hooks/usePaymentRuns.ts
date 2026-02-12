import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export function usePaymentRuns() {
  return useQuery({
    queryKey: ["payment-runs"],
    queryFn: () => api.getPaymentRuns(),
  });
}

export function usePaymentRun(id: string | undefined) {
  return useQuery({
    queryKey: ["payment-runs", id],
    queryFn: () => api.getPaymentRun(id!),
    enabled: !!id,
  });
}

export function usePaymentRunItems(paymentRunId: string | undefined) {
  return useQuery({
    queryKey: ["payment-runs", paymentRunId, "items"],
    queryFn: () => api.getPaymentRunItems(paymentRunId!),
    enabled: !!paymentRunId,
  });
}

export function useCreatePaymentRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ periodStart, periodEnd }: { periodStart: Date; periodEnd: Date }) =>
      api.createPaymentRun(periodStart, periodEnd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-runs"] });
    },
  });
}

export function useMarkPaymentRunItemPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.markPaymentRunItemPaid(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payment-runs", undefined, "items"] });
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === "payment-runs" });
    },
  });
}
