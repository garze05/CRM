# ADR-0008 — Business rules live in editable Settings

**Status:** Accepted · 2026-06-11 (extended 2026-06-19)

## Context

The discount and surcharge rules (`REGLAS_DESCUENTO`), transport rates, deposit
percentage, quote validity, tax rate and price rounding were all constants embedded in
the old Sheets/Python tooling. Hardcoding them in the CRM would force a code change (and
deploy) every time the business adjusts a number.

## Decision

Store these as a **single editable `Settings` row**, surfaced in `/ajustes` and read by
the domain layer:

- Per-client-type **surcharges** (`surchargeEducationalPercent`,
  `surchargeCorporatePercent`, `surchargeShoppingCenterPercent`, `surchargeAgencyPercent`;
  FAMILY = 0 implicit).
- **Discount rules** (`quantityDiscountPercent`, `hoursDiscountPercent`,
  `hoursDiscountMinHours`, `maxDiscountPercent`).
- **Commercial knobs**: `depositPercent`, `depositLeadTimeDays`, `quoteValidityDays`,
  `taxRate`, `priceRoundingTo` (default ₡1000), and transport
  (`transportBasePrice`, `transportRatePerKm`, `transportFreeKm`, origin
  address + lat/lng).

Defaults match the values inherited from `REGLAS_DESCUENTO`. There is intentionally
**no per-service surcharge field** — surcharge is a function of client type, applied at
pricing time. The pricing engine
([`pricing.ts`](../../app/lib/domain/pricing.ts)) takes these settings as inputs and
stays a pure, testable module.

## Consequences

- Changing a discount or surcharge is a data edit in `/ajustes`, not a deploy.
- The pricing engine never reads the database directly; callers pass the relevant
  `Settings` fields in, keeping the math unit-testable.
- Transport is computed by **kilometers** (origin → venue lat/lng), not by zones.
