import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
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
import { format, isPast, startOfDay, differenceInDays } from "date-fns";
import type { Invoice } from "@/lib/schemas";
import type { Client } from "@/lib/schemas";
import { CheckCircle, XCircle, Plus, Trash2, Mail } from "lucide-react";
import { InvoicePdfDocument } from "./InvoicePdfDocument";

/** Client info used for PDF "Bill To" (name comes from clientName; address from here). */
export type InvoiceDetailClient = Pick<Client, "address" | "city" | "postcode"> | null;

interface InvoiceDetailSheetProps {
  invoice: Invoice | null;
  clientName: string;
  /** Optional client address for PDF. If provided, PDF "Bill To" will include address. */
  client?: InvoiceDetailClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user requests delete (confirm is handled by parent). */
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function InvoiceDetailSheet({ invoice, clientName, client, open, onOpenChange, onDelete, isDeleting }: InvoiceDetailSheetProps) {
  const { data: jobs = [] } = useInvoiceJobs(invoice?.id ?? "");
  const uninvoicedQuery = useUninvoicedCompletedJobs(invoice?.clientId ?? "");
  const updateMutation = useUpdateInvoice();
  const addJobMutation = useAddJobToInvoice();
  const removeJobMutation = useRemoveJobFromInvoice();
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (!invoice) return null;

  const isDraft = invoice.status === "draft";
  const canEdit = isDraft;
  const isOverdue = invoice.status === "pending" && isPast(startOfDay(invoice.dueDate));
  const overdueDays = isOverdue ? differenceInDays(startOfDay(new Date()), startOfDay(invoice.dueDate)) : 0;
  const uninvoicedJobs = (uninvoicedQuery.data ?? []).filter(
    (j) => !jobs.some((ij) => ij.id === j.id)
  );

  // When backend has sentAt: show "Sent on {date}" instead of Send button
  const wasSent = false; // TODO: invoice.sentAt != null when we persist send date

  const clientAddress = client
    ? `${client.address}, ${client.city} ${client.postcode}`
    : undefined;

  const handleSendToClient = async () => {
    if (!invoice || jobs.length === 0) return;
    setGeneratingPdf(true);
    try {
      let logoSrc: string | undefined;
      try {
        const res = await fetch("/logo.jpeg");
        if (res.ok) {
          const blob = await res.blob();
          logoSrc = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(blob);
          });
        }
      } catch {
        // PDF will fall back to MS placeholder if logo fails to load
      }
      const doc = (
        <InvoicePdfDocument
          invoice={invoice}
          clientName={clientName}
          clientAddress={clientAddress}
          logoSrc={logoSrc}
          jobs={jobs.map((j) => {
              const hours = j.durationHours ?? 0;
              const total = j.totalPrice ?? 0;
              const ratePerHour = hours > 0 ? total / hours : 0;
              return {
                serviceKind: j.serviceKind ?? "regular",
                date: j.date,
                startTime: j.startTime ?? "",
                durationHours: hours,
                ratePerHour,
                totalPrice: total,
              };
            })}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      // Move from draft to pending once PDF is generated (invoice "sent")
      if (invoice.status === "draft") {
        updateMutation.mutate({ id: invoice.id, data: { status: "pending" } });
      }
    } finally {
      setGeneratingPdf(false);
    }
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

  const displayStatus = isOverdue ? "overdue" : invoice.status;
  const statusVariant =
    displayStatus === "paid"
      ? "default"
      : displayStatus === "overdue"
        ? "destructive"
        : displayStatus === "pending"
          ? "secondary"
          : displayStatus === "cancelled"
            ? "destructive"
            : "outline";

  const serviceKindLabel = (kind: string) =>
    kind === "deep_clean" ? "Deep clean" : "Regular";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {invoice.invoiceNumber}
            <Badge variant={statusVariant}>{displayStatus}</Badge>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          {/* Bill to */}
          <section>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bill to</h4>
            <div className="text-sm">
              <p className="font-medium text-foreground">{clientName}</p>
              {clientAddress && (
                <p className="text-muted-foreground mt-0.5">{clientAddress}</p>
              )}
            </div>
          </section>

          {/* Invoice information */}
          <section>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Invoice details</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Period:</span> {format(invoice.periodStart, "dd/MM/yyyy")} – {format(invoice.periodEnd, "dd/MM/yyyy")}</p>
              <p><span className="font-medium text-foreground">Issue date:</span> {format(invoice.issueDate, "dd/MM/yyyy")}</p>
              <p>
                <span className="font-medium text-foreground">Due date:</span> {format(invoice.dueDate, "dd/MM/yyyy")}
                {isOverdue && (
                  <span className="ml-2 font-medium text-destructive">
                    (Overdue by {overdueDays} {overdueDays === 1 ? "day" : "days"})
                  </span>
                )}
              </p>
              {invoice.createdAt && (
                <p className="pt-1 border-t mt-2"><span className="font-medium text-foreground">Created:</span> {format(invoice.createdAt, "dd/MM/yyyy HH:mm")}</p>
              )}
              {invoice.updatedAt && invoice.updatedAt?.getTime() !== invoice.createdAt?.getTime() && (
                <p><span className="font-medium text-foreground">Last updated:</span> {format(invoice.updatedAt, "dd/MM/yyyy HH:mm")}</p>
              )}
            </div>
          </section>

          {/* Financial summary */}
          <section>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Financial summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span>£{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax</span>
                  <span>£{invoice.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>£{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {invoice.notes && (
            <section>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </section>
          )}

          {/* Line items (Jobs) */}
          <section>
            <h4 className="font-medium mb-2">Jobs ({jobs.length})</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {canEdit && <TableHead className="w-[40px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 5 : 4} className="text-center text-muted-foreground text-sm">
                      No jobs in this invoice.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="whitespace-nowrap">{format(job.date, "dd/MM/yyyy")} {job.startTime}</TableCell>
                      <TableCell>{serviceKindLabel(job.serviceKind ?? "regular")}</TableCell>
                      <TableCell>{job.durationHours}h</TableCell>
                      <TableCell className="text-right font-medium">£{(job.totalPrice ?? 0).toFixed(2)}</TableCell>
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
          </section>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {isDraft && (
              <>
                {wasSent ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> Sent to client
                    {/* TODO: show sent date when invoice.sentAt exists, e.g. "Sent on {format(invoice.sentAt, 'dd/MM/yyyy')}" */}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSendToClient}
                    disabled={generatingPdf || jobs.length === 0}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {generatingPdf ? "Generating PDF..." : "Send to client"}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel invoice
                </Button>
              </>
            )}
            {(invoice.status === "pending" || isOverdue) && (
              <>
                <Button size="sm" onClick={handleMarkPaid} disabled={updateMutation.isPending}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as paid
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel invoice
                </Button>
              </>
            )}
            {invoice.status !== "paid" && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(invoice.id)}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete invoice
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
