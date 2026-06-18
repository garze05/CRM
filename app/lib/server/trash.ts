import "server-only";
import { prisma } from "../db";

const TRASH_RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const TRASH_MAINTENANCE_INTERVAL_MS = 60 * 60 * 1000;
let lastTrashMaintenanceAt = 0;

export type TrashEntityType =
	| "Client"
	| "Event"
	| "Quote"
	| "CatalogItem"
	| "Collaborator";

export type TrashRow = {
	id: string;
	entityType: TrashEntityType;
	name: string;
	module: string;
	deletedAt: Date;
	expiresAt: Date;
	daysUntilPermanentDelete: number;
	isExpiringSoon: boolean;
	status: string;
};

function withRetention(row: Omit<TrashRow, "expiresAt" | "daysUntilPermanentDelete" | "isExpiringSoon">, now: Date): TrashRow {
	const expiresAt = new Date(row.deletedAt.getTime() + TRASH_RETENTION_DAYS * DAY_MS);
	const daysUntilPermanentDelete = Math.max(
		0,
		Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS),
	);
	return {
		...row,
		expiresAt,
		daysUntilPermanentDelete,
		isExpiringSoon: daysUntilPermanentDelete <= 7,
	};
}

export async function listTrash(): Promise<TrashRow[]> {
	await purgeExpiredTrash();
	const now = new Date();
	const [clients, events, quotes, catalogItems, collaborators] = await Promise.all([
		prisma.client.findMany({
			where: { deletedAt: { not: null } },
			select: { id: true, firstName: true, lastName: true, deletedAt: true, type: true },
		}),
		prisma.event.findMany({
			where: { deletedAt: { not: null } },
			select: { id: true, name: true, deletedAt: true, funnelStage: true },
		}),
		prisma.quote.findMany({
			where: { deletedAt: { not: null } },
			select: { id: true, quoteNumber: true, deletedAt: true, status: true },
		}),
		prisma.catalogItem.findMany({
			where: { deletedAt: { not: null } },
			select: { id: true, name: true, deletedAt: true, active: true },
		}),
		prisma.collaborator.findMany({
			where: { deletedAt: { not: null } },
			select: { id: true, firstName: true, lastName: true, deletedAt: true, active: true },
		}),
	]);

	return [
		...clients.map(row => ({
			id: row.id,
			entityType: "Client" as const,
			name: `${row.firstName} ${row.lastName}`,
			module: "Clientes",
			deletedAt: row.deletedAt!,
			status: row.type,
		})),
		...events.map(row => ({
			id: row.id,
			entityType: "Event" as const,
			name: row.name,
			module: "Eventos",
			deletedAt: row.deletedAt!,
			status: row.funnelStage,
		})),
		...quotes.map(row => ({
			id: row.id,
			entityType: "Quote" as const,
			name: row.quoteNumber,
			module: "Cotizaciones",
			deletedAt: row.deletedAt!,
			status: row.status,
		})),
		...catalogItems.map(row => ({
			id: row.id,
			entityType: "CatalogItem" as const,
			name: row.name,
			module: "Catálogo",
			deletedAt: row.deletedAt!,
			status: row.active ? "ACTIVO" : "PAUSADO",
		})),
		...collaborators.map(row => ({
			id: row.id,
			entityType: "Collaborator" as const,
			name: `${row.firstName} ${row.lastName}`,
			module: "Colaboradores",
			deletedAt: row.deletedAt!,
			status: row.active ? "ACTIVO" : "INACTIVO",
		})),
	]
		.map(row => withRetention(row, now))
		.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}

async function deletedLabel(entityType: TrashEntityType, id: string) {
	if (entityType === "Client") {
		const row = await prisma.client.findFirst({
			where: { id, deletedAt: { not: null } },
			select: { firstName: true, lastName: true },
		});
		return row ? `${row.firstName} ${row.lastName}` : null;
	}
	if (entityType === "Event") {
		const row = await prisma.event.findFirst({
			where: { id, deletedAt: { not: null } },
			select: { name: true },
		});
		return row?.name ?? null;
	}
	if (entityType === "Quote") {
		const row = await prisma.quote.findFirst({
			where: { id, deletedAt: { not: null } },
			select: { quoteNumber: true },
		});
		return row?.quoteNumber ?? null;
	}
	if (entityType === "CatalogItem") {
		const row = await prisma.catalogItem.findFirst({
			where: { id, deletedAt: { not: null } },
			select: { name: true },
		});
		return row?.name ?? null;
	}
	const row = await prisma.collaborator.findFirst({
		where: { id, deletedAt: { not: null } },
		select: { firstName: true, lastName: true },
	});
	return row ? `${row.firstName} ${row.lastName}` : null;
}

async function deleteEventGraph(
	tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
	eventIds: string[],
) {
	if (eventIds.length === 0) return;
	await tx.payment.deleteMany({
		where: { reservation: { eventId: { in: eventIds } } },
	});
	await tx.reservation.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.quote.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.eventService.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.eventCatalogItem.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.eventAssignment.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.task.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.note.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.interaction.deleteMany({ where: { eventId: { in: eventIds } } });
	await tx.event.deleteMany({ where: { id: { in: eventIds } } });
}

export async function deleteTrashItemPermanently(
	entityType: TrashEntityType,
	id: string,
): Promise<string | null> {
	const label = await deletedLabel(entityType, id);
	if (!label) return null;

	await prisma.$transaction(async tx => {
		if (entityType === "Client") {
			const events = await tx.event.findMany({
				where: { clientId: id },
				select: { id: true },
			});
			await deleteEventGraph(tx, events.map(event => event.id));
			await tx.interaction.deleteMany({ where: { clientId: id } });
			await tx.task.deleteMany({ where: { clientId: id } });
			await tx.note.deleteMany({ where: { clientId: id } });
			await tx.client.delete({ where: { id } });
		} else if (entityType === "Event") {
			await deleteEventGraph(tx, [id]);
		} else if (entityType === "Quote") {
			await tx.payment.deleteMany({
				where: { reservation: { quoteId: id } },
			});
			await tx.reservation.deleteMany({ where: { quoteId: id } });
			await tx.quote.delete({ where: { id } });
		} else if (entityType === "CatalogItem") {
			await tx.eventCatalogItem.deleteMany({ where: { catalogItemId: id } });
			await tx.packageItem.deleteMany({ where: { catalogItemId: id } });
			await tx.collaboratorCharacter.deleteMany({ where: { catalogItemId: id } });
			await tx.catalogItem.delete({ where: { id } });
		} else if (entityType === "Collaborator") {
			await tx.collaboratorCharacter.deleteMany({ where: { collaboratorId: id } });
			await tx.eventAssignment.deleteMany({ where: { collaboratorId: id } });
			await tx.task.deleteMany({ where: { collaboratorId: id } });
			await tx.note.deleteMany({ where: { collaboratorId: id } });
			await tx.collaborator.delete({ where: { id } });
		}
	});

	return label;
}

export async function purgeExpiredTrash(): Promise<number> {
	const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * DAY_MS);
	const [clients, events, quotes, catalogItems, collaborators] = await Promise.all([
		prisma.client.findMany({
			where: { deletedAt: { lte: cutoff } },
			select: { id: true },
		}),
		prisma.event.findMany({
			where: { deletedAt: { lte: cutoff } },
			select: { id: true },
		}),
		prisma.quote.findMany({
			where: { deletedAt: { lte: cutoff } },
			select: { id: true },
		}),
		prisma.catalogItem.findMany({
			where: { deletedAt: { lte: cutoff } },
			select: { id: true },
		}),
		prisma.collaborator.findMany({
			where: { deletedAt: { lte: cutoff } },
			select: { id: true },
		}),
	]);

	let deleted = 0;
	for (const row of clients) {
		if (await deleteTrashItemPermanently("Client", row.id)) deleted += 1;
	}
	for (const row of events) {
		if (await deleteTrashItemPermanently("Event", row.id)) deleted += 1;
	}
	for (const row of quotes) {
		if (await deleteTrashItemPermanently("Quote", row.id)) deleted += 1;
	}
	for (const row of catalogItems) {
		if (await deleteTrashItemPermanently("CatalogItem", row.id)) deleted += 1;
	}
	for (const row of collaborators) {
		if (await deleteTrashItemPermanently("Collaborator", row.id)) deleted += 1;
	}
	return deleted;
}

export async function purgeExpiredTrashIfDue(): Promise<number> {
	const now = Date.now();
	if (now - lastTrashMaintenanceAt < TRASH_MAINTENANCE_INTERVAL_MS) {
		return 0;
	}
	lastTrashMaintenanceAt = now;
	return purgeExpiredTrash();
}
