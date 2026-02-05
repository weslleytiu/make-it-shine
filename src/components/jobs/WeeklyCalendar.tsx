import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { JobDialog } from "./JobDialog";
import { type Job } from "@/lib/schemas";

export function WeeklyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [initialDialogDate, setInitialDialogDate] = useState<Date>(new Date());

    const { data: jobs, isLoading } = useJobs();
    const { data: clients } = useClients();
    const { data: professionals } = useProfessionals();

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

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

    const getClientName = (id: string) => clients?.find(c => c.id === id)?.name || "Unknown Client";
    const getProName = (id: string) => professionals?.find(p => p.id === id)?.name.split(" ")[0] || "Unknown Pro";

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
            case "completed": return "bg-green-100 text-green-800 border-green-200";
            case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) return <div>Loading schedule...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">
                        {format(startDate, "MMM d")} - {format(addDays(startDate, 6), "MMM d, yyyy")}
                    </h2>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={() => handleCreateJob(new Date())}>
                    <Plus className="mr-2 h-4 w-4" /> New Job
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-2 min-h-[600px]">
                {weekDays.map((day) => {
                    const dayJobs = jobs?.filter(job => isSameDay(job.date, day))
                        .sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={day.toISOString()} className={`flex flex-col gap-2 rounded-lg border bg-card p-2 ${isToday ? "border-primary/50 bg-primary/5" : ""}`}>
                            <div className="text-center pb-2 border-b">
                                <div className="text-sm font-medium text-muted-foreground">
                                    {format(day, "EEE")}
                                </div>
                                <div className={`text-2xl font-bold ${isToday ? "text-primary" : ""}`}>
                                    {format(day, "d")}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2 overflow-y-auto">
                                {dayJobs.map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => handleEditJob(job)}
                                        className={`p-2 rounded text-xs border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(job.status)}`}
                                    >
                                        <div className="font-bold">{job.startTime}</div>
                                        <div className="font-semibold truncate">{getClientName(job.clientId)}</div>
                                        <div className="text-xs opacity-75 truncate">{getProName(job.professionalId)}</div>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="w-full h-8 text-xs text-muted-foreground hover:text-primary"
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
