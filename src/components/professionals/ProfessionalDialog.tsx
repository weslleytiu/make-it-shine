import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { professionalSchema, type Professional } from "@/lib/schemas";
import { useCreateProfessional, useUpdateProfessional } from "@/hooks/useProfessionals";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfessionalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    professional?: Professional | null;
}

const DAYS = [
    { id: "mon", label: "Monday" },
    { id: "tue", label: "Tuesday" },
    { id: "wed", label: "Wednesday" },
    { id: "thu", label: "Thursday" },
    { id: "fri", label: "Friday" },
    { id: "sat", label: "Saturday" },
    { id: "sun", label: "Sunday" },
];

const DEFAULT_AVAILABILITY = {
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false,
};

export function ProfessionalDialog({ open, onOpenChange, professional }: ProfessionalDialogProps) {
    const createMutation = useCreateProfessional();
    const updateMutation = useUpdateProfessional();
    const isEditing = !!professional;

    const form = useForm<z.infer<typeof professionalSchema>>({
        resolver: zodResolver(professionalSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            ratePerHour: 12,
            deepCleanRatePerHour: undefined,
            status: "active",
            accountHolderName: "",
            sortCode: "",
            accountNumber: "",
            availability: {
                mon: true,
                tue: true,
                wed: true,
                thu: true,
                fri: true,
                sat: false,
                sun: false,
            },
        },
    });

    useEffect(() => {
        if (open) {
            if (professional) {
                form.reset({
                    name: professional.name,
                    email: professional.email,
                    phone: professional.phone,
                    ratePerHour: professional.ratePerHour,
                    deepCleanRatePerHour: professional.deepCleanRatePerHour,
                    status: professional.status,
                    accountHolderName: professional.accountHolderName ?? "",
                    sortCode: professional.sortCode ?? "",
                    accountNumber: professional.accountNumber ?? "",
                    availability: {
                        ...DEFAULT_AVAILABILITY,
                        ...(professional.availability || {}),
                    },
                });
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    ratePerHour: 12,
                    deepCleanRatePerHour: undefined,
                    status: "active",
                    accountHolderName: "",
                    sortCode: "",
                    accountNumber: "",
                    availability: DEFAULT_AVAILABILITY,
                });
            }
        }
    }, [professional, open, form]);

    const onSubmit = (values: z.infer<typeof professionalSchema>) => {
        if (isEditing && professional) {
            updateMutation.mutate({ id: professional.id, data: values }, {
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                }
            });
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    onOpenChange(false);
                    form.reset();
                }
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Professional" : "Add New Professional"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jane Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="jane@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="07700 900000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="ratePerHour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hourly Rate (£)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" {...field} />
                                        </FormControl>
                                        <FormDescription>Amount paid to the cleaner per hour.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="deepCleanRatePerHour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deep clean rate/hour (£)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                min={0}
                                                placeholder="Optional"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    field.onChange(v === "" ? undefined : Number(v));
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>Rate for deep clean jobs. Leave empty to use standard rate.</FormDescription>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="vacation">Vacation</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base">Bank details (for payment runs)</Label>
                            <p className="text-sm text-muted-foreground">
                                Account holder name, sort code and account number (UK) are used when paying this professional.
                            </p>
                            <div className="grid gap-4 border p-4 rounded-md">
                                <FormField
                                    control={form.control as any}
                                    name="accountHolderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account holder name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Name as on bank account" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="sortCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sort code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12-34-56" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormDescription>6 digits, e.g. 12-34-56</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="12345678" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormDescription>8 digits</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Availability</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border p-4 rounded-md">
                                {DAYS.map((day) => (
                                    <FormField
                                        key={day.id}
                                        control={form.control as any}
                                        name={`availability.${day.id}`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        {day.label}
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Professional"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
