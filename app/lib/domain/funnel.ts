// Embudo de ventas — máquina de estados de la oportunidad comercial (Evento).
// Fuente única de verdad para etapas, transiciones válidas y etiquetas en español.
// Los valores coinciden con el enum FunnelStage de prisma/schema.prisma.
//
// Nota de modelo: RECURRENTE no es una etapa de evento sino una condición del
// cliente (Client.isRecurring, derivada de >1 evento COMPLETED). En el embudo
// del dashboard se muestra como columna propia contando clientes recurrentes.

export const FUNNEL_STAGES = [
  "PROSPECT",
  "CONTACTED",
  "QUOTED",
  "RESERVED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  PROSPECT: "Prospecto",
  CONTACTED: "Contactado",
  QUOTED: "Cotizado",
  RESERVED: "Reservado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Realizado",
  CANCELED: "Cancelado",
};

// Transiciones permitidas. CANCELED es alcanzable desde cualquier etapa no final;
// QUOTED → CONTACTED permite re-trabajar el contexto antes de re-cotizar.
export const FUNNEL_TRANSITIONS: Record<FunnelStage, readonly FunnelStage[]> = {
  PROSPECT: ["CONTACTED", "CANCELED"],
  CONTACTED: ["QUOTED", "CANCELED"],
  QUOTED: ["RESERVED", "CONTACTED", "CANCELED"],
  RESERVED: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  CANCELED: [],
};

export function canTransition(from: FunnelStage, to: FunnelStage): boolean {
  return FUNNEL_TRANSITIONS[from].includes(to);
}

/** Etapas que bloquean recursos (personajes/colaboradores) en el calendario. */
export const RESOURCE_BLOCKING_STAGES: readonly FunnelStage[] = [
  "CONFIRMED",
];

/** Etapas desde las cuales el evento exige fecha definida. */
export const DATE_REQUIRED_STAGES: readonly FunnelStage[] = [
  "RESERVED",
  "CONFIRMED",
  "COMPLETED",
];

export type TransitionValidationContext = {
  hasEventDate: boolean;
  hasAcceptedQuote: boolean;
  depositReceived: boolean;
};

export type TransitionValidation =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Valida una transición con las reglas de negocio del MVP.
 * Los servicios de dominio deben llamar esto antes de persistir el cambio
 * (y registrar el resultado en AuditLog como "event.stage_changed").
 */
export function validateTransition(
  from: FunnelStage,
  to: FunnelStage,
  ctx: TransitionValidationContext,
): TransitionValidation {
  if (!canTransition(from, to)) {
    return {
      ok: false,
      reason: `No se puede pasar de ${FUNNEL_STAGE_LABELS[from]} a ${FUNNEL_STAGE_LABELS[to]}.`,
    };
  }
  if (DATE_REQUIRED_STAGES.includes(to) && !ctx.hasEventDate) {
    return {
      ok: false,
      reason: "El evento necesita fecha definida antes de reservarse.",
    };
  }
  if (to === "RESERVED" && !ctx.hasAcceptedQuote) {
    return {
      ok: false,
      reason: "Para reservar se requiere una cotización aceptada.",
    };
  }
  if (to === "CONFIRMED" && !ctx.depositReceived) {
    return {
      ok: false,
      reason: "Para confirmar se requiere el anticipo registrado.",
    };
  }
  return { ok: true };
}
