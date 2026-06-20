import type { CatalogCategory } from "./catalog";
import { CATALOG_CATEGORY_LABELS } from "./catalog";

/**
 * Entrada unificada del creador de paquetes: un paquete se compone tanto de
 * ítems del catálogo (personajes, inflables…) como de servicios à la carte
 * (sonido, animación…). Ambos modelos se normalizan a esta forma para listarse,
 * filtrarse por categoría real y calcular el precio sugerido.
 */
export type PackageBuilderEntry = {
	/** Distingue de qué modelo proviene (define el campo de FormData). */
	kind: "catalog" | "service";
	id: string;
	name: string;
	/** Etiqueta de categoría real para filtrar y agrupar (ej. "Personajes", "Sonido"). */
	categoryLabel: string;
	/** Precio unitario de referencia (por hora si `perHour`, fijo si no). null = sin precio. */
	unitPrice: number | null;
	/** Si el precio se multiplica por la duración del paquete. */
	perHour: boolean;
	/** Etiqueta del tipo de precio para mostrar (ej. "por hora", "fijo"). */
	priceTypeLabel: string;
	/** Categoría del catálogo para el ícono/miniatura (servicios usan SERVICE). */
	catalogCategory: CatalogCategory;
};

export const SERVICE_PRICE_TYPE_LABELS: Record<string, string> = {
	FIXED: "fijo",
	PER_HOUR: "por hora",
	PER_UNIT: "por unidad",
};

/** Etiqueta de categoría de un personaje/ítem de catálogo. */
export function catalogCategoryLabel(category: CatalogCategory): string {
	return CATALOG_CATEGORY_LABELS[category] ?? "Otros";
}
