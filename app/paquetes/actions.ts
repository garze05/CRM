"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPackage } from "../lib/server/packages";

export type PackageFormState = { error?: string };

function positiveNumber(value: FormDataEntryValue | null) {
	const n = Number(value ?? "");
	return Number.isFinite(n) && n > 0 ? n : null;
}

export async function createPackageAction(
	_prevState: PackageFormState,
	formData: FormData,
): Promise<PackageFormState> {
	const name = String(formData.get("name") ?? "").trim();
	const durationHours = positiveNumber(formData.get("durationHours"));
	const priceFamily = positiveNumber(formData.get("priceFamily"));
	const priceEducational = positiveNumber(formData.get("priceEducational"));
	const priceCorporate = positiveNumber(formData.get("priceCorporate"));
	const rawItems = formData.getAll("catalogItemId").map(String);

	const items = rawItems
		.map(id => {
			const quantity = Number(formData.get(`quantity:${id}`) ?? "1");
			return {
				catalogItemId: id,
				quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
			};
		})
		.filter(item => item.catalogItemId);

	if (!name) return { error: "El paquete necesita un nombre." };
	if (!durationHours) return { error: "Definí la duración incluida." };
	if (!priceFamily || !priceEducational || !priceCorporate) {
		return { error: "Definí los tres precios." };
	}
	if (items.length === 0) {
		return { error: "Agregá al menos un ítem del catálogo." };
	}

	await createPackage({
		name,
		durationHours,
		priceFamily,
		priceEducational,
		priceCorporate,
		items,
	});

	revalidatePath("/paquetes");
	redirect("/paquetes");
}
