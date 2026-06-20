// Servicio server-side de Clientes. Lee/escribe vía Prisma y devuelve datos ya
// listos para la UI. Los enums se mantienen en inglés (valores de Prisma); las
// etiquetas en español se resuelven en los componentes con los mapas de
// app/lib/domain/labels.ts.
import "server-only";
import { prisma } from "../db";
import type { FunnelStage } from "../domain/funnel";

export type ClientListRow = {
	id: string;
	firstName: string;
	lastName: string;
	phoneFormatted: string;
	type: string;
	/** Etapa del evento activo más reciente; null si no hay oportunidad abierta. */
	activeOpportunityStage: FunnelStage | null;
	isRecurring: boolean;
	lastContactAt: Date;
	eventsCount: number;
};

/**
 * Lista de clientes activos (no soft-deleted) con datos derivados para la tabla.
 *
 * Nota de modelo: el Cliente NO tiene un campo de etapa de embudo; el embudo
 * vive por Evento (FunnelStage). La tabla muestra la oportunidad abierta más
 * reciente y expone la recurrencia como condición del cliente.
 */
export async function listClients(): Promise<ClientListRow[]> {
	const clients = await prisma.client.findMany({
		where: { deletedAt: null },
		orderBy: { lastContactAt: "desc" },
		include: {
			events: {
				where: {
					deletedAt: null,
					funnelStage: {
						in: ["PROSPECT", "CONTACTED", "QUOTED", "RESERVED", "CONFIRMED"],
					},
				},
				orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
				select: { funnelStage: true },
			},
			_count: {
				select: { events: { where: { deletedAt: null } } },
			},
		},
	});

	return clients.map(client => ({
		id: client.id,
		firstName: client.firstName,
		lastName: client.lastName,
		phoneFormatted: client.phoneFormatted,
		type: client.type,
		activeOpportunityStage: (client.events[0]?.funnelStage ??
			null) as FunnelStage | null,
		isRecurring: client.isRecurring,
		lastContactAt: client.lastContactAt,
		eventsCount: client._count.events,
	}));
}

/** Detalle completo de un cliente con eventos e interacciones. */
export async function getClientDetail(id: string) {
	return prisma.client.findFirst({
		where: { id, deletedAt: null },
		include: {
			events: {
				where: { deletedAt: null },
				orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
			},
			interactions: {
				orderBy: { occurredAt: "desc" },
			},
		},
	});
}

export type ClientDetail = NonNullable<
	Awaited<ReturnType<typeof getClientDetail>>
>;

export type CreateClientData = {
	firstName: string;
	lastName: string;
	phone: string;
	phoneCountry: string;
	phoneFormatted: string;
	type: string;
	companyName?: string | null;
	companyPhone?: string | null;
	notes?: string;
	responsibleId?: string | null;
};

export type CreateClientResult =
	| { ok: true; id: string }
	| { ok: false; error: string; field?: "phone" };

/**
 * Crea un cliente. Si el teléfono ya existe entre clientes activos, devuelve un
 * error de negocio (regla del MVP: alertar cliente existente, no duplicar).
 */
export async function createClient(
	data: CreateClientData,
): Promise<CreateClientResult> {
	const existing = await prisma.client.findFirst({
		where: { phone: data.phone, deletedAt: null },
		select: { id: true },
	});
	if (existing) {
		return {
			ok: false,
			field: "phone",
			error: "Ya existe un cliente activo con ese teléfono.",
		};
	}

	const client = await prisma.client.create({
		data: {
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
			phoneCountry: data.phoneCountry,
			phoneFormatted: data.phoneFormatted,
			type: data.type as never,
			companyName: data.companyName ?? null,
			companyPhone: data.companyPhone ?? null,
			notes: data.notes || null,
			responsibleId: data.responsibleId ?? null,
		},
		select: { id: true },
	});

	return { ok: true, id: client.id };
}
