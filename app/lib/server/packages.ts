import "server-only";
import { prisma } from "../db";

export type PackageListRow = {
	id: string;
	name: string;
	description: string | null;
	durationHours: number;
	priceFamily: number;
	priceEducational: number;
	priceCorporate: number;
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
		priceFamily: Number(item.priceFamily),
		priceEducational: Number(item.priceEducational),
		priceCorporate: Number(item.priceCorporate),
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
	priceFamily: number;
	priceEducational: number;
	priceCorporate: number;
	items: { catalogItemId: string; quantity: number }[];
};

export async function createPackage(input: CreatePackageInput): Promise<{ id: string }> {
	const created = await prisma.package.create({
		data: {
			name: input.name,
			description: input.description || null,
			durationHours: input.durationHours,
			priceFamily: input.priceFamily,
			priceEducational: input.priceEducational,
			priceCorporate: input.priceCorporate,
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
