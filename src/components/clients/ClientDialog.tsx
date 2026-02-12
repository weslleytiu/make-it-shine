import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clientSchema, type Client } from "@/lib/schemas";
import { toast } from "@/lib/toast";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
            invoiceFrequency: "monthly",
            invoiceDayOfMonth: undefined,
            invoiceDayOfWeek: undefined,
            autoGenerateInvoice: true,
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
                    invoiceFrequency: "monthly",
                    invoiceDayOfMonth: undefined,
                    invoiceDayOfWeek: undefined,
                    autoGenerateInvoice: true,
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
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
                                            <Input placeholder="john@example.com" {...field} />
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

                        <FormField
                            control={form.control as any}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                        <FormLabel>Price/Hour (£)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" {...field} />
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
                                    <FormLabel>Deep clean price/hour (£)</FormLabel>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Access details, preferences..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="border-t pt-4 space-y-4">
                            <h4 className="text-sm font-medium">Invoice settings</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="invoiceFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Invoice frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="per_job">Per job</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="biweekly">Biweekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="manual">Manual only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="invoiceDayOfMonth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Day of month (1–31)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} max={31} placeholder="e.g. 5" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <FormField
                                    control={form.control as any}
                                    name="autoGenerateInvoice"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Auto-generate invoices</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control as any}
                                name="invoiceNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default invoice notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Optional default notes on invoices" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Client"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
