import { useState, useRef, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { JobDialog } from "./JobDialog";
import { type Job } from "@/lib/schemas";
import { cn } from "@/lib/utils";

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
    const getProName = (id: string) => professionals?.find((p) => p.id === id)?.name.split(" ")[0] || "Unknown Pro";

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

    const selectedDayJobs =
        jobs?.filter((job) => isSameDay(job.date, selectedDay)).sort((a, b) => a.startTime.localeCompare(b.startTime)) ||
        [];

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
                            jobs?.filter((job) => isSameDay(job.date, day)).length ?? 0;
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
                        {selectedDayJobs.map((job) => (
                            <button
                                key={job.id}
                                type="button"
                                onClick={() => handleEditJob(job)}
                                className={cn(
                                    "w-full rounded-lg border p-3 text-left transition-opacity active:opacity-90",
                                    "min-h-[72px] touch-manipulation",
                                    getStatusColor(job.status)
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-foreground">{job.startTime}</div>
                                        <div className="mt-0.5 truncate font-medium">{getClientName(job.clientId)}</div>
                                        <div className="mt-0.5 text-sm text-muted-foreground">{getProName(job.professionalId)}</div>
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
                    const dayJobs =
                        jobs?.filter((job) => isSameDay(job.date, day)).sort((a, b) => a.startTime.localeCompare(b.startTime)) ||
                        [];
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
                                {dayJobs.map((job) => (
                                    <button
                                        key={job.id}
                                        type="button"
                                        onClick={() => handleEditJob(job)}
                                        className={cn(
                                            "w-full rounded-lg border p-2 text-left text-xs transition-opacity hover:opacity-90",
                                            getStatusColor(job.status)
                                        )}
                                    >
                                        <div className="font-bold">{job.startTime}</div>
                                        <div className="font-semibold truncate">{getClientName(job.clientId)}</div>
                                        <div className="truncate opacity-80">{getProName(job.professionalId)}</div>
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
