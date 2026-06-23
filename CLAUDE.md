# Prospera Properties — Design System & Rules

> These rules apply to EVERY edit, page, component, or section built for this project.
> Before writing any UI code, check against this file. No exceptions.

---

## Brand Palette

| Role | Hex | Usage |
|---|---|---|
| Navy | `#1F2F3A` | Navbar, footer, hero sections, dark CTA bars |
| Burgundy | `#8B2030` | Primary CTA buttons ONLY + one meaningful accent per section |
| Warm Background | `#F7F5F2` | Page/section backgrounds |
| White Surface | `#FFFFFF` | Cards, modals, forms |
| Neutral Border | `#D8D2C8` | All borders, dividers, decorative dots/lines |
| Primary Text | `#222222` | Main body text |
| Secondary Text | `#333333` | Supporting paragraphs |
| Muted Text | `#666666` | Labels, metadata, timestamps, eyebrow text |
| Light on Dark | `#FAF8F5` | Text on navy/dark backgrounds only |

**rgba() equivalents:**
- Burgundy: `rgba(139,32,48,x)`
- Navy overlays: `rgba(31,47,58,x)`

### Color rules (non-negotiable)
- Burgundy is **rare**. It only appears on: primary buttons, and at most one accent element per section (a left border, a checkmark). Never on labels, dots, decorative lines, or secondary text.
- Section eyebrow labels are always `#666666` — never burgundy.
- Bullet dots and decorative elements are always `#D8D2C8` — never burgundy.
- Never use any other accent color. No gold, no bright red, no teal. The palette above is the whole palette.

---

## Typography

| Variable | Current Font | Used for |
|---|---|---|
| `var(--font-cormorant)` | **Outfit** | All headings (`h1`–`h3`), large display text |
| `var(--font-dm-sans)` | **Inter** | All body text, labels, buttons, inputs |

### Font weight hierarchy (use contrast deliberately)
- `font-bold` (700) — Section headings, card titles, pain point labels
- `font-semibold` (600) — Subheadings, CTA button text, important labels
- `font-medium` (500) — Supporting text that needs emphasis
- `font-normal` (400) — Body paragraphs, descriptions
- `font-light` (300) — Large decorative numbers (like phase numbers `01`)

### Type size rules
- Never use `text-xs` for important content. `text-xs` is only for metadata/timestamps.
- Body text minimum: `text-sm` (14px). Prefer `text-base` for main paragraphs.
- Section labels (eyebrow text): `text-xs uppercase tracking-widest font-semibold`
- On mobile: base font is 107% — Tailwind classes scale up automatically.

---

## Spacing System

- Section vertical padding: `py-24` (standard) or `py-20` (compact)
- Section padding small: `py-14` (stat bars, banners)
- Max content width: `max-w-5xl` (wide) / `max-w-4xl` (standard) / `max-w-3xl` (narrow/text-heavy)
- Horizontal padding: `px-5 sm:px-8` on every section
- Card inner padding: `p-7` or `p-8`
- Gap between cards: `gap-4` (tight) / `gap-5` or `gap-6` (standard)

---

## Component Patterns

### Primary Button
```tsx
<button style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
  className="px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80">
  Action Label
</button>
```

### Secondary / Ghost Button
Never a competing full button alongside a primary. Use a quiet text link:
```tsx
<a className="text-xs font-medium uppercase tracking-widest border-b pb-px transition-opacity hover:opacity-60"
  style={{ color: "rgba(250,248,245,0.55)", borderColor: "rgba(250,248,245,0.2)" }}>
  or secondary action →
</a>
```

### Section Header Pattern
```tsx
<p className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
  style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
  Eyebrow Label  {/* ALWAYS #999999, never burgundy */}
</p>
<h2 className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
  style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
  Clear, direct headline.
</h2>
```

### Cards (light bg sections)
```tsx
<div className="bg-white border rounded-xl p-8"
  style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
```

### Cards (on white bg sections)
```tsx
<div className="border rounded-xl p-7"
  style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
```

### Input Fields
```tsx
style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222" }}
```

---

## Design Principles (apply to every decision)

### 1. One primary action per section
Every section has one dominant CTA. If there's a secondary option, it's a text link — not a second button. Two buttons = paralysis.

### 2. Visual hierarchy through weight + contrast
- Big + bold = most important
- Small + light = least important
- If everything is emphasized, nothing is emphasized.
- Use size, weight, and contrast — not color — to create hierarchy.

### 3. Burgundy is earned
Burgundy draws the eye. Use it sparingly so when it appears, the user pays attention. If it's on every label, every dot, every border — it's invisible. Reserve it for buttons and one meaningful accent per section.

### 4. Whitespace is not empty — it's breathing room
Generous padding increases trust and comprehension. Don't crowd sections. `py-24` is the standard. Premium feels spacious.

### 5. Reduce cognitive load
- No unnecessary buttons
- No walls of text
- No crowded layouts
- No abstract or decorative icons users have to decode
- Users should never have to "figure out" an interface

### 6. Users scan — design for it
Structure every section so someone can understand it in 3 seconds:
- Bold heading → what is this
- Sub-text → why should I care
- CTA → what do I do

Use bullets, bold titles, numbered lists. Avoid paragraphs where bullets would work.

### 7. Consistency = trust
- Buttons always look the same
- Spacing follows the system above
- Typography hierarchy repeats predictably
- Section structure follows the same header pattern every time

### 8. Neutral first, accent second
Most of the page is navy, cream, white, and grey. Burgundy shows up like a signal. Don't let it become noise.

### 9. Mobile first
- Text minimum `text-sm`, prefer `text-base`
- Generous tap targets (`py-3 px-6` minimum for buttons)
- No `tracking-widest` label text below 12px
- Single-column layouts stack naturally on mobile

### 10. Motion should feel invisible
Animations guide attention, not show off. `FadeIn` on scroll is fine. Keep durations under 0.4s. Nothing should feel slow or theatrical.

---

## What NOT to do

- ❌ Never put burgundy on eyebrow labels, bullet dots, or decorative lines
- ❌ Never use two full buttons side by side (one primary + one text link only)
- ❌ Never use abstract symbols (◎⊟◈◷) as icons — use numbers or remove
- ❌ Never use `font-light` for section headings — `font-bold` creates hierarchy
- ❌ Never add colors outside the palette above
- ❌ Never use `text-xs` for body content or card descriptions
- ❌ Never put inline `fontFamily` styles without using the CSS variable
- ❌ Never repeat the same CTA three times on a page (hero + banner + sticky = overload)
- ❌ Never use `#6A2E35`, `#0A1628`, `#C5A55A`, `#0D1B2A` — these are purged

---

## Emotional Target

Every design decision should make the user feel:
**calm · trustworthy · professional · competent**

Not flashy. Not busy. Not overwhelming.
Like a firm handshake from someone who clearly knows what they're doing.
