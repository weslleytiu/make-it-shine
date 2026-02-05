import { useState, useMemo } from "react";
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { InvoiceDetailSheet } from "@/components/invoices/InvoiceDetailSheet";
import type { Invoice } from "@/lib/schemas";

export default function Invoices() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();
  const deleteMutation = useDeleteInvoice();
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const clientMap = useMemo(() => {
    const m = new Map<string, string>();
    clients.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [clients]);

  const filteredInvoices = useMemo(() => {
    if (clientFilter === "all") return invoices;
    return invoices.filter((inv) => inv.clientId === clientFilter);
  }, [invoices, clientFilter]);

  const selectedClientName = detailInvoice ? clientMap.get(detailInvoice.clientId) ?? "—" : "";

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this invoice? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const openDetail = (inv: Invoice) => {
    setDetailInvoice(inv);
    setDetailOpen(true);
  };

  if (isLoading) return <div>Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="page-title">Invoices</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create invoice
        </Button>
      </div>

      <div className="flex items-center gap-2">
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
      </div>

      <Card>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No invoices yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => (
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
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "default"
                            : inv.status === "pending" || inv.status === "overdue"
                              ? "secondary"
                              : inv.status === "cancelled"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">£{inv.total.toFixed(2)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(inv.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <InvoiceDetailSheet
        invoice={detailInvoice}
        clientName={selectedClientName}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
