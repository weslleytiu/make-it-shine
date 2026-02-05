import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, UserCog, Calendar, FileText, PoundSterling, Sparkles } from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/professionals", label: "Professionals", icon: UserCog },
    { href: "/jobs", label: "Jobs", icon: Calendar },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/finance", label: "Finance", icon: PoundSterling },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border/60 shadow-soft">
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
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href ||
                        (item.href !== "/" && location.pathname.startsWith(item.href));
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
            <div className="p-4 border-t border-border/60">
                <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
            </div>
        </div>
    );
}
