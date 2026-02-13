import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import type { Profile, ProfileRole } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES: ProfileRole[] = ["admin", "collaborator", "client"];

async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

async function updateProfileRole(profileId: string, role: ProfileRole): Promise<void> {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
  if (error) throw error;
}

export default function Users() {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });

  const updateRole = useMutation({
    mutationFn: ({ profileId, role }: { profileId: string; role: ProfileRole }) =>
      updateProfileRole(profileId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Role updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update role");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load users: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">Manage system users and roles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>Email, name, role and last updated. Only admins can change roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(profiles ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.email ?? "—"}</TableCell>
                  <TableCell>{p.name ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={p.role}
                      onValueChange={(value) =>
                        updateRole.mutate({ profileId: p.id, role: value as ProfileRole })
                      }
                      disabled={updateRole.isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!profiles || profiles.length === 0) && (
            <p className="py-8 text-center text-muted-foreground">No users yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
