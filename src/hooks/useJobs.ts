import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Job } from "@/lib/schemas";

export function useJobs(date?: Date) {
    return useQuery({
        queryKey: ["jobs", date], // Include date in key if filtering by date in future
        queryFn: () => date ? api.getJobsByDate(date) : api.getJobs(),
    });
}

export function useJob(id: string) {
    return useQuery({
        queryKey: ["jobs", id],
        queryFn: async () => {
            const jobs = await api.getJobs();
            return jobs.find(j => j.id === id);
        },
        enabled: !!id,
    });
}

export function useCreateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Job, "id" | "createdAt" | "totalPrice" | "cost">) =>
            api.addJob(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
        },
    });
}

export function useUpdateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
            api.updateJob(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
        },
    });
}

export function useDeleteJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.deleteJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
        },
    });
}
