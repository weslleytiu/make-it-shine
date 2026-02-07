import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { SITE_CONFIG } from "@/lib/landing-config";

const quickLinks = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#why-us" },
  { label: "Contact", href: "#contact" },
  { label: "Areas", href: "#areas" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const serviceLinks = [
  { label: "Residential Cleaning", href: "#services" },
  { label: "Commercial Cleaning", href: "#services" },
  { label: "Deep Cleaning", href: "#services" },
  { label: "Regular Maintenance", href: "#services" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-card" role="contentinfo">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo & description */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-serif text-xl font-semibold text-foreground"
              aria-label="Make it Shine - Home"
            >
              <img
                src="/logo.jpeg"
                alt=""
                className="h-10 w-auto object-contain"
                width={120}
                height={40}
              />
              <span className="hidden sm:inline">Make it Shine</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Professional cleaning services across London. Trusted, reliable,
              affordable.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-3 space-y-2" role="list">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("#") ? (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .querySelector(item.href)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <ul className="mt-3 space-y-2" role="list">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector(item.href)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contact Us</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground" role="list">
              <li>
                <a href={SITE_CONFIG.phoneLink} className="hover:text-foreground">
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {SITE_CONFIG.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="hover:text-foreground"
                >
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li>{SITE_CONFIG.address}</li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Follow Us</h3>
            <div className="mt-3 flex gap-4">
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={SITE_CONFIG.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Twitter"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
          © {year} Make it Shine London. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
