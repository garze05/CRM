# ADR-0009 — The deposit holds the date

**Status:** Accepted · 2026-06-19

## Context

In the events business, a date is only truly *held* once the client pays a deposit
(*abono*). Treating a funnel stage label as the source of truth for "is this date
secured?" lets dates be reserved without money behind them.

## Decision

Make the **deposit a first-class, gating fact** on `Reservation`:

- `depositPaidAt` (and `depositMethod`) are first-class fields. **`depositPaidAt` is
  what moves `QUOTED → RESERVED`** — without it the event's date is *not* held. This is
  enforced as a domain rule, not just a UI affordance.
- A `Reservation` is created from an **accepted quote** and carries `agreedTotal` (may
  differ from the quoted total if renegotiated), `depositAmount`/`depositDueDate`
  (2 weeks before the event by default) and `balanceAmount`/`balanceDueDate`.
- The full payment trail lives in `Payment[]` (`DEPOSIT` / `BALANCE` / `OTHER`).
- **Double-booking is allowed by design**: no unique constraint on event date — multiple
  crews can run events the same day. Conflicts are *detected and surfaced* in the domain
  layer, not prevented by the schema.
- `CONFIRMED` additionally requires the deposit registered
  (see [`funnel.ts`](../../app/lib/domain/funnel.ts) `validateTransition`).

## Consequences

- The funnel's `RESERVED`/`CONFIRMED` stages are backed by real money state, not just a
  label.
- A date-conflict warning (still to be implemented) is a domain-layer concern, since the
  database deliberately permits same-day events.
