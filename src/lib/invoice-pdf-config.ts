/**
 * Company and payment details for Make It Shine invoice PDF.
 * Matches the layout used in official client invoices.
 */

export const INVOICE_COMPANY = {
  name: "MAKE IT SHINE CLEANING SERVICES LTD",
  city: "London",
  country: "United Kingdom",
  email: "makeshinecleaning@gmail.com",
} as const;

export const INVOICE_PAYMENT_DETAILS = {
  beneficiary: "Amanda Silva",
  sortCode: "04-00-75",
  accountNumber: "74273833",
  bankAddress: "Revolut Ltd",
} as const;

export const INVOICE_DEFAULT_TERMS = "Custom";
export const INVOICE_DEFAULT_NOTES = "Thanks for your business.";

/** MIS design system colors for invoice PDF (Deep Rose, Dusty Rose, Charcoal) */
export const INVOICE_PDF_COLORS = {
  /** Primary accent – "INVOICE" title, table header */
  primary: "#8E5D5D",
  /** Light primary – Balance Due row background */
  primaryLight: "#F5EDEC",
  /** Brand secondary – logo, "MAKE IT SHINE" */
  secondary: "#D4A5A5",
  /** Muted – "CLEANING SERVICES", labels */
  muted: "#6b7280",
  /** Text */
  text: "#333333",
  white: "#FFFFFF",
} as const;
