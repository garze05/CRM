# ADR-0012 — shadcn/ui migration, dark theme, inclusive UI

**Status:** Accepted · 2026-06-11

## Context

The UI began with ad-hoc global CSS classes (`.primary-action`, `.form-control`,
`.surface-card`) and a single light palette. The product must serve users of all ages
and digital-literacy levels (including older adults), and the business wants a modern,
themeable foundation with proper dark mode.

## Decision

- **Migrate to shadcn/ui** (Radix primitives + Tailwind, `new-york` style) as the
  component foundation. Primitives live in `app/components/ui/`; app composites
  (`crm-shell`, `data-table`, etc.) build on top. Migrate **incrementally, screen by
  screen**, deleting superseded global classes as each route is converted.
- **Dark theme is a first-class peer of light**, driven by **semantic CSS tokens** in
  [`app/globals.css`](../../app/globals.css) (`@theme`). Components reference tokens,
  **never raw hex**. Every token has a defined value in both themes; contrast is
  re-verified in both. Theme is toggled via `next-themes`, defaulting to OS preference.
- Brand palette: Primary `#FF8C42`, Secondary `#4ECDC4`, Tertiary `#FFD166`; font
  Plus Jakarta Sans. Full rules in [`DESIGN.md`](../../DESIGN.md).
- **Inclusive UI/UX is non-negotiable** (`DESIGN.md §6`): icons always carry visible
  text labels (tooltips don't count), touch targets ≥ 44×44px, WCAG AA contrast in both
  themes, plain es-CR language, predictable navigation, clear success/error feedback.

## Decision: notable build choices

- **Custom calendar on `date-fns`** for `/eventos` (month grid + agenda week/day),
  *not* FullCalendar — the resource views needed are Premium/paid.
- **Tables** use `@tanstack/react-table` v8 wrapped in the existing management-table
  look (Excel-style filters).
- **Phones** use `react-phone-number-input` / `libphonenumber-js` (CR default);
  formatting helpers in [`app/lib/format.ts`](../../app/lib/format.ts).

## Consequences

- New UI must use semantic tokens and pass the `DESIGN.md §7` acceptance checklist in
  both themes before it's "done".
- The migration is gradual: light global CSS classes coexist with shadcn components
  until each route is fully converted.
- Calendar/table behavior is owned by us (custom/wrapped), so feature requests there are
  in-house work, not a library upgrade.
