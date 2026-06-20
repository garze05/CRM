import "server-only";
import { prisma } from "../db";
import type { CatalogCategory } from "../domain/catalog";
import {
	catalogCategoryLabel,
	type PackageBuilderEntry,
	SERVICE_PRICE_TYPE_LABELS,
} from "../domain/package-builder";

export type PackageListItem = {
	id: string;
	name: string;
	quantity: number;
	categoryLabel: string;
};

export type PackageListRow = {
	id: string;
	name: string;
	description: string | null;
	durationHours: number;
	basePrice: number;
	active: boolean;
	itemCount: number;
	items: PackageListItem[];
};

export type ServiceListRow = {
	id: string;
	name: string;
	category: string | null;
	unitPrice: number;
	priceType: string;
	active: boolean;
};

export async function listPackages(): Promise<PackageListRow[]> {
	const packages = await prisma.package.findMany({
		where: { deletedAt: null },
		orderBy: [{ active: "desc" }, { name: "asc" }],
		include: {
			_count: { select: { items: true } },
			items: {
				include: { catalogItem: true, service: true },
				orderBy: { id: "asc" },
			},
		},
	});
	return packages.map(pkg => ({
		id: pkg.id,
		name: pkg.name,
		description: pkg.description,
		durationHours: Number(pkg.durationHours),
		basePrice: Number(pkg.basePrice),
		active: pkg.active,
		itemCount: pkg._count.items,
		items: pkg.items
			.map(line => {
				const entry = line.catalogItem
					? catalogItemToEntry(line.catalogItem)
					: line.service
						? serviceToEntry(line.service)
						: null;
				if (!entry) return null;
				return {
					id: line.id,
					name: entry.name,
					quantity: line.quantity,
					categoryLabel: entry.categoryLabel,
				};
			})
			.filter((item): item is PackageListItem => item != null),
	}));
}

export async function listServices(): Promise<ServiceListRow[]> {
	const services = await prisma.service.findMany({
		where: { deletedAt: null },
		orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
	});
	return services.map(service => ({
		id: service.id,
		name: service.name,
		category: service.category,
		unitPrice: Number(service.unitPrice),
		priceType: service.priceType,
		active: service.active,
	}));
}

// ---------------------------------------------------------------------------
// Creador de paquetes: catálogo unificado (personajes + servicios)
// ---------------------------------------------------------------------------

function catalogItemToEntry(item: {
	id: string;
	name: string;
	category: string;
	hourlyPrice: unknown;
}): PackageBuilderEntry {
	const category = item.category as CatalogCategory;
	return {
		kind: "catalog",
		id: item.id,
		name: item.name,
		categoryLabel: catalogCategoryLabel(category),
		unitPrice: item.hourlyPrice == null ? null : Number(item.hourlyPrice),
		perHour: true,
		priceTypeLabel: SERVICE_PRICE_TYPE_LABELS.PER_HOUR,
		catalogCategory: category,
	};
}

function serviceToEntry(service: {
	id: string;
	name: string;
	category: string | null;
	unitPrice: unknown;
	priceType: string;
}): PackageBuilderEntry {
	return {
		kind: "service",
		id: service.id,
		name: service.name,
		categoryLabel: service.category?.trim() || "General",
		unitPrice: service.unitPrice == null ? null : Number(service.unitPrice),
		perHour: service.priceType === "PER_HOUR",
		priceTypeLabel:
			SERVICE_PRICE_TYPE_LABELS[service.priceType] ?? service.priceType,
		catalogCategory: "SERVICE",
	};
}

/**
 * Lista todas las opciones activas que pueden componer un paquete: ítems del
 * catálogo (personajes, inflables…) y servicios à la carte, ya normalizados a
 * `PackageBuilderEntry` con su categoría real y precio.
 */
export async function listPackageBuilderEntries(): Promise<PackageBuilderEntry[]> {
	const [catalogItems, services] = await Promise.all([
		prisma.catalogItem.findMany({
			where: { deletedAt: null, active: true },
			orderBy: { name: "asc" },
		}),
		prisma.service.findMany({
			where: { deletedAt: null, active: true },
			orderBy: { name: "asc" },
		}),
	]);
	return [
		...catalogItems.map(catalogItemToEntry),
		...services.map(serviceToEntry),
	];
}

export type PackageItemInput = {
	kind: "catalog" | "service";
	id: string;
	quantity: number;
};

function toPackageItemData(item: PackageItemInput) {
	return {
		catalogItemId: item.kind === "catalog" ? item.id : null,
		serviceId: item.kind === "service" ? item.id : null,
		quantity: item.quantity,
	};
}

export type CreatePackageInput = {
	name: string;
	description?: string | null;
	durationHours: number;
	basePrice: number;
	items: PackageItemInput[];
};

export async function createPackage(
	input: CreatePackageInput,
): Promise<{ id: string }> {
	const created = await prisma.package.create({
		data: {
			name: input.name,
			description: input.description || null,
			durationHours: input.durationHours,
			basePrice: input.basePrice,
			items: { create: input.items.map(toPackageItemData) },
		},
		select: { id: true },
	});
	return created;
}

export type PackageBuilderLine = {
	entry: PackageBuilderEntry;
	quantity: number;
};

export type PackageForEdit = {
	id: string;
	name: string;
	durationHours: number;
	basePrice: number;
	active: boolean;
	lines: PackageBuilderLine[];
};

/**
 * Carga un paquete con su composición para edición. Cada línea resuelve el
 * detalle de su ítem de catálogo o servicio (incluso si quedó inactivo, para no
 * perderlo al editar).
 */
export async function getPackageForEdit(
	id: string,
): Promise<PackageForEdit | null> {
	const pkg = await prisma.package.findFirst({
		where: { id, deletedAt: null },
		include: {
			items: {
				include: { catalogItem: true, service: true },
				orderBy: { id: "asc" },
			},
		},
	});
	if (!pkg) return null;

	const lines: PackageBuilderLine[] = [];
	for (const line of pkg.items) {
		if (line.catalogItem) {
			lines.push({
				entry: catalogItemToEntry(line.catalogItem),
				quantity: line.quantity,
			});
		} else if (line.service) {
			lines.push({
				entry: serviceToEntry(line.service),
				quantity: line.quantity,
			});
		}
	}

	return {
		id: pkg.id,
		name: pkg.name,
		durationHours: Number(pkg.durationHours),
		basePrice: Number(pkg.basePrice),
		active: pkg.active,
		lines,
	};
}

export type UpdatePackageInput = {
	id: string;
	name: string;
	description?: string | null;
	durationHours: number;
	basePrice: number;
	active: boolean;
	items: PackageItemInput[];
};

/**
 * Actualiza un paquete reemplazando por completo su composición (el creador de
 * paquetes administra tanto ítems de catálogo como servicios).
 */
export async function updatePackage(
	input: UpdatePackageInput,
): Promise<{ id: string }> {
	await prisma.$transaction(async tx => {
		await tx.package.update({
			where: { id: input.id },
			data: {
				name: input.name,
				description: input.description || null,
				durationHours: input.durationHours,
				basePrice: input.basePrice,
				active: input.active,
			},
		});
		await tx.packageItem.deleteMany({ where: { packageId: input.id } });
		if (input.items.length > 0) {
			await tx.packageItem.createMany({
				data: input.items.map(item => ({
					packageId: input.id,
					...toPackageItemData(item),
				})),
			});
		}
	});
	return { id: input.id };
}

// ---------------------------------------------------------------------------
// Servicios adicionales (CRUD)
// ---------------------------------------------------------------------------

/** Categorías de servicio existentes (texto libre), únicas y ordenadas. */
export async function listServiceCategories(): Promise<string[]> {
	const rows = await prisma.service.findMany({
		where: { deletedAt: null, category: { not: null } },
		select: { category: true },
		distinct: ["category"],
		orderBy: { category: "asc" },
	});
	return rows
		.map(row => row.category?.trim())
		.filter((value): value is string => !!value);
}

export type ServiceForEdit = {
	id: string;
	name: string;
	category: string;
	unitPrice: number;
	priceType: string;
	active: boolean;
	standaloneSellable: boolean;
};

export async function getServiceForEdit(
	id: string,
): Promise<ServiceForEdit | null> {
	const service = await prisma.service.findFirst({
		where: { id, deletedAt: null },
	});
	if (!service) return null;
	return {
		id: service.id,
		name: service.name,
		category: service.category ?? "",
		unitPrice: Number(service.unitPrice),
		priceType: service.priceType,
		active: service.active,
		standaloneSellable: service.standaloneSellable,
	};
}

export type ServiceInput = {
	name: string;
	category: string | null;
	unitPrice: number;
	priceType: "FIXED" | "PER_HOUR" | "PER_UNIT";
	active: boolean;
	standaloneSellable: boolean;
};

export async function createService(input: ServiceInput): Promise<{ id: string }> {
	return prisma.service.create({
		data: {
			name: input.name,
			category: input.category,
			unitPrice: input.unitPrice,
			priceType: input.priceType,
			active: input.active,
			standaloneSellable: input.standaloneSellable,
		},
		select: { id: true },
	});
}

export async function updateService(
	id: string,
	input: ServiceInput,
): Promise<{ id: string }> {
	return prisma.service.update({
		where: { id },
		data: {
			name: input.name,
			category: input.category,
			unitPrice: input.unitPrice,
			priceType: input.priceType,
			active: input.active,
			standaloneSellable: input.standaloneSellable,
		},
		select: { id: true },
	});
}
