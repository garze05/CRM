"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createPackage,
	updatePackage,
	type PackageItemInput,
} from "../lib/server/packages";

export type PackageFormState = { error?: string };

function positiveNumber(value: FormDataEntryValue | null) {
	const n = Number(value ?? "");
	return Number.isFinite(n) && n > 0 ? n : null;
}

type ParsedPackageForm = {
	name: string;
	durationHours: number;
	basePrice: number;
	items: PackageItemInput[];
};

/**
 * Cada línea viaja como un input oculto `item` con valor "kind:id:quantity"
 * (kind = "catalog" | "service"). Los UUID no contienen ":", así que es seguro.
 */
function parseItem(raw: string): PackageItemInput | null {
	const [kind, id, quantityRaw] = raw.split(":");
	if ((kind !== "catalog" && kind !== "service") || !id) return null;
	const quantity = Number(quantityRaw);
	return {
		kind,
		id,
		quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
	};
}

function parsePackageForm(
	formData: FormData,
): { data: ParsedPackageForm } | { error: string } {
	const name = String(formData.get("name") ?? "").trim();
	const durationHours = positiveNumber(formData.get("durationHours"));
	const basePrice = positiveNumber(formData.get("basePrice"));
	const items = formData
		.getAll("item")
		.map(String)
		.map(parseItem)
		.filter((item): item is PackageItemInput => item != null);

	if (!name) return { error: "El paquete necesita un nombre." };
	if (!durationHours) return { error: "Definí la duración incluida." };
	if (!basePrice) return { error: "Definí el precio base del paquete." };
	if (items.length === 0) {
		return { error: "Agregá al menos un ítem del catálogo." };
	}

	return { data: { name, durationHours, basePrice, items } };
}

export async function createPackageAction(
	_prevState: PackageFormState,
	formData: FormData,
): Promise<PackageFormState> {
	const parsed = parsePackageForm(formData);
	if ("error" in parsed) return parsed;

	await createPackage(parsed.data);

	revalidatePath("/paquetes");
	redirect("/paquetes");
}

export async function updatePackageAction(
	_prevState: PackageFormState,
	formData: FormData,
): Promise<PackageFormState> {
	const id = String(formData.get("packageId") ?? "").trim();
	if (!id) return { error: "No se pudo identificar el paquete a editar." };

	const parsed = parsePackageForm(formData);
	if ("error" in parsed) return parsed;

	const active = formData.get("active") === "on";

	await updatePackage({ id, active, ...parsed.data });

	revalidatePath("/paquetes");
	redirect("/paquetes");
}
