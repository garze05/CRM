import "server-only";
import { prisma } from "../db";

export type TrashRow = {
	id: string;
	entityType: "Client" | "Event" | "Quote" | "CatalogItem" | "Collaborator";
	name: string;
	module: string;
	deletedAt: Date;
	status: string;
};

export async function listTrash(): Promise<TrashRow[]> {
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
	].sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}
