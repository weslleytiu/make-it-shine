import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Users, UserCog, Calendar, FileText, PoundSterling, Sparkles, Landmark, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/professionals", label: "Professionals", icon: UserCog },
    { href: "/dashboard/jobs", label: "Jobs", icon: Calendar },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/dashboard/finance", label: "Finance", icon: PoundSterling },
    { href: "/dashboard/payment-runs", label: "Payment runs", icon: Landmark },
];

export function useNavItems() {
    const { profile } = useAuth();
    return [
        ...navItems,
        ...(profile?.role === "admin" ? [{ href: "/dashboard/users", label: "Users", icon: Shield }] : []),
    ];
}

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const items = useNavItems();

    async function handleSignOut() {
        await signOut();
        navigate("/login", { replace: true });
    }

    return (
        <div className="hidden md:flex h-full w-64 flex-col bg-card border-r border-border/60 shadow-soft">
            <div className="flex h-20 flex-col justify-center px-6 border-b border-border/60">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-secondary flex-shrink-0" aria-hidden />
                    <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                        MIS
                    </span>
                </div>
                <span className="mt-0.5 font-serif text-xs font-medium tracking-wide text-muted-foreground">
                    Make It Shine
                </span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {items.map((item) => {
                    const isActive = location.pathname === item.href ||
                        (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="space-y-2 border-t border-border/60 p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </Button>
                <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
            </div>
        </div>
    );
}
