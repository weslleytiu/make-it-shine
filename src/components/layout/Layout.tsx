import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar, navItems } from "./Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";

export function Layout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="w-64 p-0 flex flex-col border-r border-border/60 bg-card">
                    <div className="flex h-20 flex-col justify-center px-6 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-secondary flex-shrink-0" aria-hidden />
                            <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">MIS</span>
                        </div>
                        <span className="mt-0.5 font-serif text-xs font-medium tracking-wide text-muted-foreground">
                            Make It Shine
                        </span>
                    </div>
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navItems.map((item) => {
                            const isActive =
                                location.pathname === item.href ||
                                (item.href !== "/" && location.pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
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
                </SheetContent>
            </Sheet>
            <div className="flex flex-1 flex-col min-w-0">
                <header className="md:hidden flex h-14 flex-shrink-0 items-center gap-3 border-b border-border/60 bg-card px-4 shadow-soft">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="h-4 w-4 text-secondary flex-shrink-0" aria-hidden />
                        <span className="font-serif text-xl font-semibold tracking-tight text-foreground truncate">MIS</span>
                    </div>
                </header>
                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
