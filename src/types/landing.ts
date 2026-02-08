/**
 * Types for landing page and contact form submission.
 * Payload shape and Quote entity for dashboard approval and cleaner assignment.
 */

export type ServiceTypeOption =
  | "Residential"
  | "Commercial"
  | "Deep Cleaning"
  | "One-Off"
  | "Other";

export type PreferredContactOption = "Phone" | "WhatsApp" | "Email";

export type QuoteStatus = "pending" | "approved" | "rejected" | "converted";

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

/** Quote as stored in DB and shown in dashboard */
export interface Quote {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  postcode: string;
  preferredContact: PreferredContactOption;
  message: string | null;
  status: QuoteStatus;
  professionalId: string | null;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}
