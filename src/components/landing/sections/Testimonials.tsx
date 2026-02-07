import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: "1",
    text: "Make it Shine transformed my flat! The cleaners are professional, thorough, and always on time. Highly recommend!",
    name: "Sarah M.",
    location: "Kensington",
    rating: 5,
  },
  {
    id: "2",
    text: "We've been using them for our office for 6 months. Excellent service and very reliable team.",
    name: "James L.",
    location: "Canary Wharf",
    rating: 5,
  },
  {
    id: "3",
    text: "Best cleaning service in London! They're flexible with scheduling and the quality is outstanding.",
    name: "Emma R.",
    location: "Camden",
    rating: 5,
  },
] as const;

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-primary" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 bg-muted/30 py-16 md:py-24"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="testimonials-heading"
            className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            What Our Clients Say
          </h2>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              className="flex flex-col border-border/60 shadow-soft"
            >
              <CardContent className="flex flex-1 flex-col p-6">
                <StarRating count={t.rating} />
                <blockquote className="mt-4 flex-1 text-muted-foreground">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <footer className="mt-4 text-sm font-medium text-foreground">
                  {t.name}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    — {t.location}
                  </span>
                </footer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
