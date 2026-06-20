# OkiDoki CRM — Design System

This document defines the visual language, component conventions, and accessibility
rules for OkiDoki CRM. It is the source of truth for the planned migration to
**shadcn/ui** and the addition of **first-class dark theme support**.

It also encodes a set of **non-negotiable inclusive UI/UX restrictions** (see
[§6](#6-inclusive-uiux-rules-non-negotiable)). These take priority over aesthetics:
if a visual choice conflicts with a rule, the rule wins.

---

## Language Convention

**This is a non-negotiable rule:**

- **UI text (labels, buttons, messages, placeholders, tooltips, etc.)** must be in **Spanish (Costa Rica, es-CR) ALWAYS**.
- **Code (variables, function names, comments, component names, etc.)** must be in **English ALWAYS**.

This applies to:

- Button labels: `"Guardar cliente"`, not `"Save client"`
- Input placeholders: `"Ingresá el nombre"`, not `"Enter name"`
- Error messages: `"Por favor, completá este campo"`, not `"Please complete this field"`
- Toast notifications: `"Cliente guardado correctamente"`, not `"Client saved successfully"`
- All user-facing strings in the UI

Code remains exclusively English:

- Variable names: `clientName`, not `nombreCliente`
- Function names: `saveClient()`, not `guardarCliente()`
- Component names: `ClientForm`, not `FormularioCliente`
- Comments and docstrings in code

---

## 1. Goals

1. **Migrate to shadcn/ui** as the component foundation (Radix primitives + Tailwind),
   replacing ad-hoc CSS classes (`.primary-action`, `.form-control`, `.surface-card`,
   etc.) with composable, accessible components.
2. **Dark theme as a true peer of light**, not an afterthought. Every token, component,
   and state must be defined and verified in both themes.
3. **Inclusive by default.** The product serves users of all ages and levels of digital
   experience, including older adults. Clarity beats cleverness everywhere.

---

## 2. Brand Foundations

### 2.1 Color palette

The brand palette (from the reference style guide):

| Role      | Hex       | Usage                                         |
| --------- | --------- | --------------------------------------------- |
| Primary   | `#FF8C42` | Primary actions, key emphasis, active states  |
| Secondary | `#4ECDC4` | Supporting accents, info, success-adjacent UI |
| Tertiary  | `#FFD166` | Highlights, warnings, decorative accents      |
| Neutral   | `#F9F9F9` | Backgrounds, surfaces, neutral scales         |

Each color ships as a full tint/shade scale (50–900) so we never hand-pick
one-off values. Shades are used for hover/active/borders; tints for backgrounds
and subtle fills.

> Today the codebase uses a warmer light palette (`--primary-color: #a64600`,
> accent `#ff8c42`) with a dark override already present in
> [`app/globals.css`](app/globals.css). The shadcn migration reconciles these
> into a single token system (§3) keyed off the brand palette above.

### 2.2 Typography

- **Typeface:** `Plus Jakarta Sans` for headline, body, and label. System sans-serif
  fallback stack.
- **One family, clear hierarchy** through weight and size — never through
  decorative or hard-to-read faces.
- Minimum **body size 16px**. Never render essential text below 14px.
- Generous line-height (≥1.5 for body) and spacing for readability.

### 2.3 Shape & elevation

- Corner radius: `8px` default (`--radius`), consistent across buttons, inputs,
  cards, and badges.
- Soft, low-contrast shadows for elevation (`--soft-shadow`, `--crisp-shadow`).
  Elevation must not be the _only_ signal — pair with borders so it survives
  dark mode and low-contrast displays.

---

## 3. Design Tokens (theming contract)

All colors are exposed as CSS variables on `:root` (light) and `.dark` (dark),
mapped into Tailwind/shadcn via `@theme`. Components reference **tokens, never raw
hex**. This is what makes dark mode a peer of light.

### 3.1 Semantic token set

```
--background        page background
--foreground        default text on background
--card / --card-foreground
--popover / --popover-foreground
--primary / --primary-foreground
--secondary / --secondary-foreground
--tertiary / --tertiary-foreground
--muted / --muted-foreground
--accent / --accent-foreground
--success / --warning / --error / --info  (+ -foreground pairs)
--border --input --ring
--radius
```

### 3.2 Dark theme rules

- The `.dark` class on `<html>` toggles the theme; default follows the OS
  (`prefers-color-scheme`) and is user-overridable, with the choice persisted.
- **Every** semantic token has a defined dark value. No component may hardcode a
  color that only works in one theme.
- Re-verify **contrast in both themes** (see §6.1). A pair that passes in light
  can fail in dark and vice versa.
- Brand hues shift, not just lightness: e.g. primary brightens (`#FF8C42` →
  lighter tint) in dark to stay legible on dark surfaces, as the existing
  `.dark` block already does.

---

## 4. shadcn/ui Migration

### 4.1 Setup

- Initialize shadcn with the `new-york` style, CSS variables enabled, base color
  mapped to our Neutral scale.
- Keep the `@theme` token bridge in [`app/globals.css`](app/globals.css); point
  shadcn's generated tokens at our semantic tokens (§3).
- Components live under `app/components/ui/`. App-specific composites
  (e.g. `crm-shell`, `data-table`, `metric-card`) stay in `app/components/` and
  build _on top of_ the `ui` primitives.

### 4.2 Component mapping

| Current                                 | shadcn replacement                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `.primary-action` / `.secondary-action` | `Button` (variants: `default`, `secondary`, `outline`, `ghost`, `destructive`) |
| `.form-control`, `phone-input`          | `Input`, `Label`, `Field` wrappers                                             |
| `.search-control`                       | `Input` + leading icon, with visible label                                     |
| `.surface-card`, `section-card`         | `Card`                                                                         |
| `status-badge`                          | `Badge`                                                                        |
| `toast`                                 | `Sonner` / `Toast`                                                             |
| `client-combobox`                       | `Command` + `Popover`                                                          |
| `data-table` / `management-table`       | shadcn `Table` + `@tanstack/react-table` (already a dep)                       |
| dialogs / confirmations                 | `AlertDialog` (for destructive), `Dialog`                                      |
| nav (`crm-shell`)                       | `NavigationMenu` / `Sidebar`                                                   |

### 4.3 Button variants (from the style guide)

Map the reference's four button styles onto shadcn variants:

- **Primary** → `default` (filled primary)
- **Secondary** → `secondary` (filled secondary / muted)
- **Inverted** → a dark high-contrast variant for use on light surfaces
- **Outlined** → `outline`

Each variant must be defined and contrast-checked in **both** themes.

### 4.4 Migration approach

Migrate incrementally, screen by screen, keeping the app shippable:

1. Land tokens + `Button`, `Input`, `Card`, `Badge` primitives.
2. Convert one route (e.g. `clientes`) end-to-end as the reference implementation.
3. Roll out remaining routes, deleting the superseded global CSS classes as each
   is fully migrated.

---

## 5. Core Components & Patterns

- **Buttons:** label + (optional) icon. See icon-label rule §6.3.
- **Inputs:** always paired with a visible `<Label>`; never rely on placeholder
  as the only label. Errors shown inline, in plain language (§6.6).
- **Cards:** `Card` with consistent padding, border + soft shadow.
- **Tables:** sortable, keyboard-navigable; row actions use labeled buttons.
- **Navigation:** persistent, predictable shell with a clear "where am I" state
  and an always-available way back (§6.5).
- **Feedback:** toasts confirm success; destructive actions require confirmation
  via `AlertDialog`.

---

## 6. Inclusive UI/UX Rules (non-negotiable)

The interface must be usable by people of all ages and digital experience levels,
including older adults. It must be intuitive, easy to understand, and require
minimal effort to navigate. The following are **requirements**, not suggestions.

### 6.1 Clear and accessible typography

- Readable font sizes: **body ≥16px**, never essential text below 14px.
- Simple, single typeface (`Plus Jakarta Sans`); hierarchy via size/weight.
- **Sufficient color contrast:** meet WCAG **AA** — ≥4.5:1 for normal text,
  ≥3:1 for large text and UI/icon boundaries. Verify in **both light and dark**.
- Adequate spacing and line-height (body ≥1.5).
- Layouts stay consistent and legible across screen sizes (responsive, no
  horizontal scrolling of content, reflow rather than shrink).

### 6.2 Accessible touch targets

- Interactive elements (buttons, links, inputs, icons) have a **minimum
  44×44px** target.
- Targets are **clearly separated** with adequate spacing — no crowded clusters
  that are easy to mis-tap.
- Designed for users with limited vision or motor control: large, forgiving,
  well-spaced.

### 6.3 Icons must include visible labels

- **Icons are never used alone** unless the action is universally recognizable.
- Every icon is accompanied by **clear, descriptive visible text next to it**.
- **Tooltips may add information but must NOT replace visible labels.**
- Practical rule for the codebase: prefer the `icon-label` /
  `inline-icon-text` pattern; an icon-only `Button` is only acceptable for
  truly universal actions (e.g. close "×") and must still carry an
  `aria-label`.

### 6.4 Simple and understandable language

- Familiar words, short instructions, clear action labels ("Save client", not
  "Persist entity").
- Avoid technical terms, ambiguous wording, and unnecessary information.
- Action labels describe the outcome ("Delete quote") rather than abstractions.

### 6.5 Predictable navigation

- Navigation, buttons, and actions behave **consistently** everywhere.
- Users always know: **where they are** (active state, breadcrumb), **what they
  can do**, and **how to go back** (always-available back / breadcrumb path).
- Same action lives in the same place across screens; no surprising relocations.

### 6.6 Clear feedback and error prevention

- **Confirm completed actions** clearly (toast / inline confirmation).
- **Explain errors in simple language** and say **how to fix them** — never a raw
  code or stack message to the user.
- **Prevent errors** up front: sensible defaults, disabled-until-valid,
  confirmation dialogs (`AlertDialog`) before destructive or irreversible
  actions.

---

## 7. Acceptance Checklist

A change to the design system or any migrated screen is "done" only when:

- [ ] Uses semantic tokens (§3), no hardcoded hex.
- [ ] Verified in **both** light and dark themes.
- [ ] Text and UI contrast meet WCAG AA in both themes (§6.1).
- [ ] All interactive targets ≥44×44px and adequately spaced (§6.2).
- [ ] No icon-only controls except universally recognizable ones; all carry
      visible labels or, where allowed, `aria-label` (§6.3).
- [ ] Labels and messages use plain, simple language (§6.4).
- [ ] Navigation/active state/back-path are consistent and predictable (§6.5).
- [ ] Success confirmed, errors explained with a fix, destructive actions
      confirmed (§6.6).
- [ ] Keyboard navigable and screen-reader labeled.
