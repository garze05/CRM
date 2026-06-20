// Esquema de alta de evento. Valores de enums en inglés (Prisma); mensajes en
// español. El embudo arranca como máximo en COTIZADO (la cotización formal y los
// estados posteriores se gobiernan desde el flujo de cotización/reservación).
import { z } from "zod";

export const EVENT_TYPES = ["CHILDREN", "CORPORATE", "INSTITUTIONAL"] as const;
export const VENUE_TYPES = ["INDOOR", "OUTDOOR"] as const;
export const INITIAL_FUNNEL_STAGES = [
	"PROSPECT",
	"CONTACTED",
	"QUOTED",
] as const;

export const eventSchema = z.object({
	clientId: z.string().uuid("Seleccioná un cliente válido"),
	name: z.string().trim().min(1, "El nombre del evento es obligatorio"),
	eventType: z.enum(EVENT_TYPES, { message: "Seleccioná un tipo de evento" }),
	funnelStage: z.enum(INITIAL_FUNNEL_STAGES, {
		message: "Seleccioná un estado inicial válido",
	}),
	eventDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
		.optional()
		.or(z.literal("")),
	startTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/, "Hora inválida")
		.optional()
		.or(z.literal("")),
	durationHours: z
		.string()
		.optional()
		.or(z.literal("")),
	guestCount: z.string().optional().or(z.literal("")),
	honoreeName: z.string().trim().optional(),
	honoreeAge: z.string().optional().or(z.literal("")),
	partyTheme: z.string().trim().optional(),
	venueName: z.string().trim().optional(),
	venueAddress: z.string().trim().optional(),
	venueType: z.enum(VENUE_TYPES).optional().or(z.literal("")),
});

export type EventInput = z.infer<typeof eventSchema>;
