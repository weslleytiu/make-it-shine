import React from "react";
import { FileText, Trash2, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Invoice } from "@/lib/schemas";

interface InvoiceCardProps {
  invoice: Invoice;
  clientName: string;
  onOpen: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  overdue: "secondary",
  cancelled: "destructive",
  draft: "outline",
};

export function InvoiceCard({ invoice, clientName, onOpen, onDelete, isDeleting }: InvoiceCardProps) {
  const variant = statusVariant[invoice.status] ?? "outline";

  return (
    <Card
      className="w-full cursor-pointer overflow-hidden border-border/60 bg-card shadow-soft transition-shadow duration-200 hover:shadow-soft-lg"
      onClick={() => onOpen(invoice)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <h3 className="truncate text-lg font-semibold text-foreground">{invoice.invoiceNumber}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(invoice.id);
            }}
            disabled={isDeleting}
            aria-label="Delete invoice"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-3 text-muted-foreground">
          <User className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <span className="truncate text-sm">{clientName || "—"}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <span className="text-sm">
            {format(invoice.periodStart, "dd/MM/yyyy")} – {format(invoice.periodEnd, "dd/MM/yyyy")}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={variant} className="capitalize">
            {invoice.status}
          </Badge>
          <span className="font-semibold text-foreground">£{invoice.total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
