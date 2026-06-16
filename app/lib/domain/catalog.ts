export type CatalogCategory = "CHARACTER" | "INFLATABLE" | "DECORATION" | "SERVICE" | "OTHER";

export type CatalogAvailabilityStatus =
	| "AVAILABLE"
	| "RESERVED"
	| "MAINTENANCE_PENDING";

export type CatalogListItem = {
	id: string;
	name: string;
	category: CatalogCategory;
	description: string;
	active: boolean;
	availabilityStatus: CatalogAvailabilityStatus;
	tags: string[];
	imageUrl: string | null;
	galleryUrls: string[];
	hourlyPrice: number | null;
};

export const CATALOG_CATEGORY_LABELS: Record<string, string> = {
	CHARACTER: "Personaje",
	INFLATABLE: "Inflable",
	DECORATION: "Decoración",
	SERVICE: "Servicio",
	OTHER: "Otro",
};

export const CATALOG_CATEGORY_QUERY: Record<string, CatalogCategory | ""> = {
	PERSONAJE: "CHARACTER",
	INFLABLE: "INFLATABLE",
	DECORACION: "DECORATION",
	SERVICIO: "SERVICE",
	OTRO: "OTHER",
};

export const CATALOG_CATEGORY_TO_LEGACY: Record<string, string> = {
	CHARACTER: "PERSONAJE",
	INFLATABLE: "INFLABLE",
	DECORATION: "DECORACION",
	SERVICE: "SERVICIO",
	OTHER: "OTRO",
};

export const CATALOG_AVAILABILITY_LABELS: Record<string, string> = {
	AVAILABLE: "Disponible",
	RESERVED: "Reservado",
	MAINTENANCE_PENDING: "Mantenimiento",
};
