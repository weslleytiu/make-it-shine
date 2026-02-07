import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { jobSchema, type Job } from "@/lib/schemas";
import { dateToLocalDateString, localDateStringToDate } from "@/lib/utils";
import { useCreateJob, useUpdateJob } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Schema wrapper to handle date conversion from string/date picker if needed
// For now we use the main schema but might need a form-specific one if date handling is complex

interface JobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job?: Job | null;
    initialDate?: Date;
}

export function JobDialog({ open, onOpenChange, job, initialDate }: JobDialogProps) {
    const createMutation = useCreateJob();
    const updateMutation = useUpdateJob();
    const { data: clients } = useClients();
    const { data: professionals } = useProfessionals();

    const isEditing = !!job;

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema) as any,
        defaultValues: {
            clientId: "",
            professionalId: "",
            date: new Date(),
            startTime: "09:00",
            durationHours: 2,
            type: "one_time",
            status: "scheduled",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (job) {
                form.reset(job);
            } else {
                form.reset({
                    clientId: "",
                    professionalId: "",
                    date: initialDate || new Date(),
                    startTime: "09:00",
                    durationHours: 2,
                    type: "one_time",
                    status: "scheduled",
                    notes: "",
                });
            }
        }
    }, [job, open, form, initialDate]);

    const onSubmit = (values: z.infer<typeof jobSchema>) => {
        if (isEditing && job) {
            updateMutation.mutate({ id: job.id, data: values }, {
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                }
            });
        } else {
            createMutation.mutate(values as any, { // Cast to omit totalPrice/cost which are computed
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                }
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    // Filter active clients and pros
    const activeClients = clients?.filter(c => c.status === "active") || [];
    const activePros = professionals?.filter(p => p.status === "active") || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Job" : "New Schedule"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control as any}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Client" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {activeClients.map(client => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="professionalId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Professional</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Pro" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {activePros.map(pro => (
                                                    <SelectItem key={pro.id} value={pro.id}>
                                                        {pro.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <FormField
                                control={form.control as any}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value instanceof Date ? dateToLocalDateString(field.value) : field.value}
                                                onChange={(e) => field.onChange(localDateStringToDate(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="durationHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (h)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control as any}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="one_time">One Time</SelectItem>
                                                <SelectItem value="recurring">Recurring (Weekly)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Job details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Schedule Job" : "Schedule Job"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
