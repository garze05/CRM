"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	createPackageQuote,
	generateQuoteForEvent,
	selectQuoteOption,
	type PackageQuoteOptionInput,
} from "../lib/server/quotes";
import {
	confirmReservationDeposit,
	createReservationForQuote,
} from "../lib/server/reservations";
import { recordActivity } from "../lib/server/activity";
import type { QuotationItem } from "../lib/integrations/quotation-api";
import { quoteAiModelOrDefault } from "../lib/domain/ai-models";

export type NewQuoteState = {
	error?: string;
	/** true si el servicio de cotización está caído/no configurado. */
	unavailable?: boolean;
};

export type PackageQuoteState = { error?: string };

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
	const useAi = formData.get("useAiDescription") === "on";
	const aiModel = quoteAiModelOrDefault(String(formData.get("aiModel") ?? ""));
	const customDescription = String(formData.get("description") ?? "").trim();
	const items = parseItems(formData);

	if (items.length === 0) {
		return { error: "Agregá al menos un servicio o personaje a la cotización." };
	}

	const result = await generateQuoteForEvent({
		eventId,
		doctype: "quotation",
		invoice,
		items,
		useAi,
		aiModel,
		customDescription,
	});

	if (!result.ok) {
		return { error: result.error, unavailable: result.unavailable };
	}

	revalidatePath("/cotizaciones");
	revalidatePath(`/eventos/${eventId}`);
	redirect(`/cotizaciones/${result.quoteId}`);
}

// --- Cotización paquete-based (flujo por defecto) ---

export async function createPackageQuoteAction(
	_prevState: PackageQuoteState,
	formData: FormData,
): Promise<PackageQuoteState> {
	const eventId = String(formData.get("eventId") ?? "");
	if (!eventId) {
		return { error: "Seleccioná un evento para cotizar." };
	}

	const selectedPackageIds = formData.getAll("packageId").map(String);
	const recommendedId = String(formData.get("recommendedPackageId") ?? "");
	const useAi = formData.get("useAiDescription") === "on";
	const aiModel = quoteAiModelOrDefault(String(formData.get("aiModel") ?? ""));
	const customDescription = String(formData.get("description") ?? "").trim();

	const options: PackageQuoteOptionInput[] = selectedPackageIds.map(id => ({
		packageId: id,
		isRecommended: id === recommendedId,
	}));

	const result = await createPackageQuote({
		eventId,
		options,
		useAi,
		aiModel,
		customDescription,
	});
	if (!result.ok) {
		return { error: result.error };
	}

	revalidatePath("/cotizaciones");
	revalidatePath(`/eventos/${eventId}`);
	redirect(`/cotizaciones/${result.quoteId}`);
}

export async function selectQuoteOptionAction(
	formData: FormData,
): Promise<void> {
	const quoteId = String(formData.get("quoteId") ?? "");
	const optionId = String(formData.get("optionId") ?? "");
	if (!quoteId || !optionId) return;

	await selectQuoteOption(quoteId, optionId);
	revalidatePath(`/cotizaciones/${quoteId}`);
}

export async function createReservationFromQuoteAction(
	formData: FormData,
): Promise<void> {
	const quoteId = String(formData.get("quoteId") ?? "");
	if (!quoteId) return;

	const result = await createReservationForQuote(quoteId);
	if (result.ok) {
		await recordActivity({
			action: "reservation.created",
			entityType: "Quote",
			entityId: quoteId,
			summary: "creó reservación pendiente de anticipo",
		});
	}

	revalidatePath(`/cotizaciones/${quoteId}`);
	revalidatePath("/cotizaciones");
	revalidatePath("/reservaciones");
	revalidatePath("/");
}

export async function confirmDepositAction(formData: FormData): Promise<void> {
	const quoteId = String(formData.get("quoteId") ?? "");
	const reservationId = String(formData.get("reservationId") ?? "");
	if (!reservationId) return;

	const result = await confirmReservationDeposit(
		reservationId,
		String(formData.get("depositMethod") ?? "").trim() || null,
	);
	if (result.ok) {
		await recordActivity({
			action: "reservation.deposit_received",
			entityType: "Quote",
			entityId: quoteId || reservationId,
			summary: "registró anticipo y confirmó la fecha",
		});
	}

	if (quoteId) revalidatePath(`/cotizaciones/${quoteId}`);
	revalidatePath("/cotizaciones");
	revalidatePath("/reservaciones");
	revalidatePath("/");
}
