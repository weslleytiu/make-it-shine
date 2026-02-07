import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/landing/ContactForm";
import { SITE_CONFIG } from "@/lib/landing-config";

const pricingItems = [
  { label: "Residential Cleaning", value: `From £${SITE_CONFIG.pricing.residential}/hour` },
  { label: "Commercial Cleaning", value: `From £${SITE_CONFIG.pricing.commercial}/hour` },
  { label: "Deep Cleaning", value: "Custom quotes available" },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-background py-16 md:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="container mx-auto max-w-2xl px-4 md:px-6">
        <header className="text-center">
          <h2
            id="pricing-heading"
            className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Transparent Pricing
          </h2>
          <p className="mt-3 text-muted-foreground">
            No hidden fees. Pay only for the hours you need.
          </p>
        </header>
        <ul
          className="mt-10 space-y-4 rounded-lg border border-border/60 bg-card p-6 shadow-soft"
          role="list"
        >
          {pricingItems.map((item) => (
            <li
              key={item.label}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 last:border-0 last:pb-0 pb-4 last:pb-0"
            >
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Prices may vary based on location and specific requirements. Contact us
          for a personalised quote.
        </p>
        <div className="mt-8 flex justify-center">
          <ContactForm
            trigger={
              <Button size="lg" data-track="cta-get-quote-pricing">
                Get Your Free Quote
              </Button>
            }
            trackOpen="cta-get-quote-pricing"
          />
        </div>
      </div>
    </section>
  );
}
