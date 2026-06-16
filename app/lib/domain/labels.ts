// Etiquetas en español para los enums de Prisma (código en inglés, UI en
// español). Centraliza lo que no vive ya en funnel.ts o validation/client.ts.
// Reexporta las etiquetas existentes para tener un único punto de importación.
export { FUNNEL_STAGE_LABELS } from "./funnel";
export type { FunnelStage } from "./funnel";
export { CLIENT_TYPE_LABELS } from "../validation/client";

export const EVENT_TYPE_LABELS: Record<string, string> = {
	CHILDREN: "Infantil",
	CORPORATE: "Corporativo",
	INSTITUTIONAL: "Institucional",
};

export const VENUE_TYPE_LABELS: Record<string, string> = {
	INDOOR: "Interior",
	OUTDOOR: "Exterior",
};

export const INTERACTION_CHANNEL_LABELS: Record<string, string> = {
	WHATSAPP: "WhatsApp",
	PHONE_CALL: "Llamada",
	IN_PERSON: "Presencial",
	OTHER: "Otro",
};

export const INTERACTION_DIRECTION_LABELS: Record<string, string> = {
	INBOUND: "Entrante",
	OUTBOUND: "Saliente",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
	PENDING_DEPOSIT: "Pendiente anticipo",
	DEPOSIT_RECEIVED: "Anticipo recibido",
	BALANCE_PENDING: "Saldo pendiente",
	FULLY_PAID: "Pagado completo",
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
	DRAFT: "Borrador",
	SENT: "Enviada",
	ACCEPTED: "Aceptada",
	EXPIRED: "Vencida",
	REJECTED: "Rechazada",
};
