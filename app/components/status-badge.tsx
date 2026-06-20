type Tone = "amber" | "orange" | "teal" | "neutral" | "red" | "purple" | "pink";

/**
 * Cada tono usa tokens semánticos con valores en claro y oscuro, así que el
 * badge mantiene contraste AA en ambos temas (DESIGN.md §3, §6.1). El fondo es
 * una mezcla translúcida del color y el texto usa el color a plena intensidad.
 */
const toneClasses: Record<Tone, string> = {
	amber:
		"bg-[color-mix(in_srgb,var(--tertiary-color)_28%,transparent)] text-[var(--warning-color)]",
	orange:
		"bg-[color-mix(in_srgb,var(--accent-color)_22%,transparent)] text-[var(--primary-color)]",
	teal: "bg-[color-mix(in_srgb,var(--secondary-color)_22%,transparent)] text-[var(--secondary-color)]",
	neutral: "bg-muted text-muted-foreground",
	red: "bg-[color-mix(in_srgb,var(--error-color)_18%,transparent)] text-[var(--error-color)]",
	purple:
		"bg-[color-mix(in_srgb,var(--badge-purple)_22%,transparent)] text-[var(--badge-purple)]",
	pink: "bg-[color-mix(in_srgb,var(--badge-pink)_22%,transparent)] text-[var(--badge-pink)]",
};

/** Mapa estado → tono. Claves en español y en inglés (enums de Prisma). */
const statusTones: Record<string, Tone> = {
	// FunnelStage / pipeline (es + en)
	LEAD: "amber",
	PROSPECT: "amber",
	CONTACTADO: "orange",
	CONTACTED: "orange",
	COTIZADO: "teal",
	QUOTED: "teal",
	RESERVADO: "orange",
	RESERVED: "orange",
	CONFIRMADO: "teal",
	CONFIRMED: "teal",
	REALIZADO: "neutral",
	COMPLETED: "neutral",
	CANCELADO: "red",
	CANCELED: "red",
	RECURRENTE: "orange",
	RECURRING: "orange",
	// ClientType
	FAMILIAR: "amber",
	FAMILY: "amber",
	EDUCATIVO: "teal",
	EDUCATIONAL: "teal",
	CORPORATIVO: "orange",
	CORPORATE: "orange",
	INSTITUCIONAL: "teal",
	SHOPPING_CENTER: "purple",
	ADVERTISING_AGENCY: "pink",
	// EventType
	INFANTIL: "orange",
	CHILDREN: "orange",
	INSTITUTIONAL: "teal",
	// PaymentStatus
	PENDIENTE_ANTICIPO: "amber",
	PENDING_DEPOSIT: "amber",
	ANTICIPO_RECIBIDO: "teal",
	DEPOSIT_RECEIVED: "teal",
	SALDO_PENDIENTE: "orange",
	BALANCE_PENDING: "orange",
	PAGADO_COMPLETO: "orange",
	FULLY_PAID: "orange",
	// CatalogCategory / availability
	PERSONAJE: "orange",
	CHARACTER: "orange",
	INFLABLE: "teal",
	INFLATABLE: "teal",
	DECORACION: "teal",
	DECORATION: "teal",
	SERVICIO: "amber",
	SERVICE: "amber",
	DISPONIBLE: "teal",
	AVAILABLE: "teal",
	ASIGNADO: "amber",
	RESERVADO_INVENTARIO: "orange",
	RESERVED_INVENTORY: "orange",
	MANTENIMIENTO_PENDIENTE: "amber",
	MAINTENANCE_PENDING: "amber",
	INACTIVO: "neutral",
	// VenueType
	INDOOR: "teal",
	OUTDOOR: "teal",
	// QuoteStatus
	BORRADOR: "neutral",
	DRAFT: "neutral",
	ENVIADA: "teal",
	SENT: "teal",
	ACEPTADA: "teal",
	ACCEPTED: "teal",
	VENCIDA: "amber",
	EXPIRED: "amber",
	RECHAZADA: "red",
	REJECTED: "red",
	// TaskStatus + TaskOrigin
	PENDIENTE: "amber",
	PENDING: "amber",
	EN_PROGRESO: "teal",
	IN_PROGRESS: "teal",
	COMPLETADA: "teal",
	CANCELADA: "neutral",
	PAUSADO: "neutral",
	ACTIVO: "teal",
	MANUAL: "neutral",
	AUTOMATICA: "orange",
	AUTOMATIC: "orange",
	SISTEMA: "teal",
	SYSTEM: "teal",
	// InteractionChannel / Direction
	WHATSAPP: "teal",
	LLAMADA: "amber",
	PHONE_CALL: "amber",
	IN_PERSON: "neutral",
	ENTRANTE: "teal",
	INBOUND: "teal",
	SALIENTE: "orange",
	OUTBOUND: "orange",
	// CollaboratorRole
	MASCOT_COSTUME: "orange",
	ENTERTAINER: "teal",
	LOGISTICS: "teal",
	OTRO: "neutral",
	OTHER: "neutral",
};

export function StatusBadge({
	value,
	label,
}: {
	value: string;
	label?: string;
}) {
	const tone = statusTones[value] ?? "neutral";

	return (
		<span
			className={`inline-flex min-h-7 w-fit items-center rounded-full px-2.5 py-1 text-xs font-black ${toneClasses[tone]}`}
		>
			{label ?? value.replaceAll("_", " ")}
		</span>
	);
}
