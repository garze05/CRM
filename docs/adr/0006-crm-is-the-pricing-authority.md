# ADR-0006 — CRM is the pricing authority; external service only renders

**Status:** Accepted · 2026-06-19

## Context

Quoting and document generation previously lived in a separate Python service
(**CorrespondencyBot** / "Quotation API"): it read prices from Google Sheets, computed
totals and transport, built the `codigo`, and rendered DOCX/PDF from `Plantilla.docx`.
With the move to a real database and the package-based model
([ADR-0005](0005-package-based-quoting.md)), keeping pricing logic in two places would
guarantee drift.

## Decision

- **The CRM is the single authority for commercial computation**: pricing
  ([`pricing.ts`](../../app/lib/domain/pricing.ts)), discounts, transport, and document
  numbering ([`numbering.ts`](../../app/lib/domain/numbering.ts),
  see [ADR-0007](0007-document-numbering-correspondencybot.md)) are computed locally
  from the database.
- **The Quotation API only renders documents.** The CRM builds the `QuotationResponse`
  payload locally and posts it to `POST /documents/preview` (and `/documents/render`)
  to get a PDF on demand. The Python `build_context` / `generar_documento.py` is
  *shape-driven*: it consumes the dict the CRM provides, untouched.
- The Sheets-based calculation endpoints (`/quotes/manual`, `/quotes/from-event`) are
  **legacy / Custom-only** and are not on the default path.
- The integration client lives in
  [`app/lib/integrations/quotation-api.ts`](../../app/lib/integrations/quotation-api.ts);
  it forwards the user's Google `id_token` as the bearer credential
  (see [ADR-0011](0011-authjs-jwt-google-domain-allowlist.md)) and maps HTTP failures to
  friendly es-CR `QuotationApiError` messages.

## Consequences

- No commercial math is duplicated in Python; changing prices/discounts is a CRM-only
  change.
- The rendering service is an optional dependency: if it is down, the CRM still manages
  the funnel and shows an actionable error instead of a stack trace.
- `Quote.documentPayload` persists exactly what the renderer needs, so a PDF can be
  re-produced later without recomputation.
