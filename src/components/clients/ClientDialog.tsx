import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clientSchema, type Client } from "@/lib/schemas";
import { toast } from "@/lib/toast";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: Client | null;
}

export function ClientDialog({ open, onOpenChange, client }: ClientDialogProps) {
    const createMutation = useCreateClient();
    const updateMutation = useUpdateClient();
    const isEditing = !!client;

    const form = useForm<z.infer<typeof clientSchema>>({
        resolver: zodResolver(clientSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "London",
            postcode: "",
            type: "residential",
            contractType: "fixed",
            frequency: "weekly",
            pricePerHour: 15,
            deepCleanPricePerHour: undefined,
            status: "active",
            notes: "",
            // Invoice fields hidden from UI; send defaults so API receives valid data
            invoiceFrequency: "manual",
            invoiceDayOfMonth: undefined,
            invoiceDayOfWeek: undefined,
            autoGenerateInvoice: false,
            invoiceNotes: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (client) {
                form.reset({
                    ...client,
                    // Handle nulls/undefined differences if any
                    frequency: client.frequency,
                });
            } else {
                form.reset({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    city: "London",
                    postcode: "",
                    type: "residential",
                    contractType: "fixed",
                    frequency: "weekly",
                    pricePerHour: 15,
                    deepCleanPricePerHour: undefined,
                    status: "active",
                    notes: "",
                    invoiceFrequency: "manual",
                    invoiceDayOfMonth: undefined,
                    invoiceDayOfWeek: undefined,
                    autoGenerateInvoice: false,
                    invoiceNotes: "",
                });
            }
        }
    }, [client, open, form]);

    const onSubmit = (values: z.infer<typeof clientSchema>) => {
        if (isEditing && client) {
            updateMutation.mutate({ id: client.id, data: values }, {
                onSuccess: () => {
                    toast.success("Client updated successfully.");
                    onOpenChange(false);
                    form.reset();
                },
                onError: () => toast.error("Failed to update client. Please try again."),
            });
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    toast.success("Client created successfully.");
                    onOpenChange(false);
                    form.reset();
                },
                onError: () => toast.error("Failed to create client. Please try again."),
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[580px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 pr-10 border-b border-border/60 bg-muted/30">
                    <DialogTitle className="font-serif text-xl tracking-tight">
                        {isEditing ? "Edit Client" : "Add New Client"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                            {/* Contact */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Contact
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                    <FormField
                                        control={form.control as any}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="residential">Residential</SelectItem>
                                                        <SelectItem value="commercial">Commercial</SelectItem>
                                                    </SelectContent>
                                                </Select>
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

                            {/* Service & pricing */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Service & pricing
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="contractType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contract</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Contract" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="fixed">Fixed</SelectItem>
                                                        <SelectItem value="on_demand">On Demand</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="frequency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Frequency</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value || undefined}
                                                    disabled={form.watch("contractType") !== "fixed"}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Frequency" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                        <SelectItem value="biweekly">Biweekly</SelectItem>
                                                        <SelectItem value="triweekly">3x Week</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="pricePerHour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price/hr (£)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.5" min={0} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control as any}
                                    name="deepCleanPricePerHour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deep clean price/hr (£)</FormLabel>
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
                                            <FormDescription>Leave empty if not offered</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            {/* Notes */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Notes
                                </h3>
                                <FormField
                                    control={form.control as any}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Access details, preferences, special instructions..."
                                                    className="min-h-[80px] resize-y"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>
                        </div>

                        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/30 flex-row gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save client"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
