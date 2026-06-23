# ADR-0010 — Soft delete + partial unique indexes

**Status:** Accepted · 2026-06-11

## Context

Clients, events, quotes and other first-class records must be recoverable (and feed an
audit trail), so hard deletes are unacceptable. But soft delete collides with uniqueness:
a phone number must be unique *among live clients*, yet a deleted client may keep the
same phone. Prisma does not support conditional (partial) unique indexes in the schema.

## Decision

- **Soft delete via `deletedAt`** on first-class entities; queries filter
  `deletedAt IS NULL`. A `/papeleria` (trash) surface and `app/lib/server/trash.ts`
  handle recovery.
- **Uniqueness that must coexist with soft delete is implemented as partial unique
  indexes in raw SQL**, kept in `prisma/sql/partial-unique-indexes.sql` and applied via
  a manual migration. Examples:
  - `clients.phone` unique `WHERE deleted_at IS NULL`.
  - "only one `SENT` quote per event" — unique `WHERE status = 'SENT' AND deleted_at IS NULL`.
- The same SQL file holds **CHECK constraints** Prisma can't express, e.g.
  `PackageItem` must reference exactly one of `serviceId` / `catalogItemId`.
- **An `AuditLog`** ("entity.verb", e.g. `event.stage_changed`) is written in the *same
  transaction* as the change, recording actor and a field-level diff.

## Consequences

- Schema changes that need conditional uniqueness or CHECKs must also touch the raw-SQL
  migration — the `@@unique` in `schema.prisma` is not enough.
- All list/query helpers must remember the `deletedAt IS NULL` filter; forgetting it
  leaks deleted records.
- Mutations should go through domain services that also write the matching `AuditLog`
  entry within the transaction.
