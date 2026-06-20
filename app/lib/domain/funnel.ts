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

/**
 * Etapas que están "más allá de la compuerta de calificación": para avanzar a
 * cualquiera de ellas el evento debe estar calificado (regla de negocio:
 * "nunca se cotiza antes de calificar"). CANCELED queda fuera a propósito.
 */
export const QUALIFICATION_REQUIRED_STAGES: readonly FunnelStage[] = [
  "QUOTED",
  "RESERVED",
  "CONFIRMED",
  "COMPLETED",
];

/**
 * Campos de calificación de un evento (extraídos del Lead/Evento en PROSPECT/CONTACTED).
 * Booleans "ya tiene el dato": el mapeo desde el registro Prisma vive en el llamador
 * para mantener este módulo libre de dependencias de BD.
 */
export type EventQualification = {
  /** Solo los eventos infantiles exigen edad del festejado. */
  isChildrenEvent: boolean;
  hasEventDate: boolean;
  hasGuestCount: boolean;
  hasVenueAddress: boolean;
  hasHonoreeAge: boolean;
  /** Tema o personaje solicitado: requestedCharacterId O partyTheme. */
  hasTheme: boolean;
};

/** Devuelve las etiquetas (en español) de los datos de calificación que faltan. */
export function missingQualificationFields(q: EventQualification): string[] {
  const missing: string[] = [];
  if (!q.hasEventDate) missing.push("la fecha del evento");
  if (!q.hasGuestCount) missing.push("el número de chiquitos");
  if (!q.hasVenueAddress) missing.push("la dirección (zona) del evento");
  if (q.isChildrenEvent && !q.hasHonoreeAge) missing.push("la edad del festejado");
  if (!q.hasTheme) missing.push("el tema o personaje solicitado");
  return missing;
}

function joinInSpanish(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/**
 * Mensaje de bloqueo si el evento no está calificado, o `null` si lo está.
 * Úsalo para impedir tanto el cambio de etapa a COTIZADO como la generación
 * de la cotización en sí (el enforcement más fuerte: sin calificar no hay PDF).
 */
export function qualificationError(q: EventQualification): string | null {
  const missing = missingQualificationFields(q);
  if (missing.length === 0) return null;
  return `No se puede cotizar sin terminar de calificar al cliente. Falta ${joinInSpanish(
    missing,
  )}.`;
}

export type TransitionValidationContext = {
  hasEventDate: boolean;
  hasAcceptedQuote: boolean;
  depositReceived: boolean;
  /** Estado de calificación del evento; requerido al cruzar la compuerta a COTIZADO. */
  qualification?: EventQualification;
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
  // Compuerta de calificación: solo se valida al CRUZARLA hacia adelante (el origen
  // aún no estaba calificado). Editar un evento ya cotizado/realizado no re-bloquea.
  if (
    QUALIFICATION_REQUIRED_STAGES.includes(to) &&
    !QUALIFICATION_REQUIRED_STAGES.includes(from) &&
    ctx.qualification
  ) {
    const reason = qualificationError(ctx.qualification);
    if (reason) return { ok: false, reason };
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
