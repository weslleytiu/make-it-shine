import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Clock,
  PoundSterling,
  Shield,
  Leaf,
  Zap,
} from "lucide-react";

const benefits = [
  {
    id: "experienced",
    icon: Award,
    title: "Experienced Professionals",
    text: "Our vetted cleaners have years of experience and training. Quality guaranteed.",
  },
  {
    id: "flexible",
    icon: Clock,
    title: "Flexible Scheduling",
    text: "Book weekly, fortnightly, or one-off cleans. We work around your schedule.",
  },
  {
    id: "pricing",
    icon: PoundSterling,
    title: "Competitive Pricing",
    text: "Transparent hourly rates with no hidden fees. Pay only for what you need.",
  },
  {
    id: "insured",
    icon: Shield,
    title: "Fully Insured",
    text: "Complete peace of mind with full insurance coverage and verified cleaners.",
  },
  {
    id: "eco",
    icon: Leaf,
    title: "Eco-Friendly Options",
    text: "Safe, non-toxic cleaning products available upon request.",
  },
  {
    id: "same-day",
    icon: Zap,
    title: "Same-Day Service",
    text: "Need cleaning urgently? We offer same-day and next-day availability.",
  },
] as const;

export function WhyChooseUs() {
  return (
    <section
      id="why-us"
      className="scroll-mt-20 bg-background py-16 md:py-24"
      aria-labelledby="why-us-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="why-us-heading"
            className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Why Londoners Trust Make it Shine
          </h2>
        </header>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card
                key={b.id}
                className="border-border/60 shadow-soft transition-shadow hover:shadow-soft-lg"
              >
                <CardContent className="flex gap-4 p-6">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-secondary"
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
