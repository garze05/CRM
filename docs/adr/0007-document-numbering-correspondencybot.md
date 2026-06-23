# ADR-0007 — CorrespondencyBot document numbering

**Status:** Accepted · 2026-06-11

## Context

Quotes and reservations need human-readable codes. A conventional scheme like
`COT-YYYY-NNNN` was considered, but the business already recognizes the existing
**CorrespondencyBot** format and uses it when talking to clients.

## Decision

Adopt the CorrespondencyBot format (business decision):

```
{C|R}{DDMM}-{YY}{sequential}
```

- `C` for quotes (*Cotización*), `R` for reservations (*Reservación*).
- `DDMM` is taken from the **event date**, not the issue date; `XXXX` when no date yet.
- `YY` is the last two digits of the event-date year.
- `sequential` is **yearly, per type, starting at 100** (`DocumentCounter.lastValue`
  defaults to 99 and is incremented in-transaction).

Examples: `C1503-26101`, `R2412-26115`. Implemented in
[`app/lib/domain/numbering.ts`](../../app/lib/domain/numbering.ts) (`formatDocumentCode`,
`SEQUENTIAL_START = 100`) with the counter persisted in `DocumentCounter`.

## Consequences

- Codes encode the event date, so they are not strictly monotonic by issue time — this
  is intended and matches the business's mental model.
- The sequential must be obtained from `DocumentCounter` inside the same transaction
  that creates the document to avoid collisions.
- Do not reintroduce `COT-YYYY-NNNN`-style numbering.
