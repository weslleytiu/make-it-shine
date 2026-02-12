import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/lib/toast";
import { useProfessionals, useDeleteProfessional } from "@/hooks/useProfessionals";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, FileEdit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfessionalDialog } from "./ProfessionalDialog";
import { ProfessionalCard } from "./ProfessionalCard";
import { ProfessionalDetailSheet } from "./ProfessionalDetailSheet";
import type { Professional } from "@/lib/schemas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ProfessionalList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: professionals, isLoading } = useProfessionals();
    const deleteMutation = useDeleteProfessional();
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [detailProfessional, setDetailProfessional] = useState<Professional | null>(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

    const editId = searchParams.get("edit");
    useEffect(() => {
        if (!editId || !professionals) return;
        const pro = professionals.find((p) => p.id === editId);
        if (pro) {
            setSelectedProfessional(pro);
            setIsDialogOpen(true);
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("edit");
                return next;
            }, { replace: true });
        }
    }, [editId, professionals, setSearchParams]);

    if (isLoading) return <div>Loading professionals...</div>;

    const filteredProfessionals = professionals?.filter(pro => {
        const matchesSearch = pro.name.toLowerCase().includes(search.toLowerCase()) ||
            pro.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === "all" || pro.status === filterStatus;
        return matchesSearch && matchesStatus;
    }) || [];

    const handleAdd = () => {
        setSelectedProfessional(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (pro: Professional) => {
        setSelectedProfessional(pro);
        // Defer opening so DropdownMenu can close first (avoids Radix focus/stacking issues)
        setTimeout(() => setIsDialogOpen(true), 0);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this professional?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Professional deleted."),
                onError: () => toast.error("Failed to delete professional."),
            });
        }
    };

    const openDetail = (pro: Professional) => {
        setDetailProfessional(pro);
        setIsDetailSheetOpen(true);
    };

    const handleDetailEdit = (pro: Professional) => {
        setSelectedProfessional(pro);
        setTimeout(() => setIsDialogOpen(true), 0);
    };

    const DAYS_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const AVAILABLE_DAYS_LABELS: Record<string, string> = {
        mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S"
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="page-title text-2xl sm:text-3xl">Professionals</h2>
                <Button type="button" onClick={handleAdd} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Professional
                </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search professionals..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Mobile: cards */}
            <div className="grid gap-3 md:hidden">
                {filteredProfessionals.length === 0 ? (
                    <div className="rounded-lg border border-border/60 bg-card p-8 text-center text-muted-foreground shadow-soft">
                        No professionals found.
                    </div>
                ) : (
                    filteredProfessionals.map((pro) => (
                        <ProfessionalCard
                            key={pro.id}
                            professional={pro}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={openDetail}
                        />
                    ))
                )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Rate (£/h)</TableHead>
                            <TableHead>Availability</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProfessionals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No professionals found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProfessionals.map((pro) => (
                                <TableRow
                                    key={pro.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => openDetail(pro)}
                                >
                                    <TableCell className="font-medium">
                                        <div>{pro.name}</div>
                                        <div className="text-sm text-muted-foreground">{pro.email}</div>
                                        <div className="text-xs text-muted-foreground">{pro.phone}</div>
                                    </TableCell>
                                    <TableCell>£{pro.ratePerHour}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <TooltipProvider>
                                                {DAYS_ORDER.map(dayKey => {
                                                    const isAvailable = (pro.availability as any)[dayKey];
                                                    return (
                                                        <Tooltip key={dayKey}>
                                                            <TooltipTrigger asChild>
                                                                <div className={`
                                                                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                                                    ${isAvailable
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "bg-muted text-muted-foreground opacity-30"}
                                                                `}>
                                                                    {AVAILABLE_DAYS_LABELS[dayKey]}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{isAvailable ? "Available" : "Unavailable"}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    );
                                                })}
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={pro.status === "active" ? "outline" : "secondary"}>
                                            {pro.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleEdit(pro)}>
                                                    <FileEdit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(pro.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ProfessionalDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                professional={selectedProfessional}
            />
            <ProfessionalDetailSheet
                professional={detailProfessional}
                open={isDetailSheetOpen}
                onOpenChange={setIsDetailSheetOpen}
                onEdit={handleDetailEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
