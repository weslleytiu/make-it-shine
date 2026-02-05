import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateInvoiceForPeriod, useClientsWithUninvoicedWorkInPeriod } from "@/hooks/useInvoices";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";

const formSchema = z.object({
  clientId: z.string().uuid("Select a client"),
  periodStart: z.string().min(1, "Required"),
  periodEnd: z.string().min(1, "Required"),
  dueDays: z.coerce.number().min(1).max(90).default(30),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const generateMutation = useGenerateInvoiceForPeriod();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      clientId: "",
      periodStart: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      periodEnd: format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      dueDays: 30,
      notes: "",
    },
  });

  const periodStart = form.watch("periodStart");
  const periodEnd = form.watch("periodEnd");
  const { data: clientsWithWork = [], isLoading: isLoadingClients } =
    useClientsWithUninvoicedWorkInPeriod(periodStart, periodEnd);

  const clientIds = clientsWithWork.map((c) => c.id);
  useEffect(() => {
    const current = form.getValues("clientId");
    if (current && !clientIds.includes(current)) {
      form.setValue("clientId", "");
    }
  }, [clientIds.join(","), form]);

  const applyPreset = (value: "this_week" | "last_week") => {
    const now = new Date();
    if (value === "this_week") {
      form.setValue("periodStart", format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"));
      form.setValue("periodEnd", format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"));
    } else {
      const last = subWeeks(now, 1);
      form.setValue("periodStart", format(startOfWeek(last, { weekStartsOn: 1 }), "yyyy-MM-dd"));
      form.setValue("periodEnd", format(endOfWeek(last, { weekStartsOn: 1 }), "yyyy-MM-dd"));
    }
  };

  const onSubmit = (values: FormValues) => {
    const periodStart = new Date(values.periodStart);
    const periodEnd = new Date(values.periodEnd);
    generateMutation.mutate(
      {
        clientId: values.clientId,
        periodStart,
        periodEnd,
        options: { dueDays: values.dueDays, notes: values.notes },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick period</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="default" size="sm" onClick={() => applyPreset("this_week")}>
                  This week
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("last_week")}>
                  Last week
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="periodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="periodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period end</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control as any}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingClients}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingClients
                              ? "Loading..."
                              : clientsWithWork.length === 0
                                ? "No clients with uninvoiced work in this period"
                                : "Select client"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientsWithWork.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {clientsWithWork.length === 0 && !isLoadingClients && (
                    <p className="text-xs text-muted-foreground">
                      Only clients with completed work in this period and no open invoice are shown.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="dueDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due in (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={90} {...field} />
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
                    <Textarea placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  generateMutation.isPending ||
                  !form.watch("clientId") ||
                  clientsWithWork.length === 0
                }
              >
                {generateMutation.isPending ? "Creating..." : "Create invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
