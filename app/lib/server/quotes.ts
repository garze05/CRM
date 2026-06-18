// Servicio server-side de Cotizaciones. Orquesta la generación contra la
// Quotation API (fuente de verdad del cálculo y del `codigo`), mapea la
// respuesta a las columnas de Quote y persiste. Ver mapeo y decisiones en
// docs/integracion-db-auth-quotation.md.
import "server-only";
import { prisma } from "../db";
import { auth } from "../auth";
import { SEQUENTIAL_START } from "../domain/numbering";
import {
	generateQuote as apiGenerateQuote,
	QuotationApiError,
	type ManualQuoteRequest,
	type QuotationItem,
	type QuotationResponse,
} from "../integrations/quotation-api";

// CRM ClientType → tipo_cliente de la API (claves de REGLAS_DESCUENTO).
const CLIENT_TYPE_TO_API: Record<string, string> = {
	FAMILY: "familiar",
	EDUCATIONAL: "escolar",
	CORPORATE: "corporativo",
	SHOPPING_CENTER: "centro comercial",
	ADVERTISING_AGENCY: "agencia de publicidad",
};

const EVENT_TYPE_TO_LABEL: Record<string, string> = {
	CHILDREN: "Infantil",
	CORPORATE: "Corporativo",
	INSTITUTIONAL: "Institucional",
};

// --- Lectura para las pantallas ---

export async function listQuotes() {
	const quotes = await prisma.quote.findMany({
		where: { deletedAt: null },
		orderBy: { issuedAt: "desc" },
		include: {
			event: {
				select: {
					name: true,
					client: { select: { firstName: true, lastName: true } },
				},
			},
		},
	});

	return quotes.map(quote => ({
		id: quote.id,
		quoteNumber: quote.quoteNumber,
		eventName: quote.event?.name ?? "Sin evento",
		clientName: quote.event?.client
			? `${quote.event.client.firstName} ${quote.event.client.lastName}`
			: "Sin cliente",
		status: quote.status,
		total: Number(quote.total),
		validUntil: quote.validUntil,
	}));
}

export async function getQuoteDetail(id: string) {
	return prisma.quote.findFirst({
		where: { id, deletedAt: null },
		include: {
			event: { include: { client: true } },
		},
	});
}

export type QuoteDetail = NonNullable<
	Awaited<ReturnType<typeof getQuoteDetail>>
>;

/** Payload de documento (QuotationResponse) para re-render del PDF; null si no existe. */
export async function getQuoteDocumentPayload(
	id: string,
): Promise<QuotationResponse | null> {
	const quote = await prisma.quote.findFirst({
		where: { id, deletedAt: null },
		select: { documentPayload: true },
	});
	if (!quote?.documentPayload) return null;
	return quote.documentPayload as unknown as QuotationResponse;
}

// --- Generación contra la Quotation API ---

export type GenerateQuoteInput = {
	eventId: string;
	doctype?: "quotation" | "reservation";
	invoice?: boolean;
	useAi?: boolean;
	items: QuotationItem[];
};

export type GenerateQuoteResult =
	| { ok: true; quoteId: string; quoteNumber: string }
	| { ok: false; error: string; unavailable: boolean };

/** Consecutivo anual por tipo de documento (DocumentCounter), transaccional. */
async function nextSequential(
	tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
	type: "QUOTE" | "RESERVATION",
	year: number,
): Promise<number> {
	const counter = await tx.documentCounter.upsert({
		where: { type_year: { type, year } },
		create: { type, year, lastValue: SEQUENTIAL_START },
		update: { lastValue: { increment: 1 } },
	});
	// En create, lastValue ya es SEQUENTIAL_START (100); en update se incrementó.
	return counter.lastValue;
}

/** Extrae el costo de transporte de las líneas de servicios de la API. */
function extractTransport(servicios: QuotationResponse["servicios"]): number {
	return servicios
		.filter(s => /transporte/i.test(s.concepto))
		.reduce((sum, s) => sum + s.subtotal, 0);
}

export async function generateQuoteForEvent(
	input: GenerateQuoteInput,
): Promise<GenerateQuoteResult> {
	const event = await prisma.event.findFirst({
		where: { id: input.eventId, deletedAt: null },
		include: { client: true },
	});
	if (!event || !event.client) {
		return { ok: false, error: "El evento no existe.", unavailable: false };
	}

	const session = await auth();
	const idToken = session?.idToken;

	const doctype = input.doctype ?? "quotation";
	const eventDate = event.eventDate;
	const year = eventDate ? eventDate.getUTCFullYear() : new Date().getUTCFullYear();
	const yy = String(year).slice(-2);

	// Reservamos el consecutivo en transacción antes de llamar a la API, para
	// componer el id_evento que la API concatenará al codigo (ver doc §3.1).
	// Trade-off: una generación fallida (API caída) consume un número y deja un
	// hueco en la secuencia. Aceptable para el MVP; no afecta unicidad.
	const sequential = await prisma.$transaction(tx =>
		nextSequential(tx, doctype === "reservation" ? "RESERVATION" : "QUOTE", year),
	);
	const idEvento = Number(`${yy}${sequential}`);

	const payload: ManualQuoteRequest = {
		doctype,
		id_evento: idEvento,
		nombre_cliente: `${event.client.firstName} ${event.client.lastName}`,
		telefono: event.client.phone,
		tipo_evento: EVENT_TYPE_TO_LABEL[event.eventType] ?? event.eventType,
		fecha_evento: eventDate ? eventDate.toISOString() : null,
		ubicacion: event.venueAddress ?? "",
		duracion: event.durationHours ? String(event.durationHours) : "",
		homenajeado: event.honoreeName ?? "",
		edad: event.honoreeAge != null ? String(event.honoreeAge) : "",
		invitados: event.guestCount != null ? String(event.guestCount) : "",
		tipo_cliente: CLIENT_TYPE_TO_API[event.client.type] ?? "familiar",
		invoice: input.invoice ?? false,
		items: input.items,
		use_ai: input.useAi ?? false,
	};

	let response: QuotationResponse;
	try {
		response = await apiGenerateQuote(payload, idToken);
	} catch (error) {
		if (error instanceof QuotationApiError) {
			return { ok: false, error: error.message, unavailable: error.unavailable };
		}
		return {
			ok: false,
			error: "Ocurrió un error inesperado al generar la cotización.",
			unavailable: false,
		};
	}

	// Mapeo de totales (doc §3.3): transporte se extrae de las líneas; subtotal
	// es subtotal_sin_iva sin transporte; total es autoritativo de la API.
	const transportCost = extractTransport(response.servicios);
	const subtotalSinIva = response.totales.subtotal_sin_iva;
	const subtotal = Math.max(subtotalSinIva - transportCost, 0);

	const validUntil = new Date();
	validUntil.setUTCDate(validUntil.getUTCDate() + 7);

	const quote = await prisma.$transaction(async tx => {
		const created = await tx.quote.create({
			data: {
				eventId: event.id,
				quoteNumber: response.codigo,
				subtotal,
				transportCost,
				discount: 0,
				taxAmount: response.totales.iva,
				total: response.totales.total,
				currency: "CRC",
				validUntil,
				status: "DRAFT",
				lineItems: response.servicios as unknown as object,
				// Payload completo para re-render del documento (PDF preview).
				documentPayload: response as unknown as object,
				notes: response.descripcion || null,
			},
			select: { id: true, quoteNumber: true },
		});

		// El evento avanza a COTIZADO si aún no había sido cotizado o reservado.
		if (event.funnelStage === "PROSPECT" || event.funnelStage === "CONTACTED") {
			await tx.event.update({
				where: { id: event.id },
				data: { funnelStage: "QUOTED" },
			});
		}

		return created;
	});

	return { ok: true, quoteId: quote.id, quoteNumber: quote.quoteNumber };
}
