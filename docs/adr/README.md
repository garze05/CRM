# Architecture Decision Records

This directory records the **non-obvious, hard-to-reverse decisions** behind OkiDoki
CRM — the kind a new contributor (human or agent) would otherwise re-litigate or
accidentally undo. Each ADR captures the *context* at the time, the *decision*, and its
*consequences*. They are point-in-time records: superseded ones are marked, not deleted.

For the business/domain language these decisions operate on, see
[`../../CONTEXT.md`](../../CONTEXT.md). For the stack and conventions, see
[`../../AGENTS.md`](../../AGENTS.md). For the design system, see
[`../../DESIGN.md`](../../DESIGN.md).

## Format

Each ADR follows a light [Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
structure: **Status · Context · Decision · Consequences**. Status is one of
`Accepted`, `Superseded by ADR-NNNN`, or `Proposed`. Number files sequentially; never
renumber. To change a decision, write a new ADR that supersedes the old one.

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-stack-next16-react19-prisma7.md) | Next.js 16 / React 19 / Tailwind 4 / Prisma 7 | Accepted |
| [0003](0003-funnel-on-event-recurrence-on-client.md) | Funnel stage on Event, recurrence derived on Client | Accepted |
| [0004](0004-spanish-ui-english-code.md) | Spanish UI, English code | Accepted |
| [0005](0005-package-based-quoting.md) | Package-based quoting model | Accepted |
| [0006](0006-crm-is-the-pricing-authority.md) | CRM is the pricing authority; external service only renders | Accepted |
| [0007](0007-document-numbering-correspondencybot.md) | CorrespondencyBot document numbering | Accepted |
| [0008](0008-settings-driven-business-rules.md) | Business rules live in editable Settings | Accepted |
| [0009](0009-deposit-driven-reservation.md) | The deposit holds the date | Accepted |
| [0010](0010-soft-delete-and-partial-unique-indexes.md) | Soft delete + partial unique indexes | Accepted |
| [0011](0011-authjs-jwt-google-domain-allowlist.md) | Auth.js JWT + Google OAuth domain allowlist | Accepted |
| [0012](0012-shadcn-dark-theme-inclusive-ui.md) | shadcn/ui migration, dark theme, inclusive UI | Accepted |
