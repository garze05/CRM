// Sirve la vista previa del PDF de una cotización (bajo demanda).
// Lee el documentPayload guardado, lo manda a la Quotation API
// (POST /documents/preview) con el id_token de la sesión y devuelve el PDF.
import { auth } from "@/app/lib/auth";
import { getQuoteDocumentPayload } from "@/app/lib/server/quotes";
import {
	previewDocument,
	QuotationApiError,
} from "@/app/lib/integrations/quotation-api";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session?.user) {
		return new Response("No autorizado", { status: 401 });
	}

	const { id } = await params;
	const payload = await getQuoteDocumentPayload(id);
	if (!payload) {
		return new Response(
			"Esta cotización no tiene documento para previsualizar. Regenerala para producir el PDF.",
			{ status: 404 },
		);
	}

	try {
		const pdf = await previewDocument(payload, session?.idToken);
		return new Response(pdf, {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `inline; filename="${payload.codigo}.pdf"`,
				"Cache-Control": "private, no-store",
			},
		});
	} catch (error) {
		const message =
			error instanceof QuotationApiError
				? error.message
				: "No se pudo generar el documento.";
		const status =
			error instanceof QuotationApiError && error.status !== 0
				? error.status
				: 502;
		return new Response(message, { status });
	}
}
