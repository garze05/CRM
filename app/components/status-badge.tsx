const badgeStyles: Record<string, string> = {
	LEAD: "bg-[#fff0cf] text-[#6f5600]",
	CONTACTADO: "bg-[#ffe2cf] text-[var(--primary-active)]",
	COTIZADO: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	RESERVADO: "bg-[#ffe2cf] text-[var(--primary-color)]",
	CONFIRMADO: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	REALIZADO: "bg-[#eee8e1] text-[var(--text-secondary)]",
	RECURRENTE: "bg-[#f5ddc8] text-[var(--primary-active)]",
	CANCELADO: "bg-[#ffe0e3] text-[var(--error-color)]",
	FAMILIAR: "bg-[#fff0cf] text-[#6f5600]",
	EDUCATIVO: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	CORPORATIVO: "bg-[#f5ddc8] text-[var(--primary-active)]",
	INSTITUCIONAL: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	INFANTIL: "bg-[#ffe2cf] text-[var(--primary-color)]",
	PENDIENTE_ANTICIPO: "bg-[#fff0cf] text-[#6f5600]",
	ANTICIPO_RECIBIDO: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	SALDO_PENDIENTE: "bg-[#ffe2cf] text-[var(--primary-color)]",
	PAGADO_COMPLETO: "bg-[#f5ddc8] text-[var(--primary-active)]",
	DISPONIBLE: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	ASIGNADO: "bg-[#fff0cf] text-[#6f5600]",
	INACTIVO: "bg-[#eee8e1] text-[var(--text-secondary)]",
	PERSONAJE: "bg-[#ffe2cf] text-[var(--primary-color)]",
	INFLABLE: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	DECORACION: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	OTRO: "bg-[#eee8e1] text-[var(--text-secondary)]",
	RESERVADO_INVENTARIO: "bg-[#f5ddc8] text-[var(--primary-active)]",
	MANTENIMIENTO_PENDIENTE: "bg-[#fff0cf] text-[#6f5600]",
	ACTIVO: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	PAUSADO: "bg-[#eee8e1] text-[var(--text-secondary)]",
	BORRADOR: "bg-[#eee8e1] text-[var(--text-secondary)]",
	ENVIADA: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	ACEPTADA: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	VENCIDA: "bg-[#fff0cf] text-[#6f5600]",
	RECHAZADA: "bg-[#ffe0e3] text-[var(--error-color)]",
	// Tareas
	PENDIENTE: "bg-[#fff0cf] text-[#6f5600]",
	EN_PROGRESO: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	COMPLETADA: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	CANCELADA: "bg-[#eee8e1] text-[var(--text-secondary)]",
	MANUAL: "bg-[#eee8e1] text-[var(--text-secondary)]",
	AUTOMATICA: "bg-[#ffe2cf] text-[var(--primary-color)]",
	SISTEMA: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	// Interacciones
	WHATSAPP: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	LLAMADA: "bg-[#fff0cf] text-[#6f5600]",
	ENTRANTE: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	SALIENTE: "bg-[#ffe2cf] text-[var(--primary-color)]",

	// --- Claves en inglés (enums de Prisma) — mismas paletas que sus
	// equivalentes en español. Permiten pasar el valor real de la BD como
	// `value` y la etiqueta en español como `label`.
	// ClientType
	FAMILY: "bg-[#fff0cf] text-[#6f5600]",
	EDUCATIONAL: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	CORPORATE: "bg-[#f5ddc8] text-[var(--primary-active)]",
	// FunnelStage
	PROSPECT: "bg-[#fff0cf] text-[#6f5600]",
	CONTACTED: "bg-[#ffe2cf] text-[var(--primary-active)]",
	QUOTED: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	RESERVED: "bg-[#ffe2cf] text-[var(--primary-color)]",
	CONFIRMED: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	COMPLETED: "bg-[#eee8e1] text-[var(--text-secondary)]",
	CANCELED: "bg-[#ffe0e3] text-[var(--error-color)]",
	RECURRING: "bg-[#f5ddc8] text-[var(--primary-active)]",
	// EventType
	CHILDREN: "bg-[#ffe2cf] text-[var(--primary-color)]",
	INSTITUTIONAL: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	// VenueType
	INDOOR: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	OUTDOOR: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	// InteractionChannel / Direction
	PHONE_CALL: "bg-[#fff0cf] text-[#6f5600]",
	IN_PERSON: "bg-[#eee8e1] text-[var(--text-secondary)]",
	INBOUND: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	OUTBOUND: "bg-[#ffe2cf] text-[var(--primary-color)]",
	// PaymentStatus
	PENDING_DEPOSIT: "bg-[#fff0cf] text-[#6f5600]",
	DEPOSIT_RECEIVED: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	BALANCE_PENDING: "bg-[#ffe2cf] text-[var(--primary-color)]",
	FULLY_PAID: "bg-[#f5ddc8] text-[var(--primary-active)]",
	// QuoteStatus
	DRAFT: "bg-[#eee8e1] text-[var(--text-secondary)]",
	SENT: "bg-[#d9f8f5] text-[var(--secondary-hover)]",
	ACCEPTED: "bg-[#d8f5f2] text-[var(--secondary-color)]",
	EXPIRED: "bg-[#fff0cf] text-[#6f5600]",
	REJECTED: "bg-[#ffe0e3] text-[var(--error-color)]",
};

export function StatusBadge({
	value,
	label,
}: {
	value: string;
	label?: string;
}) {
	return (
		<span
			className={`inline-flex min-h-7 w-fit items-center rounded-full px-2.5 py-1 text-xs font-black ${
				badgeStyles[value] ?? "bg-[var(--background-color)] text-[var(--text-primary)]"
			}`}
		>
			{label ?? value.replaceAll("_", " ")}
		</span>
	);
}
