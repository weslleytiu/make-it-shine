import { useState, useMemo } from "react";
import { format, startOfDay, isBefore, addWeeks } from "date-fns";
import { useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JobDialog } from "./JobDialog";
import type { Job } from "@/lib/schemas";
import { dateToLocalDateString } from "@/lib/utils";

const PAGE_SIZE = 6;

type JobOccurrence = { job: Job; date: Date };

function getOccurrenceStatus(occ: JobOccurrence): string {
    if (occ.job.type !== "recurring" || !occ.job.occurrenceStatuses) return occ.job.status;
    const dateKey = dateToLocalDateString(occ.date);
    return occ.job.occurrenceStatuses[dateKey] ?? occ.job.status;
}

function getPastCompletedOccurrences(jobs: Job[] | undefined): JobOccurrence[] {
    if (!jobs?.length) return [];
    const today = startOfDay(new Date());
    const result: JobOccurrence[] = [];

    for (const job of jobs) {
        if (job.type === "one_time") {
            if (isBefore(job.date, today) && job.status === "completed") {
                result.push({ job, date: job.date });
            }
            continue;
        }
        // Recurring: every past occurrence (same weekday, >= job.date, < today) that is completed
        let d = new Date(startOfDay(job.date));
        while (isBefore(d, today)) {
            const occ: JobOccurrence = { job, date: new Date(d) };
            if (getOccurrenceStatus(occ) === "completed") result.push(occ);
            d = addWeeks(d, 1);
        }
    }

    return result.sort((a, b) => {
        const byDate = b.date.getTime() - a.date.getTime();
        if (byDate !== 0) return byDate;
        return b.job.startTime.localeCompare(a.job.startTime);
    });
}

export function PastCompletedJobs() {
    const [page, setPage] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [selectedOccurrenceDate, setSelectedOccurrenceDate] = useState<Date | null>(null);

    const { data: jobs, isLoading } = useJobs();
    const { data: clients } = useClients();
    const { data: professionals } = useProfessionals();

    const pastCompleted = useMemo(() => getPastCompletedOccurrences(jobs), [jobs]);
    const totalPages = Math.max(1, Math.ceil(pastCompleted.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const paginated = useMemo(
        () =>
            pastCompleted.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
        [pastCompleted, currentPage]
    );

    const getClientName = (id: string) => clients?.find((c) => c.id === id)?.name ?? "Unknown Client";
    const getProNameList = (ids: string[]): string[] =>
        ids.length === 0
            ? ["—"]
            : ids.map((id) => professionals?.find((p) => p.id === id)?.name ?? "—").filter(Boolean);

    const formatDuration = (hours: number) =>
        hours % 1 === 0 ? `${hours}h` : `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
    const formatPrice = (value: number | undefined) =>
        value != null ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value) : null;

    const handleEditJob = (job: Job, occurrenceDate: Date) => {
        setSelectedJob(job);
        setSelectedOccurrenceDate(occurrenceDate);
        setIsDialogOpen(true);
    };

    if (isLoading) return null;

    return (
        <section className="space-y-4 rounded-xl border border-border/60 bg-card p-4 shadow-soft sm:p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground">
                Past completed jobs
                {pastCompleted.length > 0 && (
                    <span className="ml-2 font-normal text-muted-foreground">
                        ({pastCompleted.length} total)
                    </span>
                )}
            </h2>

            {pastCompleted.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No completed jobs in the past yet.
                </p>
            ) : (
                <>
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {paginated.map((occ) => (
                            <li key={`${occ.job.id}-${dateToLocalDateString(occ.date)}`}>
                                <button
                                    type="button"
                                    onClick={() => handleEditJob(occ.job, occ.date)}
                                    className="w-full rounded-lg border border-green-200 bg-green-50/80 p-3 text-left text-sm transition-opacity hover:opacity-90 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-100"
                                >
                                    <div className="font-semibold text-foreground">
                                        {format(occ.date, "EEE, MMM d")} · {occ.job.startTime}
                                    </div>
                                    <div className="mt-0.5 truncate font-medium">
                                        {getClientName(occ.job.clientId)}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                        <span title="Duration">{formatDuration(occ.job.durationHours)}</span>
                                        <span aria-hidden>·</span>
                                        <span title="Number of professionals">
                                            {occ.job.professionalIds.length} professional
                                            {occ.job.professionalIds.length !== 1 ? "s" : ""}
                                        </span>
                                        {formatPrice(occ.job.totalPrice) != null && (
                                            <>
                                                <span aria-hidden>·</span>
                                                <span className="font-medium text-foreground/90" title="Total price">
                                                    {formatPrice(occ.job.totalPrice)}
                                                </span>
                                            </>
                                        )}
                                        <span aria-hidden>·</span>
                                        <span className="capitalize">
                                            {occ.job.serviceKind === "deep_clean" ? "Deep clean" : "Regular"}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex flex-col text-xs text-muted-foreground">
                                        {getProNameList(occ.job.professionalIds).map((name, i) => (
                                            <span key={i} className="truncate">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                aria-label="Previous page"
                                className="h-9 w-9"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[8rem] text-center text-sm text-muted-foreground">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                aria-label="Next page"
                                className="h-9 w-9"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            <JobDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                job={selectedJob}
                initialDate={selectedOccurrenceDate ?? new Date()}
                initialOccurrenceDate={selectedOccurrenceDate}
            />
        </section>
    );
}
