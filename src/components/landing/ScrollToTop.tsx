import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 400;

/**
 * Scroll-to-top button — appears after scrolling down, smooth scroll to top on click.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn(
        "fixed bottom-6 right-24 z-40 h-12 w-12 rounded-full shadow-soft",
        "opacity-0 animate-in fade-in-0 zoom-in-95 duration-300 fill-mode-forwards",
        "hover:bg-secondary/90 md:right-24"
      )}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      data-track="scroll-to-top"
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </Button>
  );
}
