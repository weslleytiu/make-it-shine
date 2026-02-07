import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Home,
  Building2,
  Sparkles,
  CalendarClock,
  Check,
} from "lucide-react";
const services = [
  {
    id: "residential",
    icon: Home,
    title: "Residential Cleaning",
    description:
      "Regular or one-off cleaning for flats, houses, and apartments. Keep your home spotless.",
    bullets: [
      "Weekly or fortnightly schedules",
      "Deep cleaning available",
      "Eco-friendly products",
    ],
  },
  {
    id: "commercial",
    icon: Building2,
    title: "Commercial Cleaning",
    description:
      "Professional office and business cleaning. Maintain a clean workspace for your team.",
    bullets: [
      "Flexible hours (evenings/weekends)",
      "Offices, shops, restaurants",
      "Customised cleaning plans",
    ],
  },
  {
    id: "deep",
    icon: Sparkles,
    title: "Deep Cleaning",
    description:
      "Intensive cleaning for move-ins, move-outs, or seasonal refreshes.",
    bullets: [
      "Kitchen & bathroom deep clean",
      "Carpet and upholstery",
      "Window cleaning included",
    ],
  },
  {
    id: "maintenance",
    icon: CalendarClock,
    title: "Regular Maintenance",
    description:
      "Consistent cleaning schedule to keep your space always fresh.",
    bullets: [
      "Same cleaner every time",
      "Reliable and punctual",
      "3x weekly options available",
    ],
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-20 bg-muted/30 py-16 md:py-24"
      aria-labelledby="services-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="services-heading"
            className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Our Cleaning Services
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tailored solutions for your home or business
          </p>
        </header>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.id}
                className="flex flex-col border-border/60 shadow-soft"
              >
                <CardHeader>
                  <div
                    className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary"
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-serif text-xl">{s.title}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2" role="list">
                    {s.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
