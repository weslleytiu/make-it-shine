import { useState } from "react";
import { toast } from "@/lib/toast";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, FileEdit, Trash2, Mail, PoundSterling } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ClientDialog } from "./ClientDialog";
import type { Client } from "@/lib/schemas";

export function ClientList() {
    const { data: clients, isLoading } = useClients();
    const deleteMutation = useDeleteClient();
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    if (isLoading) return <div>Loading clients...</div>;

    const filteredClients = clients?.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) ||
            client.email.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "all" || client.type === filterType;
        return matchesSearch && matchesType;
    }) || [];

    const handleAdd = () => {
        setSelectedClient(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this client?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Client deleted."),
                onError: () => toast.error("Failed to delete client."),
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <h2 className="page-title text-2xl sm:text-3xl">Clients</h2>
                <Button onClick={handleAdd} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Mobile: cards */}
            <div className="grid gap-3 md:hidden">
                {filteredClients.length === 0 ? (
                    <div className="rounded-lg border border-border/60 bg-card p-8 text-center text-muted-foreground shadow-soft">
                        No clients found.
                    </div>
                ) : (
                    filteredClients.map((client) => (
                        <Card key={client.id} className="shadow-soft overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate">{client.name}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                            {client.email}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                                                <FileEdit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant={client.type === "commercial" ? "secondary" : "default"}>
                                        {client.type}
                                    </Badge>
                                    <Badge variant={client.status === "active" ? "outline" : "destructive"}>
                                        {client.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {client.contractType === "on_demand" ? "On Demand" : client.frequency || "Fixed"}
                                </p>
                                <p className="text-sm font-medium flex items-center gap-1.5">
                                    <PoundSterling className="h-3.5 w-3.5" />
                                    £{client.pricePerHour}/h
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead className="text-right">Rate (£/h)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">
                                        <div>{client.name}</div>
                                        <div className="text-sm text-muted-foreground">{client.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={client.type === "commercial" ? "secondary" : "default"}>
                                            {client.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {client.contractType === "on_demand" ? "On Demand" : client.frequency || "Fixed"}
                                    </TableCell>
                                    <TableCell className="text-right">£{client.pricePerHour}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.status === "active" ? "outline" : "destructive"}>
                                            {client.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(client)}>
                                                    <FileEdit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client.id)}>
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

            <ClientDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                client={selectedClient}
            />
        </div>
    );
}
