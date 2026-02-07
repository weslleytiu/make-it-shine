import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useJobs } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCog, Calendar, CheckCircle2, Clock } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, format, isAfter } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
    const { data: clients } = useClients();
    const { data: pros } = useProfessionals();
    const { data: jobs } = useJobs();

    const stats = useMemo(() => {
        const activeClients = clients?.filter(c => c.status === "active").length || 0;
        const activePros = pros?.filter(p => p.status === "active").length || 0;

        const now = new Date();
        const startWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endWeek = endOfWeek(now, { weekStartsOn: 1 });

        const jobsThisWeek = jobs?.filter(j => isWithinInterval(j.date, { start: startWeek, end: endWeek })).length || 0;

        const upcomingJobs = jobs?.filter(j => {
            return (j.status === "scheduled" || j.status === "in_progress") && isAfter(j.date, new Date(new Date().setHours(0, 0, 0, 0)));
        }).sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5) || []; // Next 5 pending jobs

        return {
            activeClients,
            activePros,
            jobsThisWeek,
            upcomingJobs
        };
    }, [clients, pros, jobs]);

    const getClientName = (id: string) => clients?.find(c => c.id === id)?.name || "Unknown";
    const getProName = (id: string) => pros?.find(p => p.id === id)?.name || "Unassigned";

    return (
        <div className="space-y-6">
            <h2 className="page-title">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <Link to="/professionals" className="block">
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for completion rate or another metric */}
                        <div className="text-2xl font-bold">100%</div>
                        <p className="text-xs text-muted-foreground">All jobs handled</p>
                    </CardContent>
                </Card>
            </div>

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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.upcomingJobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
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
                                                    to={`/professionals/${job.professionalId}`}
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
                        {/* 
                            Navigation buttons could go here, but sidebar handles it.
                            Maybe just some text or instructions for now.
                        */}
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
        </div>
    );
}
