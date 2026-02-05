import { useState } from "react";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, FileEdit, Trash2 } from "lucide-react";
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
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="page-title">Clients</h2>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-card">
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
