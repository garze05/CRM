# ADR-0011 — Auth.js JWT + Google OAuth domain allowlist

**Status:** Accepted · 2026-06-11

## Context

The MVP needs simple, secure access for a small internal team, plus a way to call the
external Quotation API as the signed-in user. There are no roles in the MVP — anyone on
the company domain has full access. The Next.js middleware that guards routes runs on
the edge and must not touch Postgres.

## Decision

Use **NextAuth / Auth.js v5 (beta)** with **Google OAuth**:

- **Session strategy is JWT**, for two reasons: (1) the edge middleware can validate the
  session without querying Postgres, and (2) the Google **`id_token` is stored in the
  JWT** and forwarded to the Quotation API as its bearer credential — same audience
  (`AUTH_GOOGLE_ID`). See [ADR-0006](0006-crm-is-the-pricing-authority.md).
- **Config is split**: [`app/lib/auth.config.ts`](../../app/lib/auth.config.ts) is
  edge-safe (no Prisma) and used by the middleware;
  [`app/lib/auth.ts`](../../app/lib/auth.ts) adds the `PrismaAdapter` for the Node
  runtime (persists `User`/`Account`, including the Google `id_token`).
- **Access control is a domain allowlist**: only verified accounts whose email ends in
  `@${ALLOWED_EMAIL_DOMAIN}` (okidokicr.com) may sign in. No role model.
- **Public routes** (no login): `/catalogo`, `/login`, `/api/auth`.
- **`OKIDOKI_AUTH_BYPASS=true`** enables a fake "Modo prueba" user
  ([`auth-bypass.ts`](../../app/lib/auth-bypass.ts)) for local development without OAuth
  credentials. It must never be enabled in production.

## Consequences

- The `Session` table exists (adapter creates it) but is unused under JWT.
- `session.idToken` is **server-side only** — never pass the full session to client
  components.
- Adding roles/permissions later is a deliberate future change, not an oversight.
- `auth.config.ts` must stay free of Prisma/Node-only imports or the middleware breaks.
