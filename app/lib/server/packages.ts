import "server-only";
import { prisma } from "../db";
import type { CatalogListItem } from "../domain/catalog";

export type PackageListRow = {
	id: string;
	name: string;
	description: string | null;
	durationHours: number;
	basePrice: number;
	active: boolean;
	itemCount: number;
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
		include: { _count: { select: { items: true } } },
	});
	return packages.map(item => ({
		id: item.id,
		name: item.name,
		description: item.description,
		durationHours: Number(item.durationHours),
		basePrice: Number(item.basePrice),
		active: item.active,
		itemCount: item._count.items,
	}));
}

export async function listServices(): Promise<ServiceListRow[]> {
	const services = await prisma.service.findMany({
		where: { deletedAt: null },
		orderBy: [{ active: "desc" }, { name: "asc" }],
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

export type CreatePackageInput = {
	name: string;
	description?: string | null;
	durationHours: number;
	basePrice: number;
	items: { catalogItemId: string; quantity: number }[];
};

export async function createPackage(input: CreatePackageInput): Promise<{ id: string }> {
	const created = await prisma.package.create({
		data: {
			name: input.name,
			description: input.description || null,
			durationHours: input.durationHours,
			basePrice: input.basePrice,
			items: {
				create: input.items.map(item => ({
					catalogItemId: item.catalogItemId,
					quantity: item.quantity,
				})),
			},
		},
		select: { id: true },
	});
	return created;
}

export type PackageBuilderLine = {
	item: CatalogListItem;
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

function catalogItemToListItem(item: {
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

/**
 * Carga un paquete con su composición para edición. Las líneas resuelven el
 * detalle del ítem de catálogo (incluso si quedó inactivo, para no perderlo al
 * editar). Los ítems basados en servicios no se exponen aquí porque el creador
 * de paquetes compone únicamente desde el catálogo.
 */
export async function getPackageForEdit(
	id: string,
): Promise<PackageForEdit | null> {
	const pkg = await prisma.package.findFirst({
		where: { id, deletedAt: null },
		include: {
			items: {
				include: { catalogItem: true },
				orderBy: { id: "asc" },
			},
		},
	});
	if (!pkg) return null;

	const lines: PackageBuilderLine[] = pkg.items
		.filter(line => line.catalogItem != null)
		.map(line => ({
			item: catalogItemToListItem(line.catalogItem!),
			quantity: line.quantity,
		}));

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
	items: { catalogItemId: string; quantity: number }[];
};

/**
 * Actualiza un paquete reemplazando su composición de ítems de catálogo. Los
 * ítems basados en servicios se preservan; solo se sustituyen las líneas que
 * referencian el catálogo (las que administra el creador de paquetes).
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
		await tx.packageItem.deleteMany({
			where: { packageId: input.id, catalogItemId: { not: null } },
		});
		if (input.items.length > 0) {
			await tx.packageItem.createMany({
				data: input.items.map(item => ({
					packageId: input.id,
					catalogItemId: item.catalogItemId,
					quantity: item.quantity,
				})),
			});
		}
	});
	return { id: input.id };
}
