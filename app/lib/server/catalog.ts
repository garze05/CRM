import "server-only";
import { prisma } from "../db";
import type { CatalogListItem } from "../domain/catalog";

function toCatalogListItem(item: {
	id: string;
	name: string;
	category: string;
	description: string | null;
	imageUrl: string | null;
	galleryUrls: string[];
	tags: string[];
	active: boolean;
	hourlyPrice: unknown;
}): CatalogListItem {
	return {
		id: item.id,
		name: item.name,
		category: item.category as CatalogListItem["category"],
		description: item.description ?? "",
		active: item.active,
		availabilityStatus: item.active ? "AVAILABLE" : "MAINTENANCE_PENDING",
		tags: item.tags,
		imageUrl: item.imageUrl,
		galleryUrls: item.galleryUrls,
		hourlyPrice: item.hourlyPrice == null ? null : Number(item.hourlyPrice),
	};
}

export async function listCatalogItems(): Promise<CatalogListItem[]> {
	const items = await prisma.catalogItem.findMany({
		where: { deletedAt: null },
		orderBy: [{ active: "desc" }, { name: "asc" }],
	});
	return items.map(item => toCatalogListItem(item));
}

export async function listActiveCatalogItems(): Promise<CatalogListItem[]> {
	const items = await prisma.catalogItem.findMany({
		where: { deletedAt: null, active: true },
		orderBy: { name: "asc" },
	});
	return items.map(item => toCatalogListItem(item));
}

export async function getCatalogItem(id: string): Promise<CatalogListItem | null> {
	const item = await prisma.catalogItem.findFirst({
		where: { id, deletedAt: null },
	});
	return item ? toCatalogListItem(item) : null;
}
