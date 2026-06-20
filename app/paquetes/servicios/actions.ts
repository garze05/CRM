"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createService,
	updateService,
	type ServiceInput,
} from "../../lib/server/packages";

export type ServiceFormState = { error?: string };

const PRICE_TYPES = ["FIXED", "PER_HOUR", "PER_UNIT"] as const;

function parseServiceForm(
	formData: FormData,
): { data: ServiceInput } | { error: string } {
	const name = String(formData.get("name") ?? "").trim();
	// La categoría puede venir de la lista existente o ser una nueva escrita.
	const categoryNew = String(formData.get("categoryNew") ?? "").trim();
	const categorySelect = String(formData.get("category") ?? "").trim();
	const category = (categoryNew || categorySelect) || null;
	const unitPriceRaw = Number(formData.get("unitPrice") ?? "");
	const priceTypeRaw = String(formData.get("priceType") ?? "FIXED");
	const priceType = PRICE_TYPES.includes(priceTypeRaw as never)
		? (priceTypeRaw as ServiceInput["priceType"])
		: "FIXED";
	const active = formData.get("active") === "on";
	const standaloneSellable = formData.get("standaloneSellable") === "on";

	if (!name) return { error: "El servicio necesita un nombre." };
	if (!Number.isFinite(unitPriceRaw) || unitPriceRaw < 0) {
		return { error: "Definí un precio válido para el servicio." };
	}

	return {
		data: {
			name,
			category,
			unitPrice: unitPriceRaw,
			priceType,
			active,
			standaloneSellable,
		},
	};
}

export async function createServiceAction(
	_prevState: ServiceFormState,
	formData: FormData,
): Promise<ServiceFormState> {
	const parsed = parseServiceForm(formData);
	if ("error" in parsed) return parsed;

	await createService(parsed.data);

	revalidatePath("/paquetes");
	redirect("/paquetes?tab=servicios");
}

export async function updateServiceAction(
	_prevState: ServiceFormState,
	formData: FormData,
): Promise<ServiceFormState> {
	const id = String(formData.get("serviceId") ?? "").trim();
	if (!id) return { error: "No se pudo identificar el servicio a editar." };

	const parsed = parseServiceForm(formData);
	if ("error" in parsed) return parsed;

	await updateService(id, parsed.data);

	revalidatePath("/paquetes");
	redirect("/paquetes?tab=servicios");
}
