// Cliente HTTP interno de la Quotation API (servicio Python/FastAPI).
//
// Fuente de verdad: la Quotation API calcula precios, transporte y arma el
// `codigo`. El CRM solo envía datos y persiste lo que devuelve.
// Contrato y decisiones de mapeo: docs/integracion-db-auth-quotation.md.
import "server-only";

const BASE_URL = process.env.QUOTATION_API_URL ?? "http://localhost:8000";

// --- Contrato de request (POST /quotes/manual) ---

export type QuotationDocType = "quotation" | "reservation";

export type QuotationItem = {
	tipo: "personaje" | "servicio" | "transporte";
	nombre: string;
	horas?: number;
	cantidad?: number;
};

export type ManualQuoteRequest = {
	doctype: QuotationDocType;
	/** Sufijo numérico que la API concatena al codigo (ver numbering). */
	id_evento?: number;
	nombre_cliente: string;
	telefono?: string;
	tipo_evento?: string;
	fecha_evento?: string | null;
	ubicacion?: string;
	duracion?: string;
	homenajeado?: string;
	edad?: string;
	invitados?: string;
	tipo_cliente: string;
	invoice?: boolean;
	items: QuotationItem[];
	use_ai?: boolean;
};

// --- Contrato de response ---

export type QuotationServiceLine = {
	concepto: string;
	descripcion?: string;
	cantidad: number;
	horas: number;
	precio_unitario: number;
	subtotal: number;
};

export type QuotationResponse = {
	codigo: string;
	tipo_documento: string;
	fecha_envio: string;
	descripcion: string;
	cliente: Record<string, unknown>;
	evento: Record<string, unknown>;
	servicios: QuotationServiceLine[];
	totales: {
		subtotal_sin_iva: number;
		iva: number;
		total: number;
		abono: number;
		pendiente: number;
	};
};

export type DocumentRenderRequest = {
	cotizacion: QuotationResponse;
	template_path?: string;
	output_dir?: string;
	include_pdf?: boolean;
};

export type DocumentRenderResponse = {
	codigo: string;
	files: { docx: string; pdf?: string };
};

// --- Errores ---

/** Error de dominio: el llamador decide cómo mostrarlo en la UI. */
export class QuotationApiError extends Error {
	constructor(
		message: string,
		readonly status: number,
		/** true si el servicio no está disponible (caído, sin credenciales). */
		readonly unavailable: boolean,
	) {
		super(message);
		this.name = "QuotationApiError";
	}
}

function friendlyMessage(status: number): string {
	switch (status) {
		case 401:
		case 403:
			return "La sesión no está autorizada para generar cotizaciones. Volvé a iniciar sesión.";
		case 400:
			return "Los datos de la cotización son inválidos. Revisá el evento y los servicios.";
		case 502:
			return "El motor de cotización no pudo leer los precios (Google Sheets / Maps). Intentá de nuevo en unos minutos.";
		case 503:
			return "El servicio de cotización no está configurado. Avisá al administrador.";
		case 0:
			return "No se pudo contactar el servicio de cotización. Verificá que esté en línea.";
		default:
			return "Ocurrió un error al generar la cotización. Intentá de nuevo.";
	}
}

async function request<T>(
	path: string,
	idToken: string | undefined,
	body: unknown,
): Promise<T> {
	let response: Response;
	try {
		response = await fetch(`${BASE_URL}${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
			},
			body: JSON.stringify(body),
			cache: "no-store",
		});
	} catch {
		// Falla de red / servicio caído.
		throw new QuotationApiError(friendlyMessage(0), 0, true);
	}

	if (!response.ok) {
		const unavailable = response.status === 502 || response.status === 503;
		throw new QuotationApiError(
			friendlyMessage(response.status),
			response.status,
			unavailable,
		);
	}

	return (await response.json()) as T;
}

/** Genera la cotización/reservación (cálculo + totales + codigo). */
export function generateQuote(
	payload: ManualQuoteRequest,
	idToken: string | undefined,
): Promise<QuotationResponse> {
	return request<QuotationResponse>("/quotes/manual", idToken, payload);
}

/** Renderiza el documento (DOCX/PDF) desde el JSON de cotización. */
export function renderDocument(
	payload: DocumentRenderRequest,
	idToken: string | undefined,
): Promise<DocumentRenderResponse> {
	return request<DocumentRenderResponse>("/documents/render", idToken, payload);
}

/**
 * Renderiza el documento y devuelve los bytes del PDF (vista previa bajo
 * demanda). Mapea errores a QuotationApiError igual que `request`.
 */
export async function previewDocument(
	cotizacion: QuotationResponse,
	idToken: string | undefined,
): Promise<ArrayBuffer> {
	let response: Response;
	try {
		response = await fetch(`${BASE_URL}/documents/preview`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
			},
			body: JSON.stringify({ cotizacion }),
			cache: "no-store",
		});
	} catch {
		throw new QuotationApiError(friendlyMessage(0), 0, true);
	}

	if (!response.ok) {
		const unavailable = response.status === 502 || response.status === 503;
		throw new QuotationApiError(
			friendlyMessage(response.status),
			response.status,
			unavailable,
		);
	}

	return response.arrayBuffer();
}

/** Chequeo de disponibilidad (GET /health). No lanza: devuelve null si falla. */
export async function checkHealth(): Promise<{
	status: string;
	sheets_configured: boolean;
} | null> {
	try {
		const r = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
		if (!r.ok) return null;
		return (await r.json()) as { status: string; sheets_configured: boolean };
	} catch {
		return null;
	}
}
