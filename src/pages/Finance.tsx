import { useMemo, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PoundSterling, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function Finance() {
    const { data: jobs, isLoading } = useJobs();
    const [monthFilter, setMonthFilter] = useState("this_month");

    // Calculate dates based on filter
    const dateRange = useMemo(() => {
        const now = new Date();
        if (monthFilter === "last_month") {
            const lastMonth = subMonths(now, 1);
            return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
        }
        // distinct past months could be added
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }, [monthFilter]);

    const stats = useMemo(() => {
        if (!jobs) return { revenue: 0, cost: 0, profit: 0, count: 0, transactions: [] };

        const relevantJobs = jobs.filter(job => {
            // Only count completed work for finance
            const isCompleted = job.status === "completed";
            const isInDateRange = isWithinInterval(job.date, dateRange);
            return isCompleted && isInDateRange;
        });

        // Sort by date desc
        relevantJobs.sort((a, b) => b.date.getTime() - a.date.getTime());

        const revenue = relevantJobs.reduce((sum, job) => sum + (job.totalPrice || 0), 0);
        const cost = relevantJobs.reduce((sum, job) => sum + (job.cost || 0), 0);

        return {
            revenue,
            cost,
            profit: revenue - cost,
            count: relevantJobs.length,
            transactions: relevantJobs
        };
    }, [jobs, dateRange]);

    if (isLoading) return <div>Loading financial data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="page-title">Financial Overview</h2>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <PoundSterling className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">£{stats.revenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            For {stats.count} completed jobs
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cost (Cleaners)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-£{stats.cost.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Cleaner payouts
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        {stats.profit >= 0 ?
                            <TrendingUp className="h-4 w-4 text-green-500" /> :
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        }
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            £{stats.profit.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.profit > 0 ? "+ Margin" : "Loss"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Transactions (Completed Jobs)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Profit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No completed jobs in this period.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stats.transactions.map((job) => {
                                    const profit = (job.totalPrice || 0) - (job.cost || 0);
                                    return (
                                        <TableRow key={job.id}>
                                            <TableCell>{format(job.date, "dd/MM/yyyy")}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">£{job.totalPrice?.toFixed(2)}</TableCell>
                                            <TableCell className="text-right text-red-600">-£{job.cost?.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                £{profit.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
