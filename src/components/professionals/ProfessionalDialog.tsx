import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { professionalSchema, type Professional } from "@/lib/schemas";
import { toast } from "@/lib/toast";
import { useCreateProfessional, useUpdateProfessional } from "@/hooks/useProfessionals";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
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
            address: "",
            city: "London",
            postcode: "",
            email: "",
            phone: "",
            ratePerHour: 12,
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
                    address: professional.address ?? "",
                    city: professional.city ?? "London",
                    postcode: professional.postcode ?? "",
                    email: professional.email,
                    phone: professional.phone,
                    ratePerHour: professional.ratePerHour,
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
                    address: "",
                    city: "London",
                    postcode: "",
                    email: "",
                    phone: "",
                    ratePerHour: 12,
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
                    toast.success("Professional updated successfully.");
                    onOpenChange(false);
                    form.reset();
                },
                onError: () => toast.error("Failed to update professional. Please try again."),
            });
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    toast.success("Professional created successfully.");
                    onOpenChange(false);
                    form.reset();
                },
                onError: () => toast.error("Failed to create professional. Please try again."),
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[580px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 pr-10 border-b border-border/60 bg-muted/30">
                    <DialogTitle className="font-serif text-xl tracking-tight">
                        {isEditing ? "Edit Professional" : "Add New Professional"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                            {/* Profile */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Profile
                                </h3>
                                <FormField
                                    control={form.control as any}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Jane Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            {/* Contact */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Contact
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="jane@example.com" {...field} />
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
                                                <FormDescription>UK format</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Address */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Address
                                </h3>
                                <FormField
                                    control={form.control as any}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="London" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="postcode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postcode</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="SW1A 1AA" {...field} />
                                                </FormControl>
                                                <FormDescription>UK format</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Work & rate */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Work & rate
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="ratePerHour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hourly rate (£)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.5" min={0} {...field} />
                                                </FormControl>
                                                <FormDescription>Amount paid per hour.</FormDescription>
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
                            </section>

                            {/* Bank details */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Bank details
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Used for payment runs. UK account only.
                                </p>
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
                                                <FormDescription>6 digits</FormDescription>
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
                            </section>

                            {/* Availability */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Availability
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Days this professional can be scheduled.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {DAYS.map((day) => (
                                        <FormField
                                            key={day.id}
                                            control={form.control as any}
                                            name={`availability.${day.id}`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-normal cursor-pointer flex-1">
                                                        {day.label}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>
                        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20 gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Professional"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
