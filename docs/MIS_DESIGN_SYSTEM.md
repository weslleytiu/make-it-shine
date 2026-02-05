# MIS — Make It Shine — Design System

**Concept:** Soft Luxury. Sophistication and elegance; the abbreviation **MIS** evokes "Miss"—impeccable care, delicacy, and a premium standard.

---

## Color Palette (60-30-10)

| Role        | Name        | Hex       | Usage                                      |
|------------|-------------|-----------|--------------------------------------------|
| **60%**    | Rose Chalk  | `#F9F4F2` | Backgrounds, clean areas                   |
| **30%**    | Dusty Rose  | `#D4A5A5` | Graphics, icons, secondary UI elements     |
| **10%**    | Deep Rose   | `#8E5D5D` | CTAs, primary buttons, focus/attention      |
| **Text**   | Charcoal    | `#333333` | Body and headings for legibility           |

In code, use the semantic tokens so light/dark and future tweaks stay consistent:

- `background` / `card` → Rose Chalk family  
- `secondary` / `accent` / icons → Dusty Rose  
- `primary` (buttons, links, focus ring) → Deep Rose  
- `foreground` / `card-foreground` → Charcoal  

Tailwind overrides: `mis-rose-chalk`, `mis-dusty-rose`, `mis-deep-rose`, `mis-charcoal`.

---

## Typography

- **Serif (editorial):** Cormorant Garamond — logo **MIS**, tagline "Make It Shine", and page titles (`.page-title`).
- **Sans:** System UI — body and UI for clarity and accessibility.

Use `font-serif` for brand moments; keep body and forms in default (sans) for readability.

---

## Visual Style

- **Minimalism:** Generous white space; avoid clutter.
- **Separation:** Prefer **soft shadows** (`shadow-soft`, `shadow-soft-lg`) over heavy borders; borders use `border-border/60` for lightness.
- **Feel:** Light, airy, premium—"light as a feather, strong enough to convey authority."

---

## Components

- **Cards:** `shadow-soft`, light border (`border-border/60`).
- **Buttons:** Primary = Deep Rose (CTA); secondary = Dusty Rose.
- **Sidebar:** Logo "MIS" (serif) + sparkle icon (Dusty Rose) + tagline "Make It Shine".

---

## CSS Variables (theme)

Defined in `src/index.css` under `:root`. Dark mode overrides in `.dark` for future use.
