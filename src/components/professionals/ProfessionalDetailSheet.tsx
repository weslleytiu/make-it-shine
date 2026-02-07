import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, FileEdit, Trash2, Briefcase } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";
import type { Professional } from "@/lib/schemas";

const DAYS_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<(typeof DAYS_ORDER)[number], string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

interface ProfessionalDetailSheetProps {
  professional: Professional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (professional: Professional) => void;
  onDelete: (id: string) => void;
}

const JOB_STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-muted text-muted-foreground",
};

export function ProfessionalDetailSheet({
  professional,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProfessionalDetailSheetProps) {
  const { data: jobs = [] } = useJobs();
  const { data: clients = [] } = useClients();

  if (!professional) return null;

  const professionalJobs = jobs
    .filter((j) => j.professionalId === professional.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name ?? "—";

  const availability = professional.availability as Record<string, boolean>;
  const statusStyles: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    vacation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    inactive: "bg-muted text-muted-foreground",
  };

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(professional);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this professional?")) {
      onDelete(professional.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="pr-8">{professional.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground/80" />
              <a
                href={`mailto:${professional.email}`}
                className="text-sm text-primary hover:underline truncate"
              >
                {professional.email}
              </a>
            </div>
            {professional.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground/80" />
                <a
                  href={`tel:${professional.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {professional.phone}
                </a>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Rate
            </p>
            <p className="text-lg font-semibold text-foreground">
              £{professional.ratePerHour}/h
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Status
            </p>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[professional.status] ?? statusStyles.inactive}`}
            >
              {professional.status}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Availability
            </p>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {DAYS_ORDER.map((dayKey) => {
                  const isAvailable = availability[dayKey];
                  return (
                    <Tooltip key={dayKey}>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex min-w-[2.5rem] items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium ${
                            isAvailable
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground/50"
                          }`}
                        >
                          {DAY_LABELS[dayKey]}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{DAY_LABELS[dayKey]}: {isAvailable ? "Available" : "Unavailable"}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>

          {/* Jobs performed */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Jobs performed
            </p>
            {professionalJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs yet.</p>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2">Date</TableHead>
                      <TableHead className="py-2">Client</TableHead>
                      <TableHead className="py-2 text-right">Status</TableHead>
                      <TableHead className="py-2 text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionalJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="py-2 text-sm">
                          {format(job.date, "dd/MM/yy")} {job.startTime}
                        </TableCell>
                        <TableCell className="py-2 text-sm truncate max-w-[120px]">
                          {getClientName(job.clientId)}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${JOB_STATUS_STYLES[job.status] ?? JOB_STATUS_STYLES.cancelled}`}
                          >
                            {job.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-right text-sm font-medium">
                          £{(job.totalPrice ?? job.cost ?? 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <FileEdit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
