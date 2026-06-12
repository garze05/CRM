export type ClientType = "FAMILIAR" | "EDUCATIVO" | "CORPORATIVO";
export type PipelineStatus =
	| "PROSPECTO"
	| "CONTACTADO"
	| "COTIZADO"
	| "RESERVADO"
	| "CONFIRMADO"
	| "REALIZADO"
	| "RECURRENTE"
	| "CANCELADO";

export type EventType = "INFANTIL" | "CORPORATIVO" | "INSTITUCIONAL";
export type PaymentStatus =
	| "PENDIENTE_ANTICIPO"
	| "ANTICIPO_RECIBIDO"
	| "SALDO_PENDIENTE"
	| "PAGADO_COMPLETO";
export type CollaboratorRole = "BOTARGA" | "ANIMADOR" | "LOGISTICA" | "OTRO";
export type InventoryCategory =
	| "PERSONAJE"
	| "INFLABLE"
	| "DECORACION"
	| "OTRO";

export type Client = {
	id: string;
	firstName: string;
	lastName: string;
	phone: string;
	type: ClientType;
	notes: string;
	firstContactDate: string;
	lastContactDate: string;
	pipelineStatus: PipelineStatus;
	eventsCompleted: number;
};

export type EventRecord = {
	id: string;
	clientId: string;
	name: string;
	type: EventType;
	pipelineStatus: PipelineStatus;
	date: string;
	startTime: string;
	durationHours: number;
	venueName: string;
	venueAddress: string;
	venueType: "INTERIOR" | "EXTERIOR";
	guestCount: number;
	paymentStatus: PaymentStatus;
	estimatedTotal: number;
	/** Personajes/servicios principales del catálogo (nombres para mostrar). */
	characters: string[];
};

export type Collaborator = {
	id: string;
	firstName: string;
	lastName: string;
	phone: string;
	role: CollaboratorRole;
	availability: "DISPONIBLE" | "ASIGNADO" | "INACTIVO";
	ratingAverage: number | null;
	thumbnailUrl: string;
};

export type InventoryItem = {
	id: string;
	name: string;
	category: InventoryCategory;
	description: string;
	active: boolean;
	availabilityStatus: "DISPONIBLE" | "RESERVADO" | "MANTENIMIENTO_PENDIENTE";
	tags: string[];
	thumbnailUrl: string;
};

export type QuoteStatus = "BORRADOR" | "ENVIADA" | "ACEPTADA";

export type QuoteRecord = {
	id: string;
	number: string;
	eventId: string;
	status: QuoteStatus;
	total: number;
	validUntil: string;
};

export const clients: Client[] = [
	{
		id: "cliente-1",
		firstName: "María",
		lastName: "Rodríguez",
		phone: "+506 8888 1144",
		type: "FAMILIAR",
		notes:
			"Prefiere contacto por WhatsApp. Le interesan paquetes con personaje principal e inflable pequeño.",
		firstContactDate: "2026-06-07",
		lastContactDate: "2026-06-08",
		pipelineStatus: "COTIZADO",
		eventsCompleted: 2,
	},
	{
		id: "cliente-2",
		firstName: "Andrea",
		lastName: "Mora",
		phone: "+506 8701 3320",
		type: "EDUCATIVO",
		notes: "Coordina actividades institucionales para preescolar y primaria.",
		firstContactDate: "2026-05-28",
		lastContactDate: "2026-06-06",
		pipelineStatus: "CONTACTADO",
		eventsCompleted: 1,
	},
	{
		id: "cliente-3",
		firstName: "Carlos",
		lastName: "Jiménez",
		phone: "+506 6044 9001",
		type: "CORPORATIVO",
		notes:
			"Busca opciones para día familiar empresarial con logística completa.",
		firstContactDate: "2026-05-20",
		lastContactDate: "2026-06-04",
		pipelineStatus: "RESERVADO",
		eventsCompleted: 0,
	},
	{
		id: "cliente-4",
		firstName: "Sofía",
		lastName: "Castro",
		phone: "+506 8312 4477",
		type: "FAMILIAR",
		notes: "Cliente recurrente. Le gustan paquetes con animación musical.",
		firstContactDate: "2025-11-15",
		lastContactDate: "2026-03-01",
		pipelineStatus: "RECURRENTE",
		eventsCompleted: 3,
	},
];

export const events: EventRecord[] = [
	{
		id: "evento-1",
		clientId: "cliente-1",
		name: "Cumpleaños de Emma",
		type: "INFANTIL",
		pipelineStatus: "COTIZADO",
		date: "2026-06-22",
		startTime: "14:00",
		durationHours: 3,
		venueName: "Casa Rodríguez",
		venueAddress: "San Pedro, Montes de Oca",
		venueType: "EXTERIOR",
		guestCount: 35,
		paymentStatus: "PENDIENTE_ANTICIPO",
		estimatedTotal: 185000,
		characters: ["Princesa Estrella"],
	},
	{
		id: "evento-2",
		clientId: "cliente-3",
		name: "Fiesta Empresa Sol",
		type: "CORPORATIVO",
		pipelineStatus: "RESERVADO",
		date: "2026-07-04",
		startTime: "10:00",
		durationHours: 5,
		venueName: "Centro de Eventos Heredia",
		venueAddress: "San Francisco, Heredia",
		venueType: "INTERIOR",
		guestCount: 120,
		paymentStatus: "PENDIENTE_ANTICIPO",
		estimatedTotal: 620000,
		characters: ["Superhéroe Azul", "Inflable Jungla"],
	},
	{
		id: "evento-3",
		clientId: "cliente-2",
		name: "Día familiar escolar",
		type: "INSTITUCIONAL",
		pipelineStatus: "CONFIRMADO",
		date: "2026-07-18",
		startTime: "09:00",
		durationHours: 4,
		venueName: "Escuela Los Pinos",
		venueAddress: "Curridabat, San José",
		venueType: "EXTERIOR",
		guestCount: 180,
		paymentStatus: "ANTICIPO_RECIBIDO",
		estimatedTotal: 480000,
		characters: ["Princesa Estrella", "Inflable Jungla"],
	},
	{
		id: "evento-4",
		clientId: "cliente-1",
		name: "Cumpleaños de Mateo",
		type: "INFANTIL",
		pipelineStatus: "REALIZADO",
		date: "2026-02-15",
		startTime: "15:00",
		durationHours: 2.5,
		venueName: "Salón Comunal Barrio Dent",
		venueAddress: "Barrio Dent, San José",
		venueType: "INTERIOR",
		guestCount: 28,
		paymentStatus: "PAGADO_COMPLETO",
		estimatedTotal: 145000,
		characters: ["Superhéroe Azul"],
	},
];

export const collaborators: Collaborator[] = [
	{
		id: "colaborador-1",
		firstName: "Luis",
		lastName: "Alvarado",
		phone: "+506 7010 5500",
		role: "BOTARGA",
		availability: "ASIGNADO",
		ratingAverage: 4.8,
		thumbnailUrl: "/window.svg",
	},
	{
		id: "colaborador-2",
		firstName: "Paola",
		lastName: "Vargas",
		phone: "+506 8890 2112",
		role: "ANIMADOR",
		availability: "DISPONIBLE",
		ratingAverage: 4.9,
		thumbnailUrl: "/globe.svg",
	},
	{
		id: "colaborador-3",
		firstName: "Mauricio",
		lastName: "Solano",
		phone: "+506 6222 8300",
		role: "LOGISTICA",
		availability: "DISPONIBLE",
		ratingAverage: null,
		thumbnailUrl: "/file.svg",
	},
];

export const inventoryItems: InventoryItem[] = [
	{
		id: "inventario-1",
		name: "Princesa Estrella",
		category: "PERSONAJE",
		description:
			"Personaje principal para fiestas infantiles con sesión de fotos.",
		active: true,
		availabilityStatus: "DISPONIBLE",
		tags: ["princesas", "niñas", "fotos"],
		thumbnailUrl: "/globe.svg",
	},
	{
		id: "inventario-2",
		name: "Inflable Jungla",
		category: "INFLABLE",
		description:
			"Inflable mediano para exterior, recomendado para 20 a 35 niños.",
		active: true,
		availabilityStatus: "MANTENIMIENTO_PENDIENTE",
		tags: ["inflable", "exterior", "infantil"],
		thumbnailUrl: "/window.svg",
	},
	{
		id: "inventario-3",
		name: "Decoración Arco Fiesta",
		category: "DECORACION",
		description:
			"Arco decorativo con colores personalizables para entrada o mesa.",
		active: true,
		availabilityStatus: "RESERVADO",
		tags: ["decoración", "globos", "mesa"],
		thumbnailUrl: "/file.svg",
	},
	{
		id: "inventario-4",
		name: "Superhéroe Azul",
		category: "PERSONAJE",
		description: "Botarga de superhéroe para activaciones y cumpleaños.",
		active: false,
		availabilityStatus: "DISPONIBLE",
		tags: ["superhéroes", "niños", "corporativo"],
		thumbnailUrl: "/next.svg",
	},
];

export const pipelineStages = [
	{ label: "PROSPECTO", total: 2 },
	{ label: "CONTACTADO", total: 4 },
	{ label: "COTIZADO", total: 3 },
	{ label: "RESERVADO", total: 2 },
	{ label: "CONFIRMADO", total: 5 },
	{ label: "REALIZADO", total: 8 },
];

export const pendingTasks = [
	{
		id: "tarea-1",
		title: "Cotización sin respuesta hace 24h",
		clientName: "María Rodríguez",
		dueLabel: "Hoy",
	},
	{
		id: "tarea-2",
		title: "Anticipo vence en 3 días",
		clientName: "Carlos Jiménez",
		dueLabel: "11 jun",
	},
	{
		id: "tarea-3",
		title: "Reactivar cliente recurrente",
		clientName: "Sofía Castro",
		dueLabel: "Pendiente",
	},
];

// Código de documento con el formato real del negocio (CorrespondencyBot):
// {C|R}{DDMM de la fecha del evento}-{ultimos dos digitos del año}{consecutivo anual desde 100}.
// Versión mock de app/lib/domain/numbering.ts para datos de prueba.
export function getMockDocumentCode(
	prefix: "C" | "R",
	eventDate: string,
	sequential: number,
) {
	const [yearStr, month, day] = eventDate.split("-");
	const yearDigits = yearStr.slice(-2);
	return `${prefix}${day}${month}-${yearDigits}${sequential}`;
}

export const quotes: QuoteRecord[] = events
	.filter(event =>
		["COTIZADO", "RESERVADO", "CONFIRMADO"].includes(event.pipelineStatus),
	)
	.map((event, index) => ({
		id: `cotizacion-${event.id}`,
		number: getMockDocumentCode("C", event.date, 100 + index),
		eventId: event.id,
		status:
			event.pipelineStatus === "COTIZADO"
				? "ENVIADA"
				: event.pipelineStatus === "RESERVADO"
					? "ACEPTADA"
					: "BORRADOR",
		total: event.estimatedTotal,
		validUntil: event.date,
	}));

export const suggestedQuote = {
	number: quotes[0]?.number ?? getMockDocumentCode("C", "2026-06-22", 100),
	description: "Paquete Fiesta + botarga adicional + transporte estimado.",
	subtotal: 165000,
	transport: 20000,
	total: 185000,
};

export function getClientFullName(client: Client) {
	return `${client.firstName} ${client.lastName}`;
}

export function getClientById(id: string) {
	return clients.find(client => client.id === id);
}

export function getEventById(id: string) {
	return events.find(event => event.id === id);
}

export function getCollaboratorById(id: string) {
	return collaborators.find(collaborator => collaborator.id === id);
}

export function getInventoryItemById(id: string) {
	return inventoryItems.find(item => item.id === id);
}

export function getQuoteById(id: string) {
	return quotes.find(quote => quote.id === id);
}

export function getClientEvents(clientId: string) {
	return events.filter(event => event.clientId === clientId);
}

export function getEventClient(event: EventRecord) {
	return clients.find(client => client.id === event.clientId);
}

export function getQuoteEvent(quote: QuoteRecord) {
	return events.find(event => event.id === quote.eventId);
}

export function formatCrc(amount: number) {
	return new Intl.NumberFormat("es-CR", {
		style: "currency",
		currency: "CRC",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function formatDate(date: string) {
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "America/Costa_Rica",
	}).format(new Date(`${date}T12:00:00Z`));
}

// ---------------------------------------------------------------------------
// Tareas (manuales, automáticas y de sistema)
// ---------------------------------------------------------------------------

export type TaskStatus =
	| "PENDIENTE"
	| "EN_PROGRESO"
	| "COMPLETADA"
	| "CANCELADA";
export type TaskOrigin = "MANUAL" | "AUTOMATICA" | "SISTEMA";

export type TaskRecord = {
	id: string;
	title: string;
	description?: string;
	/** YYYY-MM-DD o null si no tiene vencimiento. */
	dueDate: string | null;
	status: TaskStatus;
	origin: TaskOrigin;
	entityLabel: string;
	entityHref: string;
};

export const tasks: TaskRecord[] = [
	{
		id: "tarea-1",
		title: "Dar seguimiento a la cotización C2206-100",
		description: "Cotización enviada hace 24 horas sin respuesta del cliente.",
		dueDate: "2026-06-11",
		status: "PENDIENTE",
		origin: "AUTOMATICA",
		entityLabel: "María Rodríguez",
		entityHref: "/clientes/cliente-1",
	},
	{
		id: "tarea-2",
		title: "Recordar anticipo a Carlos Jiménez",
		description: "El anticipo de la Fiesta Empresa Sol vence en 3 días.",
		dueDate: "2026-06-14",
		status: "PENDIENTE",
		origin: "AUTOMATICA",
		entityLabel: "Fiesta Empresa Sol",
		entityHref: "/eventos/evento-2",
	},
	{
		id: "tarea-3",
		title: "Reactivar a Sofía Castro",
		description:
			"Más de 3 meses sin contacto después de su último evento realizado.",
		dueDate: null,
		status: "PENDIENTE",
		origin: "AUTOMATICA",
		entityLabel: "Sofía Castro",
		entityHref: "/clientes/cliente-4",
	},
	{
		id: "tarea-4",
		title: "Confirmar dirección exacta del evento escolar",
		dueDate: "2026-06-12",
		status: "EN_PROGRESO",
		origin: "MANUAL",
		entityLabel: "Día familiar escolar",
		entityHref: "/eventos/evento-3",
	},
	{
		id: "tarea-5",
		title: "Verificar colaboradores asignados",
		description:
			"Evento confirmado próximo; revisar que el equipo esté completo.",
		dueDate: "2026-06-13",
		status: "PENDIENTE",
		origin: "SISTEMA",
		entityLabel: "Día familiar escolar",
		entityHref: "/eventos/evento-3",
	},
	{
		id: "tarea-6",
		title: "Enviar fotos del cumpleaños de Mateo",
		dueDate: "2026-02-17",
		status: "COMPLETADA",
		origin: "MANUAL",
		entityLabel: "Cumpleaños de Mateo",
		entityHref: "/eventos/evento-4",
	},
];

// ---------------------------------------------------------------------------
// Actividad reciente (vista previa de la bitácora de auditoría)
// ---------------------------------------------------------------------------

export type ActivityEntry = {
	id: string;
	actor: string;
	description: string;
	timeAgo: string;
};

export const recentActivity: ActivityEntry[] = [
	{
		id: "actividad-1",
		actor: "Huberth Rodríguez",
		description: "envió la cotización C2206-100 a María Rodríguez",
		timeAgo: "hace 2 horas",
	},
	{
		id: "actividad-2",
		actor: "Huberth Rodríguez",
		description: "registró el anticipo del Día familiar escolar",
		timeAgo: "hace 5 horas",
	},
	{
		id: "actividad-3",
		actor: "Huberth Rodríguez",
		description: "asignó a Luis Alvarado al Día familiar escolar",
		timeAgo: "ayer",
	},
	{
		id: "actividad-4",
		actor: "Huberth Rodríguez",
		description: "creó el evento Fiesta Empresa Sol",
		timeAgo: "hace 2 días",
	},
];

// ---------------------------------------------------------------------------
// Interacciones registradas a mano (WhatsApp / llamadas)
// ---------------------------------------------------------------------------

export type InteractionRecord = {
	id: string;
	clientId: string;
	channel: "WHATSAPP" | "LLAMADA";
	direction: "ENTRANTE" | "SALIENTE";
	summary: string;
	date: string;
};

export const interactions: InteractionRecord[] = [
	{
		id: "interaccion-1",
		clientId: "cliente-1",
		channel: "WHATSAPP",
		direction: "SALIENTE",
		summary:
			"Se envió la cotización C2206-100 con paquete de personaje principal.",
		date: "2026-06-08",
	},
	{
		id: "interaccion-2",
		clientId: "cliente-1",
		channel: "WHATSAPP",
		direction: "ENTRANTE",
		summary:
			"Preguntó por disponibilidad de Princesa Estrella para el 22 de junio.",
		date: "2026-06-07",
	},
	{
		id: "interaccion-3",
		clientId: "cliente-1",
		channel: "LLAMADA",
		direction: "ENTRANTE",
		summary:
			"Primer contacto: cumpleaños para Emma, 35 invitados, patio exterior.",
		date: "2026-06-07",
	},
];

export function getClientInteractions(clientId: string) {
	return interactions.filter(interaction => interaction.clientId === clientId);
}

export function getClientTasks(clientId: string) {
	return tasks.filter(task => task.entityHref === `/clientes/${clientId}`);
}

export function getEventTasks(eventId: string) {
	return tasks.filter(task => task.entityHref === `/eventos/${eventId}`);
}

export function getQuoteTasks(quoteId: string) {
	return tasks.filter(task => task.entityHref === `/cotizaciones/${quoteId}`);
}

// ---------------------------------------------------------------------------
// Asignaciones Colaborador ↔ Evento (nota y calificación POR evento)
// ---------------------------------------------------------------------------

export type AssignmentRecord = {
	id: string;
	eventId: string;
	collaboratorId: string;
	roleInEvent: string;
	note: string | null;
	rating: number | null;
};

export const eventAssignments: AssignmentRecord[] = [
	{
		id: "asignacion-1",
		eventId: "evento-3",
		collaboratorId: "colaborador-1",
		roleInEvent: "Botarga principal",
		note: "Confirmar vestuario del personaje el jueves anterior.",
		rating: null,
	},
	{
		id: "asignacion-2",
		eventId: "evento-3",
		collaboratorId: "colaborador-2",
		roleInEvent: "Animación",
		note: null,
		rating: null,
	},
	{
		id: "asignacion-3",
		eventId: "evento-4",
		collaboratorId: "colaborador-1",
		roleInEvent: "Botarga principal",
		note: "Excelente manejo del grupo; el salón era pequeño para inflable.",
		rating: 5,
	},
	{
		id: "asignacion-4",
		eventId: "evento-4",
		collaboratorId: "colaborador-2",
		roleInEvent: "Animación musical",
		note: "Muy buena energía. Llegó 10 minutos tarde por transporte.",
		rating: 4,
	},
];

export function getEventAssignments(eventId: string) {
	return eventAssignments.filter(assignment => assignment.eventId === eventId);
}

export function getCollaboratorAssignments(collaboratorId: string) {
	return eventAssignments.filter(
		assignment => assignment.collaboratorId === collaboratorId,
	);
}
