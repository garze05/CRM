# 5. Lógica de negocio

Toda la lógica vive en servicios de dominio (`app/lib/server/`), se ejecuta dentro
de transacciones Prisma y escribe en `AuditLog`. La UI nunca cambia etapas
directamente: invoca acciones de dominio.

## 5.1 Transiciones del embudo

Implementadas en [`app/lib/domain/funnel.ts`](../../app/lib/domain/funnel.ts)
(ya en esta rama): grafo de transiciones + `validateTransition(from, to, ctx)` con
contexto `{hasEventDate, hasAcceptedQuote, depositReceived}`.

Reglas:
- `CANCELED` alcanzable desde cualquier etapa no final.
- `QUOTED → CONTACTED` permitido (re-trabajar antes de re-cotizar).
- `RESERVED+` exige fecha de evento.
- `RESERVED` exige cotización `ACCEPTED`; `CONFIRMED` exige anticipo registrado.
- **RECURRENTE es del cliente**: tras marcar `COMPLETED`, recomputar
  `Client.isRecurring = (#eventos COMPLETED ≥ 2)`.

```ts
async function changeEventStage(eventId, to, actor) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUniqueOrThrow({ ... });
    const ctx = await buildTransitionContext(tx, event);
    const check = validateTransition(event.funnelStage, to, ctx);
    if (!check.ok) throw new DomainError(check.reason);
    await tx.event.update({ where: { id: eventId }, data: { funnelStage: to } });
    if (to === "COMPLETED") await recomputeClientRecurrence(tx, event.clientId);
    await audit(tx, actor, "event.stage_changed", "Event", eventId,
      { funnelStage: { from: event.funnelStage, to } });
  });
}
```

## 5.2 Cotizaciones

- **Composición**: paquete (precio según `Client.type`) + personajes del catálogo
  (precio/hora) + servicios à la carte (FIJO / POR_HORA×horas / POR_UNIDAD×cantidad)
  + transporte (Google Maps) − descuento manual + IVA opcional (13%).
- Las reglas de descuento del Sheets (15% 2.º ítem, 15% ≥2h, tope 30%, recargo por
  tipo de cliente: educativo 5%, corporativo 10%) viven en `Settings` como campos
  **editables desde /ajustes** (decisión de negocio 2026-06-11); **el detalle
  calculado se congela en `Quote.lineItems` (Json)** — una cotización emitida nunca
  cambia aunque cambien los precios o las reglas.
- **Numeración** (decisión de negocio 2026-06-11 — formato de CorrespondencyBot):
  `{C|R}{DDMM}-{YY}{consecutivo}`, ej. `C1503-26101`. DDMM = fecha del evento ("XXXX" si
  no hay fecha); consecutivo anual por tipo iniciando en **100**, reinicia cada año.
  Implementado en `app/lib/domain/numbering.ts`; persistencia vía `DocumentCounter`
  con `UPDATE ... SET last_value = last_value + 1 RETURNING` en transacción.
- **Unicidad activa**: solo 1 `SENT` por evento — índice parcial + regla de dominio:
  al enviar una nueva, la `SENT` anterior pasa a `EXPIRED` (historial).
- **Vigencia**: `validUntil = issuedAt + Settings.quoteValidityDays` (7 default).
  Job diario: `SENT` con `validUntil < hoy` → `EXPIRED` + tarea automática.
- **Aceptar** (`quote.accepted`): estado → `ACCEPTED`, crea `Reservation`, evento →
  `RESERVED`. Todo en una transacción.

## 5.3 Reservaciones y pagos

- Crear reservación exige cotización `ACCEPTED` (FK + validación).
- `depositAmount = agreedTotal × Settings.depositPercent` (50%);
  `depositDueDate = eventDate − 14 días` (si faltan <14 días, `hoy + 2`);
  `balanceDueDate = eventDate`.
- **Registrar pago** (`Payment`): el dominio decide el efecto:

```ts
async function registerPayment(reservationId, { amount, kind, ... }, actor) {
  // suma pagos por kind; transiciones de paymentStatus:
  // PENDING_DEPOSIT  --pago ≥ depositAmount-->  DEPOSIT_RECEIVED  (evento → CONFIRMED)
  // DEPOSIT_RECEIVED --evento próximo-->        BALANCE_PENDING   (job, no pago)
  // * --total pagado ≥ agreedTotal-->           FULLY_PAID        (habilita COMPLETED)
}
```

- Saldo registrado → el evento **puede** marcarse `COMPLETED` (acción manual del
  equipo tras ejecutar el evento, no automática).
- **Cancelación** (decisión de negocio 2026-06-11): cancelar un evento con anticipo
  pagado **no genera devolución**. El sistema solo registra la cancelación en
  notas/auditoría; los pagos quedan en el historial tal como ocurrieron.

## 5.4 Recordatorios y tareas automáticas

Motor: job idempotente (ver doc 06 §jobs) que evalúa reglas y hace upsert de `Task`
con `autoKey` única — correr el job dos veces no duplica tareas.

| Regla | Condición | `autoKey` | Tarea generada |
|-------|-----------|-----------|----------------|
| Seguimiento 24h | Quote `SENT` hace >24h sin interacción posterior del cliente | `QUOTE_FOLLOWUP_24H:{quoteId}` | "Dar seguimiento a {cliente}" |
| Seguimiento 72h | ídem >72h | `QUOTE_FOLLOWUP_72H:{quoteId}` | + mensaje sugerido de WhatsApp listo para copiar |
| Anticipo por vencer | `depositDueDate − 3 días`, estado `PENDING_DEPOSIT` | `DEPOSIT_DUE:{reservationId}` | "Recordar anticipo a {cliente}" |
| Reactivación | Cliente con último evento `COMPLETED` hace >3 meses y sin contacto posterior | `REACTIVATE:{clientId}:{trimestre}` | "Reactivar a {cliente}" |
| Confirmar detalles | Evento `CONFIRMED`, faltan 7 días | `EVENT_DETAILS:{eventId}` | "Confirmar detalles del evento" |
| Verificar colaboradores | Evento `CONFIRMED` a ≤5 días sin asignaciones | `EVENT_STAFF:{eventId}` | "Asignar colaboradores" |
| Revisar transporte | Evento `CONFIRMED`, faltan 3 días | `EVENT_TRANSPORT:{eventId}` | "Revisar logística/transporte" |
| Cobrar saldo | Evento `COMPLETED` con `BALANCE_PENDING` | `BALANCE_DUE:{reservationId}` | "Cobrar saldo restante" |
| Post-evento | Evento `COMPLETED` hace 1 día | `POST_EVENT:{eventId}` | "Seguimiento post-evento (fotos, feedback)" |

Las tareas automáticas se cierran solas cuando su condición desaparece (ej. el
cliente respondió → al registrar la interacción, el dominio completa las tareas
`QUOTE_FOLLOWUP_*` de esa cotización). Diseño listo para notificaciones externas
futuras: cada upsert de tarea emite también un registro en `AuditLog` que un canal
posterior (correo/WhatsApp API) podrá consumir.

## 5.5 Conflictos de calendario

```ts
async function findResourceConflicts(tx, { eventId, date, startTime, durationHours,
  collaboratorIds, catalogItemIds }) {
  // Eventos del mismo día (≠ eventId, deletedAt null, etapa ∈ {RESERVED, CONFIRMED})
  // cuyo rango [start, start+duración] se solape, y que compartan colaborador
  // o personaje (EventAssignment / EventCatalogItem).
  // → CONFIRMED genera conflicto BLOQUEANTE; RESERVED genera ADVERTENCIA.
}
```

- Se evalúa al: asignar colaborador/personaje, cambiar fecha/hora, y avanzar a
  `RESERVED`/`CONFIRMED`. La UI muestra advertencia inline; solo `CONFIRMED`
  vs `CONFIRMED` impide guardar.

## 5.6 Cliente existente por teléfono

- Normalizar a E.164 antes de cualquier búsqueda/persistencia.
- `findClientByPhone(e164)` en el alta (consulta debounced): si existe →
  bloquear duplicado y ofrecer "abrir cliente / crear evento para este cliente".
- Índice único parcial garantiza la regla aunque la UI falle.

## 5.7 Notas y calificaciones

- **Notas** (`Note`): timeline por cliente/evento/colaborador, con autor. El campo
  `Event.internalNotes` queda como resumen fijo; la bitácora granular va en `Note`.
- **Calificación de evento**: `Event.rating` 1–5 opcional, editable desde REALIZADO.
- **Calificación de colaborador**: en `EventAssignment.rating` (por evento, nunca en
  el perfil). Al guardar: `recomputeCollaboratorRating(tx, collaboratorId)` →
  promedio de asignaciones calificadas; sin calificaciones → `null` (UI: "Sin
  calificación", jamás 0).

## 5.8 Interacciones y último contacto

- `Interaction` (WhatsApp/llamada, entrada/salida, resumen). Insertar una →
  `Client.lastContactAt = occurredAt` + cierre de tareas de seguimiento aplicables.

## 5.9 Auditoría

- Helper único `audit(tx, actor, action, entityType, entityId, changes?, context?)`
  llamado por todos los servicios de dominio en la misma transacción.
- Acciones del MVP: `client.created/updated/deleted/restored`,
  `event.created/updated/stage_changed/rated`, `quote.created/sent/accepted/
  rejected/expired`, `reservation.created`, `payment.registered`,
  `assignment.created/rated`, `task.created/completed`, `note.created`,
  `package.created/updated`, `catalog_item.created/updated`.
- Responde "quién hizo qué y cuándo" sin sistema de permisos.

## 5.10 Preparación Google Calendar (post-MVP, sin trabajo extra ahora)

- Campos ya en `Event`: `externalCalendarId`, `externalCalendarEventId`,
  `syncStatus`, `lastSyncedAt`.
- Regla futura: eventos `CONFIRMED` se empujan al calendario; cambios de
  fecha/hora marcan `syncStatus = PENDING`; un job hace push/pull. Nada del MVP
  depende de esto, pero ningún dato habrá que migrar cuando llegue.
