import { MapPin } from "lucide-react";
import { ContactForm } from "@/components/landing/ContactForm";
import { Button } from "@/components/ui/button";

const areas = [
  "Central London",
  "North London",
  "South London",
  "East London",
  "West London",
  "And surrounding areas",
];

export function ServiceAreas() {
  return (
    <section
      id="areas"
      className="scroll-mt-20 bg-background py-16 md:py-24"
      aria-labelledby="areas-heading"
    >
      <div className="container mx-auto max-w-3xl px-4 text-center md:px-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20 text-secondary" aria-hidden>
          <MapPin className="h-7 w-7" />
        </div>
        <h2
          id="areas-heading"
          className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          Serving All of London
        </h2>
        <p className="mt-3 text-muted-foreground">
          We cover all major areas and postcodes
        </p>
        <ul
          className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-muted-foreground"
          role="list"
        >
          {areas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">
          Not sure if we cover your area?{" "}
          <ContactForm
            trigger={
              <Button variant="link" className="p-0 h-auto font-medium text-primary">
                Contact us to check!
              </Button>
            }
          />
        </p>
      </div>
    </section>
  );
}
