/**
 * Zod schemas and validation for the landing contact form.
 */

import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+44|0)?[0-9\s-]{10,13}$/;
const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(phoneRegex, "Please enter a valid UK phone number"),
  serviceType: z
    .string()
    .min(1, "Please select a service type")
    .refine(
      (val) =>
        [
          "Residential Cleaning",
          "Commercial Cleaning",
          "Deep Cleaning",
          "One-Off Clean",
          "Other",
        ].includes(val),
      { message: "Please select a valid service type" }
    ),
  postcode: z
    .string()
    .min(1, "Postcode is required")
    .regex(postcodeRegex, "Please enter a valid UK postcode"),
  preferredContact: z
    .string()
    .min(1, "Please select how you'd like to be contacted")
    .refine(
      (val) => ["Phone", "WhatsApp", "Email"].includes(val),
      { message: "Please select a valid contact method" }
    ),
  message: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
