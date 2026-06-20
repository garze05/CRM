// Servicio server-side de Eventos. Devuelve datos listos para la tabla y el
// calendario. Conserva los nombres de campo que ya usan los componentes
// (date, pipelineStatus, type, paymentStatus…) pero con valores en inglés
// (enums de Prisma) y nullables donde el dato vive en Quote/Reservation.
import "server-only";
import { prisma } from "../db";
import {
	type FunnelStage,
	QUALIFICATION_REQUIRED_STAGES,
	qualificationError,
} from "../domain/funnel";

/** Fecha date-only (@db.Date) → "YYYY-MM-DD" en UTC (evita el corrimiento de día). */
function toDateKey(date: Date | null): string {
	if (!date) return "";
	return date.toISOString().slice(0, 10);
}

function decimalToNumber(value: unknown): number | null {
	if (value === null || value === undefined) return null;
	const n = Number(value);
	return Number.isNaN(n) ? null : n;
}

export type EventListItem = {
	id: string;
	name: string;
	clientId: string;
	clientName: string;
	clientPhone: string;
	/** "YYYY-MM-DD" o "" si aún no tiene fecha. El calendario filtra los sin fecha. */
	date: string;
	startTime: string;
	durationHours: number;
	venueName: string;
	venueAddress: string;
	/** Valor del enum EventType (inglés). */
	type: string;
	/** Valor del enum FunnelStage (inglés). */
	pipelineStatus: FunnelStage;
	/** De la reservación; null si el evento aún no tiene reservación. */
	paymentStatus: string | null;
	/** De la reservación o la última cotización; null si no hay. */
	estimatedTotal: number | null;
	/** Nombres de personajes/ítems de catálogo vinculados. */
	characters: string[];
	/** Conceptos cotizados (personajes/servicios de las líneas) — para búsqueda. */
	serviceTags: string[];
	collaboratorNames: string[];
	alerts: string[];
};

function buildAlerts(item: {
	pipelineStatus: FunnelStage;
	paymentStatus: string | null;
	collaboratorNames: string[];
}): string[] {
	const alerts: string[] = [];
	if (
		(item.pipelineStatus === "RESERVED" || item.pipelineStatus === "CONFIRMED") &&
		(item.paymentStatus === null || item.paymentStatus === "PENDING_DEPOSIT")
	) {
		alerts.push("Anticipo pendiente");
	}
	if (item.pipelineStatus === "CONFIRMED" && item.collaboratorNames.length === 0) {
		alerts.push("Sin colaboradores asignados");
	}
	return alerts;
}

const listInclude = {
	client: { select: { firstName: true, lastName: true, phone: true } },
	characters: { include: { catalogItem: { select: { name: true } } } },
	assignments: {
		include: {
			collaborator: { select: { firstName: true, lastName: true } },
		},
	},
	reservation: { select: { paymentStatus: true, agreedTotal: true } },
	quotes: {
		where: { deletedAt: null },
		orderBy: { issuedAt: "desc" },
		select: { total: true, lineItems: true },
	},
} as const;

type EventWithRelations = {
	id: string;
	name: string;
	clientId: string;
	eventDate: Date | null;
	startTime: string | null;
	durationHours: unknown;
	venueName: string | null;
	venueAddress: string | null;
	eventType: string;
	funnelStage: string;
	client: { firstName: string; lastName: string; phone: string } | null;
	characters: { catalogItem: { name: string } }[];
	assignments: { collaborator: { firstName: string; lastName: string } }[];
	reservation: { paymentStatus: string; agreedTotal: unknown } | null;
	quotes: { total: unknown; lineItems: unknown }[];
};

/** Extrae los conceptos (personajes/servicios) de las líneas de cotización. */
function serviceTagsFromQuotes(quotes: { lineItems: unknown }[]): string[] {
	const tags = new Set<string>();
	for (const quote of quotes) {
		if (!Array.isArray(quote.lineItems)) continue;
		for (const line of quote.lineItems as Array<Record<string, unknown>>) {
			const concepto = line?.concepto;
			if (typeof concepto === "string" && !/transporte/i.test(concepto)) {
				// Quitar prefijos tipo "Personaje: " para que la búsqueda sea natural.
				tags.add(concepto.replace(/^[^:]+:\s*/, "").trim());
			}
		}
	}
	return [...tags];
}

function toListItem(event: EventWithRelations): EventListItem {
	const collaboratorNames = event.assignments.map(
		a => `${a.collaborator.firstName} ${a.collaborator.lastName}`,
	);
	const pipelineStatus = event.funnelStage as FunnelStage;
	const paymentStatus = event.reservation?.paymentStatus ?? null;
	const estimatedTotal =
		decimalToNumber(event.reservation?.agreedTotal) ??
		decimalToNumber(event.quotes[0]?.total);

	return {
		id: event.id,
		name: event.name,
		clientId: event.clientId,
		clientName: event.client
			? `${event.client.firstName} ${event.client.lastName}`
			: "Sin cliente",
		clientPhone: event.client?.phone ?? "",
		date: toDateKey(event.eventDate),
		startTime: event.startTime ?? "",
		durationHours: decimalToNumber(event.durationHours) ?? 0,
		venueName: event.venueName ?? "",
		venueAddress: event.venueAddress ?? "",
		type: event.eventType,
		pipelineStatus,
		paymentStatus,
		estimatedTotal,
		characters: event.characters.map(c => c.catalogItem.name),
		serviceTags: serviceTagsFromQuotes(event.quotes),
		collaboratorNames,
		alerts: buildAlerts({ pipelineStatus, paymentStatus, collaboratorNames }),
	};
}

export async function listEvents(): Promise<EventListItem[]> {
	const events = await prisma.event.findMany({
		where: { deletedAt: null },
		orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
		include: listInclude,
	});
	return events.map(event => toListItem(event as unknown as EventWithRelations));
}

/** Detalle de un evento con cliente, asignaciones (+colaborador) y cotizaciones. */
export async function getEventDetail(id: string) {
	return prisma.event.findFirst({
		where: { id, deletedAt: null },
		include: {
			client: true,
			characters: { include: { catalogItem: { select: { name: true } } } },
			assignments: {
				include: { collaborator: true },
				orderBy: { createdAt: "asc" },
			},
			quotes: {
				where: { deletedAt: null },
				orderBy: { issuedAt: "desc" },
			},
			reservation: true,
		},
	});
}

export type EventDetail = NonNullable<
	Awaited<ReturnType<typeof getEventDetail>>
>;

const CLIENT_TYPE_LABEL: Record<string, string> = {
	FAMILY: "Familiar",
	EDUCATIONAL: "Educativo",
	CORPORATE: "Corporativo",
	SHOPPING_CENTER: "Centro Comercial",
	ADVERTISING_AGENCY: "Agencia de Publicidad",
};

/** Clientes activos para el combobox del formulario (búsqueda por nombre/teléfono). */
export async function listClientsForSelect() {
	const clients = await prisma.client.findMany({
		where: { deletedAt: null },
		orderBy: { firstName: "asc" },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			phone: true,
			phoneFormatted: true,
			type: true,
			isRecurring: true,
		},
	});
	return clients.map(c => {
		const name = `${c.firstName} ${c.lastName}`;
		const typeLabel = CLIENT_TYPE_LABEL[c.type] ?? c.type;
		return {
			id: c.id,
			label: `${name} · ${c.phoneFormatted}${c.isRecurring ? " · Recurrente" : ""}`,
			// Búsqueda por nombre, teléfono formateado, teléfono E.164 y tipo.
			searchText: `${name} ${c.phoneFormatted} ${c.phone} ${typeLabel}`,
		};
	});
}

/** Eventos activos para selectores (ej. generar cotización). */
export async function listEventsForSelect() {
	const events = await prisma.event.findMany({
		where: { deletedAt: null },
		orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
		select: {
			id: true,
			name: true,
			client: { select: { firstName: true, lastName: true } },
		},
	});
	return events.map(e => ({
		id: e.id,
		label: e.client
			? `${e.name} · ${e.client.firstName} ${e.client.lastName}`
			: e.name,
	}));
}

export type CreateEventData = {
	clientId: string;
	name: string;
	eventType: string;
	funnelStage: string;
	eventDate: string | null;
	startTime: string | null;
	durationHours: number | null;
	guestCount: number | null;
	honoreeName: string | null;
	honoreeAge: number | null;
	partyTheme: string | null;
	venueName: string | null;
	venueAddress: string | null;
	venueType: string | null;
};

export type CreateEventResult =
	| { ok: true; id: string }
	| { ok: false; error: string };

export async function createEvent(
	data: CreateEventData,
): Promise<CreateEventResult> {
	const client = await prisma.client.findFirst({
		where: { id: data.clientId, deletedAt: null },
		select: { id: true },
	});
	if (!client) {
		return { ok: false, error: "El cliente seleccionado no existe." };
	}

	// No se puede crear un evento ya COTIZADO sin calificación: forzá arrancar en
	// Prospecto/Contactado, calificar y luego avanzar (misma regla que updateEvent).
	if (QUALIFICATION_REQUIRED_STAGES.includes(data.funnelStage as FunnelStage)) {
		const reason = qualificationError({
			isChildrenEvent: data.eventType === "CHILDREN",
			hasEventDate: Boolean(data.eventDate),
			hasGuestCount: data.guestCount != null,
			hasVenueAddress: Boolean(data.venueAddress?.trim()),
			hasHonoreeAge: data.honoreeAge != null,
			hasTheme: Boolean(data.partyTheme?.trim()),
		});
		if (reason) return { ok: false, error: reason };
	}

	const event = await prisma.event.create({
		data: {
			clientId: data.clientId,
			name: data.name,
			eventType: data.eventType as never,
			funnelStage: data.funnelStage as never,
			eventDate: data.eventDate ? new Date(`${data.eventDate}T00:00:00Z`) : null,
			startTime: data.startTime || null,
			durationHours: data.durationHours ?? null,
			guestCount: data.guestCount ?? null,
			honoreeName: data.honoreeName || null,
			honoreeAge: data.honoreeAge ?? null,
			partyTheme: data.partyTheme || null,
			venueName: data.venueName || null,
			venueAddress: data.venueAddress || null,
			venueType: (data.venueType || null) as never,
		},
		select: { id: true },
	});

	return { ok: true, id: event.id };
}

export type UpdateEventData = {
	id: string;
	clientId: string;
	name: string;
	eventType: string;
	funnelStage: string;
	eventDate: string | null;
	startTime: string | null;
	guestCount: number | null;
	honoreeName: string | null;
	honoreeAge: number | null;
	partyTheme: string | null;
	venueAddress: string | null;
	internalNotes: string | null;
};

export async function updateEvent(
	data: UpdateEventData,
): Promise<CreateEventResult> {
	const existing = await prisma.event.findFirst({
		where: { id: data.id, deletedAt: null },
		select: { id: true, funnelStage: true, requestedCharacterId: true },
	});
	if (!existing) return { ok: false, error: "El evento no existe." };

	const client = await prisma.client.findFirst({
		where: { id: data.clientId, deletedAt: null },
		select: { id: true },
	});
	if (!client) return { ok: false, error: "El cliente seleccionado no existe." };

	// Compuerta de calificación: bloquea avanzar a COTIZADO (o más allá) sin los
	// datos de calificación. Solo aplica al cruzar la compuerta hacia adelante.
	const fromStage = existing.funnelStage as FunnelStage;
	const toStage = data.funnelStage as FunnelStage;
	const crossingQualificationGate =
		QUALIFICATION_REQUIRED_STAGES.includes(toStage) &&
		!QUALIFICATION_REQUIRED_STAGES.includes(fromStage);
	if (crossingQualificationGate) {
		const reason = qualificationError({
			isChildrenEvent: data.eventType === "CHILDREN",
			hasEventDate: Boolean(data.eventDate),
			hasGuestCount: data.guestCount != null,
			hasVenueAddress: Boolean(data.venueAddress?.trim()),
			hasHonoreeAge: data.honoreeAge != null,
			hasTheme: Boolean(
				existing.requestedCharacterId || data.partyTheme?.trim(),
			),
		});
		if (reason) return { ok: false, error: reason };
	}

	await prisma.event.update({
		where: { id: data.id },
		data: {
			clientId: data.clientId,
			name: data.name,
			eventType: data.eventType as never,
			funnelStage: data.funnelStage as never,
			eventDate: data.eventDate ? new Date(`${data.eventDate}T00:00:00Z`) : null,
			startTime: data.startTime || null,
			guestCount: data.guestCount ?? null,
			honoreeName: data.honoreeName || null,
			honoreeAge: data.honoreeAge ?? null,
			partyTheme: data.partyTheme || null,
			venueAddress: data.venueAddress || null,
			internalNotes: data.internalNotes || null,
		},
	});

	return { ok: true, id: data.id };
}
