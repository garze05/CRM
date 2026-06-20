// Formateadores compartidos de la UI (moneda y fechas).
//
// Fechas: los campos date-only (@db.Date, ej. eventDate) se guardan a medianoche
// UTC; formatearlos en zona CR los retrocede un día → usar formatDateKey (UTC).
// Los timestamps completos usan formatTimestamp (zona America/Costa_Rica).

export function formatCrc(amount: number) {
	return new Intl.NumberFormat("es-CR", {
		style: "currency",
		currency: "CRC",
		maximumFractionDigits: 0,
	}).format(amount);
}

/** Fecha date-only en formato "YYYY-MM-DD" (o Date a medianoche UTC) → es-CR, en UTC. */
export function formatDateKey(date: string | Date | null) {
	if (!date) return "Sin fecha";
	const d = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : date;
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(d);
}

/** Timestamp completo → es-CR en hora local de Costa Rica. */
export function formatTimestamp(date: Date) {
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "America/Costa_Rica",
	}).format(date);
}
