import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Quote } from "@/types/landing";

export function useQuotes() {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: () => api.getQuotes(),
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Quote, "id" | "createdAt" | "updatedAt">) =>
      api.createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) =>
      api.updateQuote(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      if (updated?.id) {
        queryClient.invalidateQueries({ queryKey: ["quotes", updated.id] });
      }
    },
  });
}
