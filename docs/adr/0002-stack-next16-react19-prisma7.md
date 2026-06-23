# ADR-0002 — Next.js 16 / React 19 / Tailwind 4 / Prisma 7

**Status:** Accepted · 2026-06-11

## Context

The original brief (and an early draft of `AGENTS.md`) assumed **Next.js 14**. The repo
was actually scaffolded on **Next 16 / React 19 / Tailwind 4**, and Prisma had moved to
**v7**, which changes how the client is configured and generated.

## Decision

- **Do not downgrade.** Stay on Next 16 (App Router), React 19, Tailwind CSS 4
  (`@theme` in [`app/globals.css`](../../app/globals.css)).
- **Prisma 7 conventions:**
  - The datasource connection URL lives in
    [`prisma.config.ts`](../../prisma.config.ts), **not** in `schema.prisma`
    (`url = env(...)` is invalid in v7).
  - The generator is `prisma-client` (not `prisma-client-js`), output to
    [`app/generated/prisma`](../../app/generated/prisma).
  - The runtime uses the driver adapter `@prisma/adapter-pg` (with `pg`).
- Server-side data access goes through **server actions** in `app/lib/actions` and
  query helpers in `app/lib/server`; input is validated with **Zod**
  (`app/lib/validation`).

## Consequences

- Patterns must target App Router + React 19 server components; do not reintroduce a
  `datasource db { url = env(...) }` block or `prisma-client-js`.
- `npm run dev` runs `prisma generate` first because the generated client is git-ignored
  output, not a published package.
- `AGENTS.md` now reflects the real stack; the "Next 14" assumption is retired.
