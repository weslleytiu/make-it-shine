/**
 * Make it Shine — Landing page editable configuration.
 * Update contact details, stats, pricing, and social links here.
 */

export const SITE_CONFIG = {
  // Contact
  phone: "020 XXXX XXXX",
  phoneLink: "tel:+4420XXXXXXXX",
  whatsapp: "+44 7XXX XXXXXX",
  /** WhatsApp number without spaces for wa.me link (e.g. 447XXXXXXXXX) */
  whatsappNumber: "447XXXXXXXXX",
  whatsappLink: "https://wa.me/447XXXXXXXXX",
  email: "hello@makeitshine.co.uk",
  address: "London, United Kingdom",

  // Statistics (trust signals)
  stats: {
    clients: "200+",
    cleaners: "15+",
    cleansCompleted: "5000+",
    rating: "4.9",
  },

  // Base pricing (from X per hour)
  pricing: {
    residential: 15,
    commercial: 18,
  },

  // Social media
  social: {
    instagram: "https://instagram.com/makeitshine",
    facebook: "https://facebook.com/makeitshine",
    twitter: "https://twitter.com/makeitshine",
  },

  // Default WhatsApp pre-filled message
  whatsappMessage:
    "Hi Make it Shine! I'm interested in your cleaning services in London. Could you please provide more information?",
} as const;

export type SiteConfig = typeof SITE_CONFIG;
