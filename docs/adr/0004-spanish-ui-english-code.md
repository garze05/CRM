# ADR-0004 — Spanish UI, English code

**Status:** Accepted · 2026-06-11

## Context

The product serves a Costa Rican business and its users; the codebase is worked on by
agents and contributors who default to English. Mixing languages in either layer
produces unreadable UIs or unsearchable code.

## Decision

A strict, non-negotiable split:

- **All user-facing text** (labels, buttons, placeholders, messages, toasts, tooltips)
  is **Spanish (Costa Rica, es-CR)** — informal voseo where natural ("Ingresá",
  "Guardá").
- **All code** (variables, functions, components, comments, enum *values*) is
  **English**.

Example: a `ClientForm` component whose save button reads `"Guardar cliente"`. Enum
values are English (`FAMILY`, `QUOTED`); their Spanish labels live in label maps
(e.g. `FUNNEL_STAGE_LABELS`, `CLIENT_TYPE_LABELS`).

## Consequences

- Every new domain enum needs a matching es-CR label map for the UI.
- This is enforced in code review; it is also restated in `AGENTS.md`, `DESIGN.md`, and
  `CONTEXT.md` because it is the rule most easily broken.
