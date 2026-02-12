import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useJobs, useUpdateJob } from "@/hooks/useJobs";
import { useQuotes, useUpdateQuote } from "@/hooks/useQuotes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCog, Calendar, Clock, Check } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, format, isAfter, isSameDay } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Quote } from "@/types/landing";

export default function Dashboard() {
    const { data: clients } = useClients();
    const { data: pros } = useProfessionals();
    const { data: jobs } = useJobs();
    const { data: quotes } = useQuotes();
    const updateQuote = useUpdateQuote();
    const updateJob = useUpdateJob();

    const pendingQuotes = useMemo(
        () =>
            quotes?.filter(
                (q) =>
                    q.status === "pending" ||
                    (q.status === "approved" && !q.professionalId)
            ) ?? [],
        [quotes]
    );

    const stats = useMemo(() => {
        const activeClients = clients?.filter(c => c.status === "active").length || 0;
        const activePros = pros?.filter(p => p.status === "active").length || 0;

        const now = new Date();
        const startWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endWeek = endOfWeek(now, { weekStartsOn: 1 });

        const jobsThisWeek = jobs?.filter(j => isWithinInterval(j.date, { start: startWeek, end: endWeek })).length || 0;

        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const todayJobs =
            jobs
                ?.filter(
                    (j) =>
                        (j.status === "scheduled" || j.status === "in_progress") &&
                        isSameDay(j.date, now)
                )
                .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")) ?? [];

        const upcomingJobs =
            jobs
                ?.filter((j) => {
                    return (
                        (j.status === "scheduled" || j.status === "in_progress") &&
                        isAfter(j.date, todayStart)
                    );
                })
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5) ?? [];

        return {
            activeClients,
            activePros,
            jobsThisWeek,
            todayJobs,
            upcomingJobs,
        };
    }, [clients, pros, jobs]);

    const getClientName = (id: string) => clients?.find(c => c.id === id)?.name || "Unknown";
    const getProName = (id: string) => pros?.find(p => p.id === id)?.name || "Unassigned";

    return (
        <div className="space-y-6">
            <h2 className="page-title">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeClients}</div>
                        <p className="text-xs text-muted-foreground">Total active contracts</p>
                    </CardContent>
                </Card>
                <Card className="transition-shadow hover:shadow-soft">
                    <Link to="/dashboard/professionals" className="block">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Professionals</CardTitle>
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activePros}</div>
                            <p className="text-xs text-muted-foreground">Active cleaners</p>
                        </CardContent>
                    </Link>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs this Week</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.jobsThisWeek}</div>
                        <p className="text-xs text-muted-foreground">Scheduled Mon-Sun</p>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Jobs — above Upcoming */}
            <Card>
                <CardHeader>
                    <CardTitle>Today&apos;s Jobs</CardTitle>
                    <CardDescription>
                        Scheduled and in-progress jobs for today.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Date/Time</TableHead>
                                <TableHead>Professional</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.todayJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No jobs scheduled for today.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stats.todayJobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{getClientName(job.clientId)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                {format(job.date, "EEE d MMM")} at {job.startTime}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                to={`/dashboard/professionals/${job.professionalId}`}
                                                className="text-primary hover:underline"
                                            >
                                                {getProName(job.professionalId)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5"
                                                onClick={() => updateJob.mutate({ id: job.id!, data: { status: "completed" } })}
                                                disabled={updateJob.isPending && updateJob.variables?.id === job.id}
                                            >
                                                {updateJob.isPending && updateJob.variables?.id === job.id ? (
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                                Done
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Upcoming Jobs</CardTitle>
                        <CardDescription>
                            Your next 5 scheduled appointments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Date/Time</TableHead>
                                    <TableHead>Professional</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.upcomingJobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No upcoming jobs.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.upcomingJobs.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium">{getClientName(job.clientId)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {format(job.date, "EEE d MMM")} at {job.startTime}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    to={`/dashboard/professionals/${job.professionalId}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {getProName(job.professionalId)}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5"
                                                    onClick={() => updateJob.mutate({ id: job.id!, data: { status: "completed" } })}
                                                    disabled={updateJob.isPending && updateJob.variables?.id === job.id}
                                                >
                                                    {updateJob.isPending && updateJob.variables?.id === job.id ? (
                                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5" />
                                                    )}
                                                    Done
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="text-sm text-muted-foreground">
                            Use the sidebar to manage specific entities.
                            <ul className="list-disc pl-4 mt-2 space-y-1">
                                <li>Check <strong>Finance</strong> for monthly reports.</li>
                                <li>Use <strong>Jobs</strong> to drag & drop or view weekly grid.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {pendingQuotes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Quotes to approve</CardTitle>
                        <CardDescription>
                            Approve or reject and assign a cleaner. From landing page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Postcode</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Cleaner</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingQuotes.map((quote) => (
                                    <QuoteRow
                                        key={quote.id}
                                        quote={quote}
                                        professionals={pros ?? []}
                                        onUpdate={(updates) =>
                                            updateQuote.mutate({ id: quote.id, data: updates })
                                        }
                                        isUpdating={updateQuote.isPending}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function QuoteRow({
    quote,
    professionals,
    onUpdate,
    isUpdating,
}: {
    quote: Quote;
    professionals: { id: string; name: string }[];
    onUpdate: (updates: Partial<Quote>) => void;
    isUpdating: boolean;
}) {
    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{quote.fullName}</div>
                <div className="text-xs text-muted-foreground">{quote.email} · {quote.phone}</div>
            </TableCell>
            <TableCell className="capitalize">{quote.serviceType.replace(/_/g, " ")}</TableCell>
            <TableCell>{quote.postcode}</TableCell>
            <TableCell>
                <Badge
                    variant={
                        quote.status === "approved"
                            ? "default"
                            : quote.status === "rejected"
                              ? "destructive"
                              : "secondary"
                    }
                >
                    {quote.status}
                </Badge>
            </TableCell>
            <TableCell>
                <Select
                    value={quote.professionalId ?? ""}
                    onValueChange={(id) => onUpdate({ professionalId: id || null })}
                    disabled={isUpdating}
                >
                    <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Assign cleaner" />
                    </SelectTrigger>
                    <SelectContent>
                        {professionals.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="text-right">
                {quote.status === "pending" && (
                    <div className="flex justify-end gap-1">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => onUpdate({ status: "approved" })}
                            disabled={isUpdating}
                        >
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdate({ status: "rejected" })}
                            disabled={isUpdating}
                        >
                            Reject
                        </Button>
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
}
