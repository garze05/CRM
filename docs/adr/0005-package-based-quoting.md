# ADR-0005 — Package-based quoting model

**Status:** Accepted · 2026-06-19
(migration `20260619180552_package_based_quoting_and_qualification`)

## Context

The legacy Sheets workflow quoted **service by service**, hand-picking line items and
prices for every event. This was slow, inconsistent, and hard to anchor in a sales
conversation. The business wanted to sell **packages** with a recommended option ("el
popular") and stop quoting from scratch each time.

## Decision

Reorient the model around **packages**:

- A **`Package` has a single `basePrice`** (the familiar/no-surcharge price). The old
  `priceFamily/priceEducational/priceCorporate` columns were removed. The effective
  price per client type is *computed*, not stored
  (see [ADR-0008](0008-settings-driven-business-rules.md) and
  [`pricing.ts`](../../app/lib/domain/pricing.ts)).
- A **`Quote` offers 1–3 `QuoteOption`s**, each referencing a `Package`. The client
  picks one; `Quote.selectedOptionId` records it. One option may be flagged
  `isRecommended`.
- **Extras** (transport, extra hour) attach to an option via `QuoteOptionExtra`, not to
  loose catalog items.
- **`Service.standaloneSellable` defaults to `false`** — by default a service can only
  *compose* packages. Only services explicitly flagged `true` may be sold à-la-carte.
  This is a deliberate brake against reverting to service-by-service quoting.
- A `QuoteOption` with `packageId = null` is reserved for a future **Custom** package
  (the exception); the item-by-item form was moved to the side route
  `/cotizaciones/nueva/custom`.

## Consequences

- The default quoting UI (`/cotizaciones/nueva`) presents packages, not line items.
- New sellable extras must be modeled as services with `standaloneSellable = true`.
- The PDF currently renders a **single** option (recommended, or the chosen one after
  selection); multi-option PDFs require template work and are deferred.
- A qualification gate was added alongside this migration: an event must be qualified
  before it can be quoted (see [CONTEXT.md §2](../../CONTEXT.md) and
  [`funnel.ts`](../../app/lib/domain/funnel.ts)).
