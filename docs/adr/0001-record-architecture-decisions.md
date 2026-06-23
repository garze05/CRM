# ADR-0001 — Record architecture decisions

**Status:** Accepted · 2026-06-23

## Context

OkiDoki CRM is built largely by AI agents working in short-lived sessions. Several
foundational decisions (stack divergence from the original brief, the package-based
quoting pivot, the split with the document-rendering service) were repeatedly
re-derived from chat logs and point-in-time memory files, risking contradiction with
already-committed code and docs.

## Decision

Keep a set of Architecture Decision Records under [`docs/adr/`](.), and a domain
language document at [`CONTEXT.md`](../../CONTEXT.md). ADRs capture *why* a decision was
made; CONTEXT.md captures the *language and model* the decisions operate on. Both are
checked into the repo and are first-class context for any agent or contributor.

## Consequences

- Before changing domain logic or the stack, read CONTEXT.md and the relevant ADR.
- Decisions change by writing a *new* ADR that supersedes the old one — ADRs are not
  edited away.
- The `grill-with-docs` and `improve-codebase-architecture` workflows read these files,
  so keeping them current directly improves agent output quality.
