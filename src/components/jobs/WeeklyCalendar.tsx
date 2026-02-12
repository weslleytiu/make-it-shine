import { useState, useRef, useEffect, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, getDay, isWithinInterval, isBefore } from "date-fns";
import { useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { JobDialog } from "./JobDialog";
import { type Job } from "@/lib/schemas";
import { cn, dateToLocalDateString } from "@/lib/utils";

/** One job occurrence on a specific date (real for one-time, virtual for recurring). */
export type JobOccurrence = { job: Job; date: Date };

/**
 * Expands jobs into occurrences for the visible week.
 * One-time jobs: one occurrence on their date if in range.
 * Recurring jobs: one occurrence per same weekday in the week that is on or after the job start date.
 */
function getJobOccurrencesForWeek(jobs: Job[] | undefined, weekStart: Date): JobOccurrence[] {
    if (!jobs?.length) return [];
    const weekEnd = addDays(weekStart, 6);
    const result: JobOccurrence[] = [];
    const jobDayOfWeek = (d: Date) => getDay(d); // 0 = Sun, 1 = Mon, ...

    for (const job of jobs) {
        if (job.type === "one_time") {
            if (isWithinInterval(job.date, { start: weekStart, end: weekEnd })) {
                result.push({ job, date: job.date });
            }
        } else {
            // Recurring: same weekday, every week from job.date onwards
            for (let i = 0; i < 7; i++) {
                const day = addDays(weekStart, i);
                if (jobDayOfWeek(day) !== jobDayOfWeek(job.date)) continue;
                if (isBefore(day, job.date)) continue;
                if (isWithinInterval(day, { start: weekStart, end: weekEnd })) {
                    result.push({ job, date: day });
                }
            }
        }
    }
    return result;
}

function occurrenceKey(occ: JobOccurrence): string {
    return `${occ.job.id}-${dateToLocalDateString(occ.date)}`;
}

export function WeeklyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [initialDialogDate, setInitialDialogDate] = useState<Date>(new Date());
    const weekStripRef = useRef<HTMLDivElement>(null);

    const { data: jobs, isLoading } = useJobs();
    const { data: clients } = useClients();
    const { data: professionals } = useProfessionals();

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    // Keep selected day in sync when changing week
    useEffect(() => {
        const inCurrentWeek = weekDays.some((d) => isSameDay(d, selectedDay));
        if (!inCurrentWeek) setSelectedDay(startDate);
    }, [currentDate]);

    const handlePreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

    const handleCreateJob = (date: Date) => {
        setInitialDialogDate(date);
        setSelectedJob(null);
        setIsDialogOpen(true);
    };

    const handleEditJob = (job: Job) => {
        setSelectedJob(job);
        setIsDialogOpen(true);
    };

    const getClientName = (id: string) => clients?.find((c) => c.id === id)?.name || "Unknown Client";
    const getProNameList = (ids: string[]): string[] =>
        ids.length === 0 ? ["—"] : ids.map((id) => professionals?.find((p) => p.id === id)?.name ?? "—").filter(Boolean);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled":
                return "bg-primary/10 text-primary border-primary/20";
            case "completed":
                return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/50";
            case "in_progress":
                return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50";
            case "cancelled":
                return "bg-muted text-muted-foreground border-border";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const weekOccurrences = useMemo(
        () => getJobOccurrencesForWeek(jobs, startDate),
        [jobs, startDate]
    );

    const selectedDayOccurrences = useMemo(
        () =>
            weekOccurrences
                .filter((occ) => isSameDay(occ.date, selectedDay))
                .sort((a, b) => a.job.startTime.localeCompare(b.job.startTime)),
        [weekOccurrences, selectedDay]
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <p className="mt-3 text-sm font-medium">Loading schedule...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header: week nav + New Job */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousWeek}
                        className="h-10 w-10 shrink-0 border-border/60 shadow-soft sm:h-9 sm:w-9"
                        aria-label="Previous week"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="min-w-0 text-base font-semibold tabular-nums sm:text-xl">
                        <span className="hidden sm:inline">
                            {format(startDate, "MMM d")} – {format(addDays(startDate, 6), "MMM d, yyyy")}
                        </span>
                        <span className="sm:hidden">Week of {format(startDate, "MMM d")}</span>
                    </h2>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextWeek}
                        className="h-10 w-10 shrink-0 border-border/60 shadow-soft sm:h-9 sm:w-9"
                        aria-label="Next week"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button
                    onClick={() => handleCreateJob(new Date())}
                    className="h-11 w-full shrink-0 shadow-soft sm:h-9 sm:w-auto sm:min-w-[120px]"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Job
                </Button>
            </div>

            {/* Mobile: day strip + single-day job list */}
            <div className="md:hidden space-y-4">
                <div
                    ref={weekStripRef}
                    className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                    style={{ scrollSnapType: "x proximity" }}
                >
                    {weekDays.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDay);
                        const dayJobCount =
                            weekOccurrences.filter((occ) => isSameDay(occ.date, day)).length;
                        return (
                            <button
                                key={day.toISOString()}
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                style={{ scrollSnapAlign: "start" }}
                                className={cn(
                                    "flex min-w-[56px] flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 py-3 px-2 transition-all",
                                    "border-border/60 bg-card shadow-soft",
                                    isSelected && "border-primary bg-primary/5 shadow-soft-lg",
                                    isToday && !isSelected && "border-primary/40 bg-primary/5"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-xs font-medium uppercase tracking-wider",
                                        isSelected ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {format(day, "EEE")}
                                </span>
                                <span
                                    className={cn(
                                        "mt-0.5 text-xl font-bold tabular-nums",
                                        isToday ? "text-primary" : "text-foreground"
                                    )}
                                >
                                    {format(day, "d")}
                                </span>
                                {dayJobCount > 0 && (
                                    <span className="mt-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
                                        {dayJobCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft">
                    <p className="mb-3 font-serif text-lg font-semibold text-foreground">
                        {format(selectedDay, "EEEE, MMM d")}
                    </p>
                    <div className="space-y-2">
                        {selectedDayOccurrences.map((occ) => (
                            <button
                                key={occurrenceKey(occ)}
                                type="button"
                                onClick={() => handleEditJob(occ.job)}
                                className={cn(
                                    "w-full rounded-lg border p-3 text-left transition-opacity active:opacity-90",
                                    "min-h-[72px] touch-manipulation",
                                    getStatusColor(occ.job.status)
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-foreground">{occ.job.startTime}</div>
                                        <div className="mt-0.5 truncate font-medium">{getClientName(occ.job.clientId)}</div>
                                        <div className="mt-0.5 flex flex-col text-sm text-muted-foreground">
                                            {getProNameList(occ.job.professionalIds).map((name, i) => (
                                                <span key={i} className="truncate">{name}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                        <Button
                            variant="ghost"
                            className="h-12 w-full text-muted-foreground hover:bg-primary/5 hover:text-primary"
                            onClick={() => handleCreateJob(selectedDay)}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add job
                        </Button>
                    </div>
                </div>
            </div>

            {/* Desktop: 7-column grid */}
            <div className="hidden md:grid md:grid-cols-7 min-h-[520px] gap-3">
                {weekDays.map((day) => {
                    const dayOccurrences = weekOccurrences
                        .filter((occ) => isSameDay(occ.date, day))
                        .sort((a, b) => a.job.startTime.localeCompare(b.job.startTime));
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-soft",
                                "border-border/60",
                                isToday && "border-primary/40 bg-primary/5"
                            )}
                        >
                            <div className="text-center pb-2 border-b border-border/60">
                                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {format(day, "EEE")}
                                </div>
                                <div className={cn("text-xl font-bold tabular-nums", isToday && "text-primary")}>
                                    {format(day, "d")}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto">
                                {dayOccurrences.map((occ) => (
                                    <button
                                        key={occurrenceKey(occ)}
                                        type="button"
                                        onClick={() => handleEditJob(occ.job)}
                                        className={cn(
                                            "w-full rounded-lg border p-2 text-left text-xs transition-opacity hover:opacity-90",
                                            getStatusColor(occ.job.status)
                                        )}
                                    >
                                        <div className="font-bold">{occ.job.startTime}</div>
                                        <div className="font-semibold truncate">{getClientName(occ.job.clientId)}</div>
                                        <div className="flex flex-col opacity-80">
                                            {getProNameList(occ.job.professionalIds).map((name, i) => (
                                                <span key={i} className="truncate text-xs">{name}</span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-muted-foreground hover:text-primary"
                                    onClick={() => handleCreateJob(day)}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <JobDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                job={selectedJob}
                initialDate={initialDialogDate}
            />
        </div>
    );
}
