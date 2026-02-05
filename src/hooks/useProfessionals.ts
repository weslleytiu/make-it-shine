import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Professional } from "@/lib/schemas";

export function useProfessionals() {
    return useQuery({
        queryKey: ["professionals"],
        queryFn: () => api.getProfessionals(),
    });
}

export function useProfessional(id: string) {
    return useQuery({
        queryKey: ["professionals", id],
        queryFn: () => api.getProfessional(id),
        enabled: !!id,
    });
}

export function useCreateProfessional() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Professional, "id" | "createdAt">) => api.addProfessional(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["professionals"] });
        },
    });
}

export function useUpdateProfessional() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Professional> }) =>
            api.updateProfessional(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["professionals"] });
            queryClient.invalidateQueries({ queryKey: ["professionals", data?.id] });
        },
    });
}

export function useDeleteProfessional() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.deleteProfessional(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["professionals"] });
        },
    });
}
