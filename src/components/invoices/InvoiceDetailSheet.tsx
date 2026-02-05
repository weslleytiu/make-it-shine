import {
  useInvoiceJobs,
  useUpdateInvoice,
  useRemoveJobFromInvoice,
  useUninvoicedCompletedJobs,
  useAddJobToInvoice,
} from "@/hooks/useInvoices";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import type { Invoice } from "@/lib/schemas";
import { Send, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";

interface InvoiceDetailSheetProps {
  invoice: Invoice | null;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDetailSheet({ invoice, clientName, open, onOpenChange }: InvoiceDetailSheetProps) {
  const { data: jobs = [] } = useInvoiceJobs(invoice?.id ?? "");
  const uninvoicedQuery = useUninvoicedCompletedJobs(invoice?.clientId ?? "");
  const updateMutation = useUpdateInvoice();
  const addJobMutation = useAddJobToInvoice();
  const removeJobMutation = useRemoveJobFromInvoice();

  if (!invoice) return null;

  const isDraft = invoice.status === "draft";
  const canEdit = isDraft;
  const uninvoicedJobs = (uninvoicedQuery.data ?? []).filter(
    (j) => !jobs.some((ij) => ij.id === j.id)
  );

  const handleMarkPending = () => {
    updateMutation.mutate(
      { id: invoice.id, data: { status: "pending" } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleMarkPaid = () => {
    updateMutation.mutate(
      { id: invoice.id, data: { status: "paid" } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleCancel = () => {
    if (!window.confirm("Cancel this invoice? It will remain in the list with status Cancelled.")) return;
    updateMutation.mutate(
      { id: invoice.id, data: { status: "cancelled" } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleAddJob = (jobId: string) => {
    addJobMutation.mutate({ invoiceId: invoice.id, jobId });
  };

  const handleRemoveJob = (jobId: string) => {
    removeJobMutation.mutate({ invoiceId: invoice.id, jobId });
  };

  const statusVariant =
    invoice.status === "paid"
      ? "default"
      : invoice.status === "pending" || invoice.status === "overdue"
        ? "secondary"
        : invoice.status === "cancelled"
          ? "destructive"
          : "outline";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {invoice.invoiceNumber}
            <Badge variant={statusVariant}>{invoice.status}</Badge>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Client:</span> {clientName}</p>
            <p>Period: {format(invoice.periodStart, "dd/MM/yyyy")} – {format(invoice.periodEnd, "dd/MM/yyyy")}</p>
            <p>Issue date: {format(invoice.issueDate, "dd/MM/yyyy")}</p>
            <p>Due date: {format(invoice.dueDate, "dd/MM/yyyy")}</p>
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-medium">Subtotal</span>
            <span>£{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.tax > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tax</span>
              <span>£{invoice.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>£{invoice.total.toFixed(2)}</span>
          </div>
          {invoice.notes && (
            <p className="text-sm text-muted-foreground border-t pt-2">{invoice.notes}</p>
          )}

          <div>
            <h4 className="font-medium mb-2">Jobs ({jobs.length})</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {canEdit && <TableHead className="w-[40px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 3 : 2} className="text-center text-muted-foreground text-sm">
                      No jobs in this invoice.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{format(job.date, "dd/MM/yyyy")} {job.startTime}</TableCell>
                      <TableCell className="text-right">£{(job.totalPrice ?? 0).toFixed(2)}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveJob(job.id)}
                            disabled={removeJobMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {canEdit && uninvoicedJobs.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Select onValueChange={handleAddJob}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Add job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uninvoicedJobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {format(j.date, "dd/MM/yyyy")} – £{(j.totalPrice ?? 0).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {isDraft && (
              <>
                <Button size="sm" onClick={handleMarkPending} disabled={updateMutation.isPending}>
                  <Send className="mr-2 h-4 w-4" /> Mark as sent
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel invoice
                </Button>
              </>
            )}
            {invoice.status === "pending" && (
              <>
                <Button size="sm" onClick={handleMarkPaid} disabled={updateMutation.isPending}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as paid
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel invoice
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
