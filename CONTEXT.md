# OkiDoki CRM — Domain Context

This document is the **ubiquitous language** and domain model for OkiDoki CRM. It
explains *what the system is about* (the business concepts and the rules that bind
them), not *how the code is built* — architectural choices live in
[`docs/adr/`](docs/adr/), the stack lives in [`AGENTS.md`](AGENTS.md), and the visual
language lives in [`DESIGN.md`](DESIGN.md).

Read this before changing domain logic. When a term here appears in code, it appears
in **English**; when it appears in the UI, it appears in **es-CR Spanish** (see the
language convention in [`AGENTS.md`](AGENTS.md)). The Spanish term agents and the
business actually say is given in parentheses.

---

## 1. What the business does

OkiDoki is a Costa Rican company that produces **kids' and corporate events**
(birthday parties, school festivals, brand activations) staffed with **characters /
mascot costumes** (*botargas/personajes*), entertainers, inflatables and decoration.

The CRM replaces a Google Sheets + WhatsApp workflow. Its job is to move a potential
event from *first contact* to *delivered and paid* without losing track of the money,
the calendar slot, or who is responsible for the relationship. Quoting and document
generation were previously a separate tool (**CorrespondencyBot** / Quotation API);
the CRM now owns the commercial logic and reuses that tool only to render PDFs
([ADR-0006](docs/adr/0006-crm-is-the-pricing-authority.md)).

Currency is **CRC (₡)**. Timezone is **America/Costa_Rica**; timestamps are stored in
UTC and displayed in CR time.

---

## 2. The core entities and their language

### Client (`Client` — "Cliente")
A person or organization. The **phone number is the natural identifier** — it is the
WhatsApp line the whole relationship runs on, stored normalized to E.164. A client has
a commercial **type** (`ClientType`) that drives default pricing surcharges:

| Code | UI (es-CR) | Default surcharge |
| --- | --- | --- |
| `FAMILY` | Familiar | 0% (the base price) |
| `EDUCATIONAL` | Educativo | 5% |
| `CORPORATE` | Corporativo | 10% |
| `SHOPPING_CENTER` | Centro Comercial | 10% |
| `ADVERTISING_AGENCY` | Agencia de Publicidad | 15% |

Company fields (`companyName`, `companyPhone`) only apply — and only show in the UI —
when `type ≠ FAMILY`. Each client has a **responsible** user (*Responsable*), set to
the current session user on create/edit.

**Recurring (`isRecurring` — "Recurrente")** is a *derived condition of the client*,
not a funnel stage: it means the client has **more than one `COMPLETED` event**. It is
a cached flag, recomputed when events are marked delivered.
See [ADR-0003](docs/adr/0003-funnel-on-event-recurrence-on-client.md).

### Event (`Event` — "Evento")
**The event is the commercial opportunity** — the unit that moves through the sales
funnel. Everything commercial (quotes, reservation, assignments, tasks) hangs off an
event, not off the client. An event has an `eventType` (`CHILDREN` / `CORPORATE` /
`INSTITUTIONAL`), an optional date/time/duration, a venue (with lat/lng for transport
distance), guest count, and — for kids' parties — the honoree's name and age.

A key distinction in the language:
- **Requested character (`requestedCharacterId`)** — the *specific* catalog character
  the client asked for (e.g. "Mario Bros"), even when the package they buy is generic
  ("1 hour of character"). It is a searchable FK so the business can answer "which
  events asked for X?".
- **Party theme (`partyTheme`)** — free text for an ambiance that is *not* a catalog
  character (e.g. "dinosaurs", "soccer"). Complements, does not replace, the above.

### Funnel stage (`FunnelStage` — "Embudo / Etapa")
The event's state machine. Transitions are validated in
[`app/lib/domain/funnel.ts`](app/lib/domain/funnel.ts), never set blindly.

```
PROSPECT → CONTACTED → QUOTED → RESERVED → CONFIRMED → COMPLETED
(Prospecto) (Contactado)(Cotizado)(Reservado)(Confirmado)(Realizado)

  ↘ CANCELED (Cancelado) reachable from any non-final stage
  QUOTED → CONTACTED allowed (re-work the lead before re-quoting)
```

**Gating invariants** (the rules that make the funnel mean something):
- **Qualification gate before `QUOTED`** — *"you never quote before qualifying."*
  Crossing into `QUOTED`+ requires the event to be **qualified**: it must have a date,
  a guest count, a venue address (zone), a theme-or-requested-character, and — for
  `CHILDREN` events — the honoree's age. The gate only fires when *crossing forward*;
  editing already-quoted/historical data does not re-block.
- **Date required from `RESERVED` onward.**
- **`RESERVED` requires an accepted quote.**
- **`CONFIRMED` requires the deposit registered**
  ([ADR-0009](docs/adr/0009-deposit-driven-reservation.md)).
- **`CONFIRMED` blocks resources** (characters/collaborators) on the calendar.

### Catalog item (`CatalogItem` — "Catálogo") and Service (`Service` — "Servicio")
Two different building blocks:
- A **catalog item** is a *shown* thing — a character, inflatable, decoration. It has
  images, a gallery, tags, and feeds the **public catalog** (no prices, WhatsApp CTA).
- A **service** is a *priced component* — "extra hour", "face painting", "transport".
  Its `priceType` is `FIXED` / `PER_HOUR` / `PER_UNIT`.

`Service.standaloneSellable` (default **false**) is an intentional brake: by default a
service can only *compose packages*; only services flagged `true` may be sold à-la-carte
as an extra. This enforces the package-based model and stops the old habit of quoting
service-by-service. See [ADR-0005](docs/adr/0005-package-based-quoting.md).

### Package (`Package` — "Paquete")
A preconfigured bundle of catalog items and/or services with **one base price**
(`basePrice`). The base price is the *familiar* price (no surcharge). The **effective
price for a client** is computed by the engine:

```
effectivePrice = roundToMultiple( basePrice × (1 + surcharge%), priceRoundingTo )
```

with surcharges per client type and rounding (default ₡1000) coming from **Settings**.
A package's suggested base price can be derived from its components, applying the
quantity/hours discount rules. Pricing lives in
[`app/lib/domain/pricing.ts`](app/lib/domain/pricing.ts).

### Quote (`Quote` — "Cotización") and Quote option (`QuoteOption` — "Opción")
A quote belongs to one event and **offers 1–3 package options**; the client picks one.
This is the heart of the package-based model — a quote presents *packages*, not loose
line items. One option may be flagged **recommended** (*"el popular"*, the anchor in
the WhatsApp script). Extras (transport, extra hour) hang off an option via
`QuoteOptionExtra`, not off the catalog. `Quote.selectedOptionId` records the client's
choice. `packageId = null` on an option is reserved for a future **Custom** package
(the exception, not the flow).

A quote has a readable code (see numbering below) and a `documentPayload` — the JSON
the rendering service needs to (re)produce the PDF on demand.

### Reservation (`Reservation` — "Reservación") and Payment (`Payment` — "Pago")
A reservation links one event to its accepted quote and holds the agreed total,
deposit and balance. **The deposit drives everything**:
`depositPaidAt` is what actually *holds the calendar date* — without it the date is not
secured (`QUOTED → RESERVED`). `depositMethod` is a first-class field on the deposit;
the full payment history lives in `Payment[]`.
See [ADR-0009](docs/adr/0009-deposit-driven-reservation.md). Two events can share a date
(multiple crews) — there is **no unique constraint**; conflicts are detected and warned
about in the domain layer.

### Collaborator (`Collaborator` — "Colaborador") and assignment (`EventAssignment`)
The people who staff events (mascot performers, entertainers, logistics). A
collaborator declares which characters they can perform (`CollaboratorCharacter`). The
**rating and notes live per assignment** (`EventAssignment.rating`), not on the
collaborator; `Collaborator.ratingAverage` is a cached average.

### Supporting concepts
- **Task (`Task` — "Tarea")** — manual, automatic (deduplicated by `autoKey`, e.g.
  `QUOTE_FOLLOWUP_24H:quote:<id>`), or system. Loosely associated to client/event/
  collaborator via optional FKs.
- **Note (`Note` — "Nota")** and **Interaction (`Interaction`)** — the timeline.
  Logging an interaction bumps `Client.lastContactAt`. WhatsApp/calls stay outside the
  system in the MVP; interactions are recorded manually.
- **Settings (`Settings` — "Ajustes")** — a single editable row holding business rules
  (surcharges, discounts, deposit %, quote validity, transport rates, tax, rounding).
  These are *business knobs in the UI*, not hardcoded constants
  ([ADR-0008](docs/adr/0008-settings-driven-business-rules.md)).
- **DocumentCounter** — yearly, per-type sequential for readable codes.
- **AuditLog** — "who did what when", written in the same transaction as the change.

---

## 3. Document numbering

Readable codes follow the **CorrespondencyBot** format
([ADR-0007](docs/adr/0007-document-numbering-correspondencybot.md)):

```
{C|R}{DDMM}-{YY}{sequential}
   C1503-26101   →  Quote (C), event on 15/03, year 2026, sequential 101
   R2412-26115   →  Reservation (R)
```

`DDMM` comes from the **event date** (not issue date); the sequential is yearly per
type and starts at **100**. Logic in
[`app/lib/domain/numbering.ts`](app/lib/domain/numbering.ts).

---

## 4. How the flow runs end-to-end

1. **Lead** — a `Client` and a `PROSPECT`/`CONTACTED` `Event` are created.
2. **Qualify** — fill the qualification data on the event detail screen (the screen is
   designed to carry *everything needed to close the sale*).
3. **Quote** — generate a `Quote` with 1–3 package `QuoteOption`s; mark the popular one;
   the CRM computes pricing and produces the PDF via the rendering service. Event → `QUOTED`.
4. **Client chooses** — record the selected option; total/document recompute.
5. **Reserve** — record the **deposit** (`depositPaidAt`); a `Reservation` holds the
   date. Event → `RESERVED`.
6. **Confirm** — deposit registered, crew assigned. Event → `CONFIRMED` (resources blocked).
7. **Deliver** — Event → `COMPLETED`; rate the event and collaborators; recompute the
   client's `isRecurring`.

---

## 5. Invariants worth never breaking

- Funnel stage changes go through `validateTransition`; cancellations are always allowed
  from non-final stages.
- You cannot quote an unqualified event (the qualification gate blocks both the stage
  change *and* the quote generation itself).
- A package has exactly one base price; per-type prices are *computed*, never stored.
- The deposit (`depositPaidAt`) — not the stage label — is what holds a date.
- The CRM computes money; the external service only renders documents.
- Soft delete (`deletedAt`) everywhere on first-class entities; "unique" constraints
  that must coexist with soft delete are partial unique indexes in raw SQL
  ([ADR-0010](docs/adr/0010-soft-delete-and-partial-unique-indexes.md)).
- UI strings in es-CR, code in English. Always.
