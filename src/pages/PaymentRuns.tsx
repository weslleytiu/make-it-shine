import { useMemo, useState } from "react";
import { usePaymentRuns, usePaymentRunItems, useCreatePaymentRun, useMarkPaymentRunItemPaid } from "@/hooks/usePaymentRuns";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";

const WEEK_STARTS_ON = 1; // Monday
import { Plus, Landmark, Check, Copy } from "lucide-react";
import type { PaymentRun, PaymentRunItem } from "@/lib/schemas";
import type { Professional } from "@/lib/schemas";

function BankDetailsCell({ professional }: { professional: Professional | undefined }) {
  if (!professional) return <span className="text-muted-foreground">—</span>;
  const hasBank = professional.accountHolderName || professional.sortCode || professional.accountNumber;
  if (!hasBank) {
    return <span className="text-amber-600 text-sm">Missing bank details</span>;
  }
  const parts = [
    professional.accountHolderName,
    [professional.sortCode, professional.accountNumber].filter(Boolean).join(" "),
  ].filter(Boolean);
  const copyText = parts.join(" · ");

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{parts.join(" · ")}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
        title="Copy bank details"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function PaymentRuns() {
  const { data: runs = [], isLoading: runsLoading } = usePaymentRuns();
  const { data: professionals = [] } = useProfessionals();
  const createRunMutation = useCreatePaymentRun();
  const markPaidMutation = useMarkPaymentRunItemPaid();

  const [periodFilter, setPeriodFilter] = useState<"this_week" | "last_week">("this_week");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const periodRange = useMemo(() => {
    const now = new Date();
    if (periodFilter === "last_week") {
      const lastWeek = subWeeks(now, 1);
      return {
        start: startOfWeek(lastWeek, { weekStartsOn: WEEK_STARTS_ON }),
        end: endOfWeek(lastWeek, { weekStartsOn: WEEK_STARTS_ON }),
      };
    }
    return {
      start: startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }),
      end: endOfWeek(now, { weekStartsOn: WEEK_STARTS_ON }),
    };
  }, [periodFilter]);

  const { data: items = [] } = usePaymentRunItems(selectedRunId ?? undefined);
  const professionalMap = useMemo(() => {
    const m = new Map<string, Professional>(professionals.map((p) => [p.id, p]));
    return m;
  }, [professionals]);

  const selectedRun = useMemo(
    () => (selectedRunId ? runs.find((r) => r.id === selectedRunId) : runs[0] ?? null),
    [runs, selectedRunId]
  );

  const handleCreateRun = () => {
    createRunMutation.mutate(
      { periodStart: periodRange.start, periodEnd: periodRange.end },
      {
        onSuccess: (run) => {
          setSelectedRunId(run.id);
        },
      }
    );
  };

  const handleMarkPaid = (item: PaymentRunItem) => {
    markPaidMutation.mutate(item.id, {
      onSuccess: () => {
        // Optional: toast "Marked as paid (simulated; Revolut integration coming later)"
      },
    });
  };

  const runAlreadyExistsForPeriod = useMemo(() => {
    const startStr = format(periodRange.start, "yyyy-MM-dd");
    const endStr = format(periodRange.end, "yyyy-MM-dd");
    return runs.some(
      (r) =>
        format(r.periodStart, "yyyy-MM-dd") === startStr && format(r.periodEnd, "yyyy-MM-dd") === endStr
    );
  }, [runs, periodRange]);

  if (runsLoading) return <div className="p-6">Loading payment runs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="page-title">Payment Runs</h2>
        <div className="flex items-center gap-3">
          <Select value={periodFilter} onValueChange={(v: "this_week" | "last_week") => setPeriodFilter(v)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Week">
                {periodFilter === "this_week"
                  ? `This week (${format(periodRange.start, "d MMM")} – ${format(periodRange.end, "d MMM")})`
                  : `Last week (${format(periodRange.start, "d MMM")} – ${format(periodRange.end, "d MMM")})`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This week</SelectItem>
              <SelectItem value="last_week">Last week</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleCreateRun}
            disabled={createRunMutation.isPending || runAlreadyExistsForPeriod}
            title={runAlreadyExistsForPeriod ? "A run already exists for this week" : undefined}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create payment run
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment runs yet. Create one for a week above.</p>
            ) : (
              <ul className="space-y-1">
                {runs.map((run) => (
                  <li key={run.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRunId(run.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedRun?.id === run.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {format(run.periodStart, "MMM d")} – {format(run.periodEnd, "MMM d, yyyy")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              {selectedRun
                ? `Payment list: ${format(selectedRun.periodStart, "MMM d")} – ${format(selectedRun.periodEnd, "MMM d, yyyy")}`
                : "Select a run"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedRun ? (
              <p className="text-sm text-muted-foreground">Select a payment run from the list to see items.</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in this run (no completed jobs in this week).</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professional</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Bank details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const pro = professionalMap.get(item.professionalId);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{pro?.name ?? item.professionalId}</TableCell>
                        <TableCell className="text-right">£{item.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <BankDetailsCell professional={pro} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === "paid" ? "default" : "secondary"}
                            className={item.status === "paid" ? "bg-green-600 hover:bg-green-600" : ""}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkPaid(item)}
                              disabled={markPaidMutation.isPending}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Mark as paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
