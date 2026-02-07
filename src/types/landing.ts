/**
 * Types for landing page and contact form submission.
 * Payload shape ready for future backend/email/CRM integration.
 */

export type ServiceTypeOption =
  | "Residential"
  | "Commercial"
  | "Deep Cleaning"
  | "One-Off"
  | "Other";

export type PreferredContactOption = "Phone" | "WhatsApp" | "Email";

export interface ContactSubmitPayload {
  fullName: string;
  email: string;
  phone: string;
  serviceType: ServiceTypeOption;
  postcode: string;
  preferredContact: PreferredContactOption;
  message: string | null;
  timestamp: Date;
  source: "landing-page";
}
