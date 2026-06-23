# ADR-0003 — Funnel stage on Event, recurrence derived on Client

**Status:** Accepted · 2026-06-11

## Context

The original Sheets/mock data tracked a sales "stage" on both the client and the event,
and listed `RECURRENTE` (recurring) as if it were a funnel stage. This conflated two
different ideas: the *progress of one opportunity* and a *standing property of the
client*.

## Decision

- **The funnel stage lives on `Event`** (`Event.funnelStage`). The event *is* the
  commercial opportunity; a client can have many events at different stages.
- **Recurrence is a derived condition of the client**: `Client.isRecurring` is `true`
  when the client has **more than one `COMPLETED` event**. It is a cached boolean,
  recomputed by the domain layer when events are marked delivered — **not** a funnel
  stage.
- Funnel transitions are validated centrally in
  [`app/lib/domain/funnel.ts`](../../app/lib/domain/funnel.ts)
  (`validateTransition`, `canTransition`), with the gating rules described in
  [CONTEXT.md §2](../../CONTEXT.md).

## Consequences

- Dashboards show recurring clients as their own column by counting clients, not by
  reading an event stage.
- Never set `funnelStage` without going through `validateTransition`; never store a
  per-client stage.
- `isRecurring` is a cache — treat the event history as the source of truth and
  recompute rather than hand-editing the flag.
