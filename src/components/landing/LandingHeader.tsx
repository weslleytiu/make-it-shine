import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/landing/ContactForm";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

function smoothScrollTo(hash: string) {
  const el = document.querySelector(hash);
  el?.scrollIntoView({ behavior: "smooth" });
}

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 border-b border-border/60 bg-background/95 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground"
          aria-label="Make it Shine - Home"
        >
          <img
            src="/logo.jpeg"
            alt=""
            className="h-10 w-auto object-contain"
            width={120}
            height={40}
          />
          <span className="hidden sm:inline">Make it Shine</span>
        </Link>

        <nav
          className="hidden md:flex md:items-center md:gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
          {user ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
          <ContactForm
            trigger={
              <Button size="sm" className="shrink-0" data-track="cta-header">
                Get Quote
              </Button>
            }
            trackOpen="cta-header"
          />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
          <ContactForm
            trigger={
              <Button size="sm" className="shrink-0">
                Quote
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t border-border/60 bg-background",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav
          className="flex flex-col gap-1 px-4 py-4"
          aria-label="Mobile navigation"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo(item.href);
                setMobileOpen(false);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
