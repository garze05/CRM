// Servicio server-side de Cotizaciones. Orquesta la generación contra la
// Quotation API (fuente de verdad del cálculo y del `codigo`), mapea la
// respuesta a las columnas de Quote y persiste. Ver mapeo y decisiones en
// docs/integracion-db-auth-quotation.md.
import "server-only";
import { prisma } from "../db";
import { auth } from "../auth";
import { SEQUENTIAL_START, formatDocumentCode } from "../domain/numbering";
import { qualificationError } from "../domain/funnel";
import {
	effectivePackagePrice,
	type ClientType,
	type PricingSettings,
} from "../domain/pricing";
import {
	DEFAULT_QUOTE_AI_MODEL,
	type QuoteAiModelId,
} from "../domain/ai-models";
import { getSettings } from "./settings";
import {
	generateQuoteDescription,
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
			options: { orderBy: { sortOrder: "asc" } },
			reservation: true,
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
	aiModel?: QuoteAiModelId;
	customDescription?: string;
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

function addDaysAtNoon(days: number): Date {
	const date = new Date();
	date.setUTCDate(date.getUTCDate() + days);
	date.setUTCHours(12, 0, 0, 0);
	return date;
}

async function createQuoteFollowUpTasks(args: {
	quoteId: string;
	eventId: string;
	eventName: string;
}) {
	const steps = [
		{
			key: "QUOTE_FOLLOWUP_24H",
			days: 1,
			title: "Toque 1: resolver dudas del paquete",
			description: `Escribir al día siguiente por ${args.eventName}: “¿Te quedó alguna duda sobre el paquete?”.`,
		},
		{
			key: "QUOTE_FOLLOWUP_72H",
			days: 3,
			title: "Toque 2: prioridad por la fecha",
			description:
				"Avisar que preguntaron por la fecha y darle prioridad antes de liberarla.",
		},
		{
			key: "QUOTE_FOLLOWUP_7D",
			days: 7,
			title: "Toque 3: cierre suave",
			description:
				"Preguntar si seguimos con la fiesta o si liberamos la fecha para otra ocasión.",
		},
	];

	await prisma.task.createMany({
		data: steps.map(step => ({
			title: step.title,
			description: step.description,
			dueAt: addDaysAtNoon(step.days),
			status: "PENDING",
			origin: "AUTOMATIC",
			eventId: args.eventId,
			autoKey: `${step.key}:quote:${args.quoteId}`,
		})),
		skipDuplicates: true,
	});
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

	// Regla de negocio: nunca se cotiza antes de calificar. Sin los datos de
	// calificación completos no se genera el documento (enforcement más fuerte).
	const qualErr = qualificationError({
		isChildrenEvent: event.eventType === "CHILDREN",
		hasEventDate: event.eventDate != null,
		hasGuestCount: event.guestCount != null,
		hasVenueAddress: Boolean(event.venueAddress?.trim()),
		hasHonoreeAge: event.honoreeAge != null,
		hasTheme: Boolean(event.requestedCharacterId || event.partyTheme?.trim()),
	});
	if (qualErr) {
		return { ok: false, error: qualErr, unavailable: false };
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
		detalle:
			input.customDescription?.trim() || "¡Estamos listos para celebrar a lo grande!",
		tipo_cliente: CLIENT_TYPE_TO_API[event.client.type] ?? "familiar",
		invoice: input.invoice ?? false,
		items: input.items,
		use_ai: input.useAi ?? false,
		ai_model: input.useAi
			? (input.aiModel ?? DEFAULT_QUOTE_AI_MODEL)
			: undefined,
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

	await createQuoteFollowUpTasks({
		quoteId: quote.id,
		eventId: event.id,
		eventName: event.name,
	});

	return { ok: true, quoteId: quote.id, quoteNumber: quote.quoteNumber };
}

// ---------------------------------------------------------------------------
// Cotización PAQUETE-BASED (modelo nuevo)
//
// El CRM es la autoridad de cálculo: los precios salen del motor (pricing.ts)
// y el documento se arma localmente con la forma QuotationResponse. La Quotation
// API solo RENDERIZA (POST /documents/preview); no recalcula nada. Así no se
// duplica lógica de precios entre el CRM y el servicio Python.
// ---------------------------------------------------------------------------

/** Forma mínima del evento+cliente para armar la cotización por paquetes. */
type EventForQuote = {
	id: string;
	name: string;
	eventType: string;
	funnelStage: string;
	eventDate: Date | null;
	durationHours: unknown;
	venueAddress: string | null;
	honoreeName: string | null;
	honoreeAge: number | null;
	guestCount: number | null;
	requestedCharacterId: string | null;
	partyTheme: string | null;
	client: {
		firstName: string;
		lastName: string;
		phone: string;
		type: string;
		companyName: string | null;
		companyPhone: string | null;
	} | null;
};

/** Convierte la fila Settings a la forma que necesita el motor de precios. */
function toPricingSettings(settings: {
	surchargeEducationalPercent: unknown;
	surchargeCorporatePercent: unknown;
	surchargeShoppingCenterPercent: unknown;
	surchargeAgencyPercent: unknown;
	priceRoundingTo: number;
}): PricingSettings {
	return {
		surchargeEducationalPercent: Number(settings.surchargeEducationalPercent),
		surchargeCorporatePercent: Number(settings.surchargeCorporatePercent),
		surchargeShoppingCenterPercent: Number(
			settings.surchargeShoppingCenterPercent,
		),
		surchargeAgencyPercent: Number(settings.surchargeAgencyPercent),
		priceRoundingTo: settings.priceRoundingTo,
	};
}

function packageTransportCost(settings: { transportBasePrice: unknown }): number {
	return Math.max(0, Math.round(Number(settings.transportBasePrice) || 0));
}

/**
 * Arma el dict `cotizacion` (forma QuotationResponse) para UNA opción de paquete.
 * Es lo que la Quotation API espera en /documents/preview para renderizar el PDF.
 */
function buildPackageDocumentPayload(args: {
	codigo: string;
	event: EventForQuote;
	pkg: { name: string; description: string | null; durationHours: unknown };
	packagePrice: number;
	transportCost: number;
	depositPercent: number;
}): QuotationResponse {
	const { codigo, event, pkg, packagePrice, transportCost, depositPercent } =
		args;
	const client = event.client;
	const total = packagePrice + transportCost;
	const abono = Math.round((total * depositPercent) / 100);

	return {
		codigo,
		tipo_documento: "Cotizacion",
		fecha_envio: new Date().toISOString().slice(0, 10),
		descripcion: pkg.description ?? "¡Estamos listos para celebrar a lo grande!",
		cliente: {
			nombre: client ? `${client.firstName} ${client.lastName}` : "",
			telefono: client?.phone ?? "",
			empresa: client?.companyName ?? "No aplica",
			tel_empresa: client?.companyPhone ?? "No aplica",
			tipo_cliente: client
				? (CLIENT_TYPE_TO_API[client.type] ?? "familiar")
				: "familiar",
		},
		evento: {
			tipo: EVENT_TYPE_TO_LABEL[event.eventType] ?? event.eventType,
			fecha: event.eventDate ? event.eventDate.toISOString() : null,
			ubicacion: event.venueAddress ?? "",
			duracion: pkg.durationHours ? String(pkg.durationHours) : "",
			homenajeado: event.honoreeName ?? "No aplica",
			edad: event.honoreeAge != null ? String(event.honoreeAge) : "",
			invitados: event.guestCount != null ? String(event.guestCount) : "",
			info_extra: event.partyTheme ?? "",
		},
		servicios: [
			{
				concepto: pkg.name,
				descripcion: pkg.description ?? "",
				cantidad: 1,
				horas: pkg.durationHours ? Number(pkg.durationHours) : 0,
				precio_unitario: packagePrice,
				subtotal: packagePrice,
			},
			{
				concepto: "Transporte",
				descripcion: "Desplazamiento al lugar del evento",
				cantidad: 1,
				horas: 0,
				precio_unitario: transportCost,
				subtotal: transportCost,
			},
		],
		totales: {
			subtotal_sin_iva: total,
			iva: 0,
			total,
			abono,
			pendiente: total - abono,
		},
	};
}

function qualificationErrorForEvent(event: EventForQuote): string | null {
	return qualificationError({
		isChildrenEvent: event.eventType === "CHILDREN",
		hasEventDate: event.eventDate != null,
		hasGuestCount: event.guestCount != null,
		hasVenueAddress: Boolean(event.venueAddress?.trim()),
		hasHonoreeAge: event.honoreeAge != null,
		hasTheme: Boolean(event.requestedCharacterId || event.partyTheme?.trim()),
	});
}

export type PackageQuoteOptionInput = {
	packageId: string;
	isRecommended: boolean;
};

export type CreatePackageQuoteInput = {
	eventId: string;
	options: PackageQuoteOptionInput[];
	useAi?: boolean;
	aiModel?: QuoteAiModelId;
	customDescription?: string;
};

export type CreatePackageQuoteResult =
	| { ok: true; quoteId: string; quoteNumber: string }
	| { ok: false; error: string };

/**
 * Crea una cotización paquete-based: 1–3 opciones de paquete, una marcada como
 * "el popular". Calcula cada precio con el motor (basePrice + recargo del tipo de
 * cliente, redondeado) y arma el documento de la opción recomendada. No llama a la
 * API de cálculo: la API solo renderiza después, bajo demanda.
 */
export async function createPackageQuote(
	input: CreatePackageQuoteInput,
): Promise<CreatePackageQuoteResult> {
	if (input.options.length < 1 || input.options.length > 3) {
		return { ok: false, error: "Elegí entre 1 y 3 paquetes para cotizar." };
	}
	const recommendedCount = input.options.filter(o => o.isRecommended).length;
	if (recommendedCount !== 1) {
		return {
			ok: false,
			error: "Marcá exactamente un paquete como el recomendado (el popular).",
		};
	}
	const uniquePackageIds = new Set(input.options.map(o => o.packageId));
	if (uniquePackageIds.size !== input.options.length) {
		return { ok: false, error: "No repitas el mismo paquete entre las opciones." };
	}

	const event = (await prisma.event.findFirst({
		where: { id: input.eventId, deletedAt: null },
		include: { client: true },
	})) as EventForQuote | null;
	if (!event || !event.client) {
		return { ok: false, error: "El evento no existe." };
	}

	const qualErr = qualificationErrorForEvent(event);
	if (qualErr) return { ok: false, error: qualErr };

	const packages = await prisma.package.findMany({
		where: { id: { in: [...uniquePackageIds] }, deletedAt: null, active: true },
		select: {
			id: true,
			name: true,
			description: true,
			durationHours: true,
			basePrice: true,
		},
	});
	const packageById = new Map(packages.map(p => [p.id, p]));
	if (packageById.size !== uniquePackageIds.size) {
		return {
			ok: false,
			error: "Alguno de los paquetes elegidos ya no está disponible.",
		};
	}

	const settings = await getSettings();
	const pricingSettings = toPricingSettings(settings);
	const clientType = event.client.type as ClientType;
	const transportCost = packageTransportCost(settings);

	const optionsData = input.options.map((opt, index) => {
		const pkg = packageById.get(opt.packageId)!;
		const packagePrice = effectivePackagePrice(
			Number(pkg.basePrice),
			clientType,
			pricingSettings,
		);
		return {
			packageId: opt.packageId,
			label: pkg.name,
			isRecommended: opt.isRecommended,
			quotedPrice: packagePrice + transportCost,
			sortOrder: index,
			pkg,
			packagePrice,
		};
	});

	const primary = optionsData.find(o => o.isRecommended)!;
	const validUntil = new Date();
	validUntil.setUTCDate(validUntil.getUTCDate() + settings.quoteValidityDays);

	const year = event.eventDate
		? event.eventDate.getUTCFullYear()
		: new Date().getUTCFullYear();

	const sequential = await prisma.$transaction(tx =>
		nextSequential(tx, "QUOTE", year),
	);
	const codigo = formatDocumentCode("QUOTE", event.eventDate, sequential);
	const documentPayload = buildPackageDocumentPayload({
		codigo,
		event,
		pkg: primary.pkg,
		packagePrice: primary.packagePrice,
		transportCost,
		depositPercent: Number(settings.depositPercent),
	});

	const customDescription = input.customDescription?.trim();
	if (customDescription) {
		documentPayload.descripcion = customDescription;
	}

	if (input.useAi) {
		const session = await auth();
		try {
			const generated = await generateQuoteDescription(
				{
					cotizacion: documentPayload,
					ai_model: input.aiModel ?? DEFAULT_QUOTE_AI_MODEL,
				},
				session?.idToken,
			);
			if (generated.descripcion.trim()) {
				documentPayload.descripcion = generated.descripcion.trim();
			}
		} catch {
			// No bloqueamos el cierre comercial por una falla de IA.
		}
	}

	const quote = await prisma.$transaction(async tx => {
		const created = await tx.quote.create({
			data: {
				eventId: event.id,
				quoteNumber: codigo,
				subtotal: primary.packagePrice,
				transportCost,
				discount: 0,
				taxAmount: 0,
				total: primary.quotedPrice,
				currency: settings.currency,
				validUntil,
				status: "DRAFT",
				lineItems: documentPayload.servicios as unknown as object,
				documentPayload: documentPayload as unknown as object,
				notes: documentPayload.descripcion || null,
				options: {
					create: optionsData.map(o => ({
						packageId: o.packageId,
						label: o.label,
						isRecommended: o.isRecommended,
						quotedPrice: o.quotedPrice,
						sortOrder: o.sortOrder,
					})),
				},
			},
			select: { id: true, quoteNumber: true },
		});

		if (event.funnelStage === "PROSPECT" || event.funnelStage === "CONTACTED") {
			await tx.event.update({
				where: { id: event.id },
				data: { funnelStage: "QUOTED" },
			});
		}

		return created;
	});

	await createQuoteFollowUpTasks({
		quoteId: quote.id,
		eventId: event.id,
		eventName: event.name,
	});

	return { ok: true, quoteId: quote.id, quoteNumber: quote.quoteNumber };
}

/**
 * Registra cuál opción eligió el cliente y recalcula el documento de la cotización
 * para reflejar el paquete elegido (precio, líneas y payload del PDF).
 */
export async function selectQuoteOption(
	quoteId: string,
	optionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
	const quote = await prisma.quote.findFirst({
		where: { id: quoteId, deletedAt: null },
		include: {
			event: { include: { client: true } },
			options: { include: { package: true } },
		},
	});
	if (!quote) return { ok: false, error: "La cotización no existe." };

	const option = quote.options.find(o => o.id === optionId);
	if (!option) {
		return { ok: false, error: "La opción elegida no pertenece a esta cotización." };
	}
	if (!option.package) {
		return {
			ok: false,
			error: "La opción elegida es personalizada y no tiene paquete asociado.",
		};
	}

	const settings = await getSettings();
	const event = quote.event as unknown as EventForQuote;
	const transportCost = Math.max(0, Number(quote.transportCost) || 0);
	const total = Number(option.quotedPrice);
	const packagePrice = Math.max(0, total - transportCost);
	const documentPayload = buildPackageDocumentPayload({
		codigo: quote.quoteNumber,
		event,
		pkg: option.package,
		packagePrice,
		transportCost,
		depositPercent: Number(settings.depositPercent),
	});
	const currentDescription = quote.notes?.trim();
	if (currentDescription) {
		documentPayload.descripcion = currentDescription;
	}

	await prisma.quote.update({
		where: { id: quoteId },
		data: {
			selectedOptionId: optionId,
			subtotal: packagePrice,
			transportCost,
			total,
			lineItems: documentPayload.servicios as unknown as object,
			documentPayload: documentPayload as unknown as object,
		},
	});

	return { ok: true };
}
