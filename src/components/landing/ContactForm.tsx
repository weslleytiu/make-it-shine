import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactFormSchema, type ContactFormValues } from "@/lib/landing-validations";
import type { ContactSubmitPayload, ServiceTypeOption } from "@/types/landing";
import { cn } from "@/lib/utils";

const SERVICE_OPTIONS = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Deep Cleaning",
  "One-Off Clean",
  "Other",
] as const;

const PREFERRED_CONTACT_OPTIONS = ["Phone", "WhatsApp", "Email"] as const;

function mapServiceTypeToPayload(
  value: (typeof SERVICE_OPTIONS)[number]
): ServiceTypeOption {
  if (value === "Residential Cleaning") return "Residential";
  if (value === "Commercial Cleaning") return "Commercial";
  if (value === "Deep Cleaning") return "Deep Cleaning";
  if (value === "One-Off Clean") return "One-Off";
  return "Other";
}

/**
 * Build payload for backend/email/CRM integration.
 */
function buildPayload(values: ContactFormValues): ContactSubmitPayload {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    serviceType: mapServiceTypeToPayload(
      values.serviceType as (typeof SERVICE_OPTIONS)[number]
    ),
    postcode: values.postcode,
    preferredContact: values.preferredContact as ContactSubmitPayload["preferredContact"],
    message: values.message?.trim() || null,
    timestamp: new Date(),
    source: "landing-page",
  };
}

interface ContactFormProps {
  /** Trigger element (e.g. "Get Your Free Quote" button) */
  trigger: React.ReactNode;
  /** Optional class for the dialog content */
  className?: string;
  /** Track event name when form is opened (analytics) */
  trackOpen?: string;
}

export function ContactForm({ trigger, className, trackOpen }: ContactFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      serviceType: undefined,
      postcode: "",
      preferredContact: undefined,
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("loading");
    setErrorMessage("");
    setSuccessMessage("");

    const payload = buildPayload(values);

    try {
      // Simulate submit — replace with real API/email/webhook
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "form_submit", {
          event_category: "contact",
          event_label: "landing-page",
        });
      }
      console.log("Contact form payload (ready for backend):", payload);

      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      setStatus("success");
      setSuccessMessage(
        "Thank you! We'll contact you within 24 hours to discuss your cleaning needs."
      );
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(
        "Something went wrong. Please try again or contact us directly via WhatsApp."
      );
    }
  };

  const isLoading = status === "loading";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => trackOpen && console.log("Event:", trackOpen)}>
        {trigger}
      </DialogTrigger>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", className)}
        aria-describedby="contact-form-description"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Request Free Quote</DialogTitle>
          <DialogDescription id="contact-form-description">
            Fill in your details and we&apos;ll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {status === "success" && (
          <div
            className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        {status === "error" && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {status !== "success" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="contact-fullName">Full name</FormLabel>
                    <FormControl>
                      <Input
                        id="contact-fullName"
                        placeholder="John Smith"
                        autoComplete="name"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="contact-email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="john@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="contact-phone">Phone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="07XXX XXXXXX"
                        autoComplete="tel"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger id="contact-serviceType" aria-label="Service type">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="contact-postcode">Postcode</FormLabel>
                    <FormControl>
                      <Input
                        id="contact-postcode"
                        placeholder="SW1A 1AA"
                        autoComplete="postal-code"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred contact method</FormLabel>
                    <FormControl>
                      <div
                        role="radiogroup"
                        aria-label="Preferred contact method"
                        className="flex flex-wrap gap-4 pt-2"
                      >
                        {PREFERRED_CONTACT_OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 text-sm font-medium",
                              "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded"
                            )}
                          >
                            <input
                              type="radio"
                              name={field.name}
                              value={opt}
                              checked={field.value === opt}
                              onChange={() => field.onChange(opt)}
                              onBlur={field.onBlur}
                              disabled={isLoading}
                              className="h-4 w-4 border-input text-primary focus:ring-primary"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="contact-message">Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        id="contact-message"
                        placeholder="Tell us about your cleaning needs..."
                        rows={3}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Sending...
                  </>
                ) : (
                  "Request Free Quote"
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
