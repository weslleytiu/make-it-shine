import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/landing/ContactForm";
import { SITE_CONFIG } from "@/lib/landing-config";

export function Hero() {
  const whatsappLink = `${SITE_CONFIG.whatsappLink}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`;
  const { stats } = SITE_CONFIG;

  return (
    <section
      className="relative overflow-hidden bg-background py-16 md:py-24"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:gap-12 md:px-6">
        <div className="flex flex-col justify-center text-center md:text-left">
          <h1
            id="hero-heading"
            className="font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Professional Cleaning Services in London
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Trusted by {stats.clients} homes and businesses across London. Experienced
            cleaners, flexible scheduling, and sparkling results guaranteed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <ContactForm
              trigger={
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  data-track="cta-get-quote-hero"
                  aria-label="Get your free quote"
                >
                  Get Your Free Quote
                </Button>
              }
              trackOpen="cta-get-quote-hero"
            />
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="w-full sm:w-auto"
              aria-label="Contact us on WhatsApp"
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                data-track="cta-whatsapp-hero"
              >
                WhatsApp Us Now
              </a>
            </Button>
          </div>
          <div
            className="mt-10 flex flex-wrap justify-center gap-6 md:justify-start"
            role="list"
            aria-label="Trust badges"
          >
            <span className="text-sm font-medium text-muted-foreground">
              {stats.cleaners} Expert Cleaners
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Same-Day Availability
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Fully Insured
            </span>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg bg-muted shadow-soft-lg">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85"
              alt="Clean, bright living space — professional cleaning results"
              className="h-full w-full object-cover"
              loading="eager"
              width={800}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
