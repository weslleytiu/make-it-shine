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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Professional } from "@/lib/schemas";

// getDay(): 0 = Sun, 1 = Mon, ... 6 = Sat -> availability keys
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function isAvailableOnDay(pro: Professional, date: Date): boolean {
    const dayKey = DAY_KEYS[date.getDay()];
    const availability = pro.availability as Record<string, boolean> | undefined;
    return Boolean(availability?.[dayKey]);
}
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
            professionalIds: [],
            date: new Date(),
            startTime: "09:00",
            durationHours: 2,
            type: "one_time",
            serviceKind: "regular",
            status: "scheduled",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (job) {
                form.reset({
                    ...job,
                    professionalIds: Array.isArray(job.professionalIds) ? [...job.professionalIds] : [],
                });
            } else {
                form.reset({
                    clientId: "",
                    professionalIds: [],
                    date: initialDate || new Date(),
                    startTime: "09:00",
                    durationHours: 2,
                    type: "one_time",
                    serviceKind: "regular",
                    status: "scheduled",
                    notes: "",
                });
            }
        }
    }, [open, job, initialDate]);

    const activeClients = clients?.filter((c) => c.status === "active") || [];
    const selectedClientId = form.watch("clientId");
    const selectedClient = selectedClientId ? activeClients.find((c) => c.id === selectedClientId) : null;
    const clientHasDeepCleanPrice =
        selectedClient?.deepCleanPricePerHour != null && selectedClient.deepCleanPricePerHour > 0;

    useEffect(() => {
        if (open && selectedClient && !clientHasDeepCleanPrice && form.getValues("serviceKind") === "deep_clean") {
            form.setValue("serviceKind", "regular");
        }
    }, [open, selectedClient, clientHasDeepCleanPrice, form]);

    const onSubmit = (values: z.infer<typeof jobSchema>) => {
        if (isEditing && job) {
            const updatePayload = {
                clientId: values.clientId,
                professionalIds: values.professionalIds ?? [],
                date: values.date,
                startTime: values.startTime,
                durationHours: values.durationHours,
                type: values.type,
                serviceKind: values.serviceKind,
                status: values.status,
                notes: values.notes,
                recurringGroupId: values.recurringGroupId,
            };
            updateMutation.mutate({ id: job.id, data: updatePayload }, {
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

    const allProfessionals = professionals ?? [];
    const activeProfessionals = allProfessionals.filter((p) => p.status === "active");
    const selectedIds = form.watch("professionalIds") ?? [];
    const jobDate = form.watch("date");
    const jobDateValid = jobDate instanceof Date && !Number.isNaN(jobDate.getTime());

    const professionalsAvailableOnSelectedDay =
        jobDateValid
            ? activeProfessionals.filter((p) => isAvailableOnDay(p, jobDate))
            : activeProfessionals;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Job" : "New Schedule"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5">
                        <FormField
                            control={form.control as any}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="border-border/80 focus:ring-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Select Client" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {activeClients.map((client) => (
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
                            name="professionalIds"
                            render={({ field }) => {
                                const availableToAdd = professionalsAvailableOnSelectedDay.filter(
                                    (p) => !(field.value ?? []).includes(p.id)
                                );
                                return (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Professionals</FormLabel>
                                        <FormControl>
                                            <div className="space-y-3">
                                                <Select
                                                    value=""
                                                    onValueChange={(id) => {
                                                        if (id) field.onChange([...(field.value ?? []), id]);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full border-border/80 focus:ring-2 focus:ring-primary/20">
                                                        <SelectValue placeholder="Add professional..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableToAdd.length === 0 ? (
                                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                                {professionalsAvailableOnSelectedDay.length === 0
                                                                    ? "No professionals available on the selected day. Change the date or set availability in their profile."
                                                                    : "All available professionals for this day have been added."}
                                                            </div>
                                                        ) : (
                                                            availableToAdd.map((pro) => (
                                                                <SelectItem key={pro.id} value={pro.id}>
                                                                    <span className="flex items-center gap-2">
                                                                        {pro.name}
                                                                        {pro.status !== "active" && (
                                                                            <Badge variant="secondary" className="text-[10px] font-normal capitalize">
                                                                                {pro.status}
                                                                            </Badge>
                                                                        )}
                                                                    </span>
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {selectedIds.length > 0 && (
                                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                                                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                            Selected ({selectedIds.length})
                                                        </p>
                                                        <ul className="flex flex-col gap-1.5">
                                                            {selectedIds.map((id) => {
                                                                const pro = allProfessionals.find((p) => p.id === id);
                                                                return (
                                                                    <li
                                                                        key={id}
                                                                        className="flex items-center justify-between gap-3 rounded-md bg-background/80 py-2 pl-3 pr-2 text-sm shadow-sm"
                                                                    >
                                                                        <span className="font-medium text-foreground truncate">{pro?.name ?? id}</span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                                                                            onClick={() =>
                                                                                field.onChange((field.value ?? []).filter((x) => x !== id))
                                                                            }
                                                                            aria-label="Remove professional"
                                                                            title="Remove"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

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
                                            <Input
                                                type="time"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
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
                                                <SelectTrigger className="border-border/80 focus:ring-2 focus:ring-primary/20">
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
                                name="serviceKind"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="border-border/80 focus:ring-2 focus:ring-primary/20">
                                                    <SelectValue placeholder="Service" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="regular">Regular</SelectItem>
                                                <SelectItem
                                                    value="deep_clean"
                                                    disabled={!clientHasDeepCleanPrice}
                                                    title={!clientHasDeepCleanPrice && selectedClientId ? "This client has no deep clean hourly rate set. Set it in the client profile." : undefined}
                                                >
                                                    Deep clean
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control as any}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-border/80 focus:ring-2 focus:ring-primary/20">
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
                            <Button
                                type="submit"
                                disabled={isLoading || (form.watch("professionalIds") ?? []).length === 0}
                            >
                                {isLoading ? "Schedule Job" : "Schedule Job"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
