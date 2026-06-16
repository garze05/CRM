"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateQuoteForEvent } from "../lib/server/quotes";
import type { QuotationItem } from "../lib/integrations/quotation-api";

export type NewQuoteState = {
	error?: string;
	/** true si el servicio de cotización está caído/no configurado. */
	unavailable?: boolean;
};

const ITEM_ROWS = 6;

function parseItems(formData: FormData): QuotationItem[] {
	const items: QuotationItem[] = [];
	for (let i = 0; i < ITEM_ROWS; i++) {
		const nombre = String(formData.get(`item-${i}-nombre`) ?? "").trim();
		if (!nombre) continue;
		const tipo = String(formData.get(`item-${i}-tipo`) ?? "servicio");
		const horas = Number(formData.get(`item-${i}-horas`) ?? "1");
		const cantidad = Number(formData.get(`item-${i}-cantidad`) ?? "1");
		items.push({
			tipo: tipo === "personaje" || tipo === "transporte" ? tipo : "servicio",
			nombre,
			horas: Number.isFinite(horas) && horas > 0 ? horas : 1,
			cantidad: Number.isFinite(cantidad) && cantidad >= 1 ? cantidad : 1,
		});
	}
	return items;
}

export async function generateQuoteAction(
	_prevState: NewQuoteState,
	formData: FormData,
): Promise<NewQuoteState> {
	const eventId = String(formData.get("eventId") ?? "");
	if (!eventId) {
		return { error: "Seleccioná un evento para cotizar." };
	}

	const invoice = formData.get("invoice") === "on";
	const includeTransport = formData.get("includeTransport") === "on";
	const items = parseItems(formData);

	if (includeTransport) {
		items.push({ tipo: "transporte", nombre: "Transporte" });
	}

	if (items.length === 0) {
		return { error: "Agregá al menos un servicio o personaje a la cotización." };
	}

	const result = await generateQuoteForEvent({
		eventId,
		doctype: "quotation",
		invoice,
		items,
	});

	if (!result.ok) {
		return { error: result.error, unavailable: result.unavailable };
	}

	revalidatePath("/cotizaciones");
	revalidatePath(`/eventos/${eventId}`);
	redirect(`/cotizaciones/${result.quoteId}`);
}
