import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/landing/ContactForm";
import { SITE_CONFIG } from "@/lib/landing-config";

const whatsappLink = `${SITE_CONFIG.whatsappLink}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`;

export function CTASection() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 bg-primary py-16 text-primary-foreground md:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2
          id="cta-heading"
          className="font-serif text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Ready for a Spotless Space?
        </h2>
        <p className="mt-4 text-primary-foreground/90">
          Book your cleaning service today and experience the Make it Shine
          difference.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ContactForm
            trigger={
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-card text-card-foreground hover:bg-card/90"
                data-track="cta-get-quote-final"
              >
                Get Your Free Quote
              </Button>
            }
            trackOpen="cta-get-quote-final"
          />
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
            aria-label="Call us"
          >
            <a href={SITE_CONFIG.phoneLink} data-track="cta-call">
              Call Us: {SITE_CONFIG.phone}
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
            aria-label="Contact us on WhatsApp"
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              data-track="cta-whatsapp-final"
            >
              WhatsApp Us
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
