# OkiDoki CRM — Agent Guide

Commercial-management CRM for kids' and corporate events. Read this before working
here; it's short on purpose.

## Start here

- [`CONTEXT.md`](CONTEXT.md) — the domain language and model: entities, the sales
  funnel and its gating rules, document numbering, and the end-to-end flow. Read it
  before touching domain logic.
- [`docs/adr/`](docs/adr/) — Architecture Decision Records: *why* the stack, the
  package-based quoting model, the pricing/rendering split, auth, etc. are the way they
  are. Don't re-litigate a decision without reading (and superseding) its ADR.
- [`DESIGN.md`](DESIGN.md) — the visual language and inclusive UI/UX rules.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4** (`@theme` in [`app/globals.css`](app/globals.css))
- **Prisma 7** + Postgres ([`prisma/schema.prisma`](prisma/schema.prisma)) — config in
  [`prisma.config.ts`](prisma.config.ts), not `package.json`.
- **NextAuth v5 (beta)** — auth in [`app/lib/auth.ts`](app/lib/auth.ts).
- Seed: `npm run db:seed` (`--purge` to reset).

## Non-negotiable: language convention

- **UI text** (labels, buttons, placeholders, messages, toasts) → **Spanish (Costa Rica, es-CR), always.**
- **Code** (variables, functions, components, comments) → **English, always.**

Example: a `ClientForm` component whose save button reads `"Guardar cliente"`.

## Non-negotiable: inclusive UI/UX

The product serves users of all ages and digital-literacy levels, including older
adults. See [`DESIGN.md`](DESIGN.md) §6 for the full rules. The ones agents break most:

- **Icons must have visible text labels** — never icon-only (except universal ones like
  close `×`). Tooltips do **not** replace labels.
- **Touch targets ≥ 44×44px**, well spaced.
- **WCAG AA contrast in BOTH light and dark themes.**
- **Plain language**, predictable navigation, clear success/error feedback.

## Design system

[`DESIGN.md`](DESIGN.md) is the source of truth. We are **migrating to shadcn/ui** with
**dark theme as a first-class peer of light**. Use **semantic tokens, never raw hex**.
Brand: Primary `#FF8C42`, Secondary `#4ECDC4`, Tertiary `#FFD166`. Font: Plus Jakarta Sans.

## Layout

- `app/<route>/` — feature routes (`clientes`, `cotizaciones`, `eventos`, `paquetes`,
  `reservaciones`, `inventario`, `catalogo`, `papeleria`, `tareas`, `ajustes`,
  `colaboradores`). Routes/UI are Spanish.
- `app/components/` — shared components; `app/components/ui/` will hold shadcn primitives.
- `app/lib/` — `actions/` (server actions), `domain/`, `server/`, `validation/` (Zod),
  `integrations/`, `format.ts`, `db.ts`, `auth*.ts`.

## Conventions

- Validate input with **Zod** ([`app/lib/validation`](app/lib/validation)).
- Mutations go through **server actions** in [`app/lib/actions`](app/lib/actions).
- Money/dates/phones: use helpers in [`app/lib/format.ts`](app/lib/format.ts)
  (`react-phone-number-input`, `date-fns`).
- Run `npm run lint` before finishing.
