import { LandingHeader } from "@/components/landing/LandingHeader";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { Hero } from "@/components/landing/sections/Hero";
import { Services } from "@/components/landing/sections/Services";
import { WhyChooseUs } from "@/components/landing/sections/WhyChooseUs";
import { HowItWorks } from "@/components/landing/sections/HowItWorks";
import { ServiceAreas } from "@/components/landing/sections/ServiceAreas";
import { Testimonials } from "@/components/landing/sections/Testimonials";
import { Pricing } from "@/components/landing/sections/Pricing";
import { CTASection } from "@/components/landing/sections/CTASection";
import { Footer } from "@/components/landing/sections/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <LandingHeader />
      <main id="main">
        <Hero />
        <Services />
        <WhyChooseUs />
        <HowItWorks />
        <ServiceAreas />
        <Testimonials />
        <Pricing />
        <CTASection />
        <Footer />
      </main>
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}
