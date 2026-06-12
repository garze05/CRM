// Códigos legibles de documentos — formato heredado de CorrespondencyBot
// (decisión de negocio, 2026-06-11): {C|R}{DDMM}-{consecutivo}.
//   - C / R según el tipo de documento (cotización / reservación).
//   - DDMM proviene de la FECHA DEL EVENTO (no de la emisión); "XXXX" si aún
//     no hay fecha definida.
//   - El consecutivo es anual por tipo y arranca en 100 (DocumentCounter
//     persiste lastValue, default 99; el servicio incrementa en transacción).
// Ejemplos: C1503-101 (cotización, evento del 15/03), R2412-115.

export type DocumentType = "QUOTE" | "RESERVATION";

const DOCUMENT_PREFIX: Record<DocumentType, string> = {
  QUOTE: "C",
  RESERVATION: "R",
};

/**
 * Formatea el código de documento. `sequential` debe venir del
 * DocumentCounter del año en curso (>= 100).
 */
export function formatDocumentCode(
  type: DocumentType,
  eventDate: Date | null,
  sequential: number,
): string {
  const datePart = eventDate
    ? `${String(eventDate.getUTCDate()).padStart(2, "0")}${String(
        eventDate.getUTCMonth() + 1,
      ).padStart(2, "0")}`
    : "XXXX";

  return `${DOCUMENT_PREFIX[type]}${datePart}-${sequential}`;
}

/** Primer valor del consecutivo cada año. */
export const SEQUENTIAL_START = 100;
