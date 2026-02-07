import { MessageCircle, FileText, Sparkles } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: MessageCircle,
    title: "Contact Us",
    text: "Reach out via phone, WhatsApp, or our contact form. Tell us your needs.",
  },
  {
    number: 2,
    icon: FileText,
    title: "Get Your Quote",
    text: "We'll provide a transparent quote based on your requirements. No obligations.",
  },
  {
    number: 3,
    icon: Sparkles,
    title: "Enjoy a Spotless Space",
    text: "Our professional cleaners arrive on time and deliver exceptional results.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-muted/30 py-16 md:py-24"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="how-it-works-heading"
            className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Get Started in 3 Simple Steps
          </h2>
        </header>
        <div className="mt-12 flex flex-col gap-10 md:flex-row md:justify-between md:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-1 flex-col items-center text-center"
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-soft"
                  aria-hidden
                >
                  <span className="font-serif text-2xl font-semibold">
                    {step.number}
                  </span>
                </div>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                {step.number < steps.length && (
                  <div
                    className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border md:block"
                    style={{ width: "calc(100% + 1rem)", left: "calc(50% + 2rem)" }}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
