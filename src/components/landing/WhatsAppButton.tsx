import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SITE_CONFIG } from "@/lib/landing-config";
import { cn } from "@/lib/utils";

const WHATSAPP_LINK = `${SITE_CONFIG.whatsappLink}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`;

/**
 * Floating WhatsApp button — fixed bottom-right, pulse animation, opens WhatsApp with pre-filled message.
 */
export function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft-lg md:h-14 md:w-14",
              "opacity-0 animate-in fade-in-0 zoom-in-95 duration-500 fill-mode-forwards",
              "hover:scale-110 focus:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Chat with us on WhatsApp"
            data-track="whatsapp-click"
          >
            <span
              className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"
              aria-hidden
            />
            <MessageCircle className="relative h-6 w-6 md:h-7 md:w-7" aria-hidden />
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-medium">
          Chat with us on WhatsApp
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
