import { useState, useMemo } from "react";
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Trash2 } from "lucide-react";
import { format, isPast, startOfDay } from "date-fns";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { InvoiceDetailSheet } from "@/components/invoices/InvoiceDetailSheet";
import { InvoiceCard } from "@/components/invoices/InvoiceCard";
import type { Invoice } from "@/lib/schemas";

type StatusFilter = "all" | "open" | "closed";

/** Derived status: pending + past due date => overdue (for display only). */
function getDisplayStatus(inv: Invoice): Invoice["status"] {
  if (inv.status === "pending" && isPast(startOfDay(inv.dueDate))) return "overdue";
  return inv.status;
}

function isOpenStatus(displayStatus: string): boolean {
  return ["draft", "pending", "overdue"].includes(displayStatus);
}

export default function Invoices() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();
  const deleteMutation = useDeleteInvoice();
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const clientMap = useMemo(() => {
    const m = new Map<string, string>();
    clients.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [clients]);

  const filteredAndSortedInvoices = useMemo(() => {
    let list = invoices;
    if (clientFilter !== "all") list = list.filter((inv) => inv.clientId === clientFilter);

    const withDisplayStatus = list.map((inv) => ({ inv, displayStatus: getDisplayStatus(inv) }));

    if (statusFilter === "open") {
      list = withDisplayStatus.filter(({ displayStatus }) => isOpenStatus(displayStatus)).map(({ inv }) => inv);
    } else if (statusFilter === "closed") {
      list = withDisplayStatus.filter(({ displayStatus }) => !isOpenStatus(displayStatus)).map(({ inv }) => inv);
    } else {
      list = withDisplayStatus.map(({ inv }) => inv);
    }

    // Sort: overdue first, then by due date ascending (soonest first)
    return [...list].sort((a, b) => {
      const statusA = getDisplayStatus(a);
      const statusB = getDisplayStatus(b);
      if (statusA === "overdue" && statusB !== "overdue") return -1;
      if (statusB === "overdue" && statusA !== "overdue") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [invoices, clientFilter, statusFilter]);

  const selectedClientName = detailInvoice ? clientMap.get(detailInvoice.clientId) ?? "—" : "";
  const selectedClient = detailInvoice
    ? clients.find((c) => c.id === detailInvoice.clientId) ?? null
    : null;

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this invoice? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const openDetail = (inv: Invoice) => {
    setDetailInvoice(inv);
    setDetailOpen(true);
  };

  const emptyMessage = useMemo(() => {
    if (statusFilter === "open") return "No open invoices.";
    if (statusFilter === "closed") return "No closed invoices.";
    return "No invoices yet. Create one to get started.";
  }, [statusFilter]);

  if (isLoading) return <div>Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="page-title">Invoices</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create invoice
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: cards */}
      <div className="grid gap-3 md:hidden">
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="rounded-lg border border-border/60 bg-card p-8 text-center text-muted-foreground shadow-soft">
            {emptyMessage}
          </div>
        ) : (
          filteredAndSortedInvoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              clientName={clientMap.get(inv.clientId) ?? "—"}
              displayStatus={getDisplayStatus(inv)}
              onOpen={openDetail}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedInvoices.map((inv) => {
                  const displayStatus = getDisplayStatus(inv);
                  const canDelete = inv.status === "draft";
                  return (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDetail(inv)}
                    >
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{clientMap.get(inv.clientId) ?? "—"}</TableCell>
                      <TableCell>
                        {format(inv.periodStart, "dd/MM/yyyy")} – {format(inv.periodEnd, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{format(inv.dueDate, "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            displayStatus === "paid"
                              ? "default"
                              : displayStatus === "pending" || displayStatus === "overdue"
                                ? "secondary"
                                : displayStatus === "cancelled"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {displayStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">£{inv.total.toFixed(2)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(inv.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <InvoiceDetailSheet
        invoice={detailInvoice}
        clientName={selectedClientName}
        client={selectedClient ? { address: selectedClient.address, city: selectedClient.city, postcode: selectedClient.postcode } : null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
