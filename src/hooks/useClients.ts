import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Client } from "@/lib/schemas";

export function useClients() {
    return useQuery({
        queryKey: ["clients"],
        queryFn: () => api.getClients(),
    });
}

export function useClient(id: string) {
    return useQuery({
        queryKey: ["clients", id],
        queryFn: () => api.getClient(id),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Client, "id" | "createdAt">) => api.addClient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });
}

export function useUpdateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
            api.updateClient(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["clients", data?.id] });
        },
    });
}

export function useDeleteClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.deleteClient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });
}
