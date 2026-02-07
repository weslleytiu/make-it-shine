/**
 * Analytics / tracking helper. Ready for Google Analytics (gtag).
 * In development, events are logged to console.
 */

export function trackEvent(
  category: string,
  action: string,
  label?: string
): void {
  if (typeof window === "undefined") return;
  if (window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  } else {
    console.log("Event:", category, action, label ?? "");
  }
}

declare global {
  interface Window {
    gtag?: (
      command: "event",
      action: string,
      params: { event_category: string; event_label?: string }
    ) => void;
  }
}
