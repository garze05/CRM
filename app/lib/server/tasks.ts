// Servicio server-side de Tareas. Lee/escribe sobre el modelo Task y normaliza
// a un tipo TaskItem listo para la UI (con href/label de la entidad asociada).
import "server-only";
import { prisma } from "../db";

export type TaskItem = {
	id: string;
	title: string;
	description: string | null;
	dueAt: Date | null;
	dueHasTime: boolean;
	status: string;
	origin: string;
	/** Enlace y etiqueta de la entidad asociada (cliente/evento/colaborador). */
	entityHref: string | null;
	entityLabel: string | null;
};

const entityInclude = {
	client: { select: { firstName: true, lastName: true } },
	event: { select: { name: true } },
	collaborator: { select: { firstName: true, lastName: true } },
} as const;

type TaskRow = {
	id: string;
	title: string;
	description: string | null;
	dueAt: Date | null;
	dueHasTime: boolean;
	status: string;
	origin: string;
	clientId: string | null;
	eventId: string | null;
	collaboratorId: string | null;
	client: { firstName: string; lastName: string } | null;
	event: { name: string } | null;
	collaborator: { firstName: string; lastName: string } | null;
};

function toTaskItem(task: TaskRow): TaskItem {
	let entityHref: string | null = null;
	let entityLabel: string | null = null;
	if (task.clientId && task.client) {
		entityHref = `/clientes/${task.clientId}`;
		entityLabel = `${task.client.firstName} ${task.client.lastName}`;
	} else if (task.eventId && task.event) {
		entityHref = `/eventos/${task.eventId}`;
		entityLabel = task.event.name;
	} else if (task.collaboratorId && task.collaborator) {
		entityHref = `/colaboradores/${task.collaboratorId}`;
		entityLabel = `${task.collaborator.firstName} ${task.collaborator.lastName}`;
	}
	return {
		id: task.id,
		title: task.title,
		description: task.description,
		dueAt: task.dueAt,
		dueHasTime: task.dueHasTime,
		status: task.status,
		origin: task.origin,
		entityHref,
		entityLabel,
	};
}

export type EntityRef = {
	clientId?: string;
	eventId?: string;
	collaboratorId?: string;
};

/** Tareas no completadas/canceladas asociadas a una entidad (para su ficha). */
export async function listTasksForEntity(ref: EntityRef): Promise<TaskItem[]> {
	const where: EntityRef & { deletedAt: null } = { deletedAt: null };
	if (ref.clientId) where.clientId = ref.clientId;
	if (ref.eventId) where.eventId = ref.eventId;
	if (ref.collaboratorId) where.collaboratorId = ref.collaboratorId;

	const tasks = await prisma.task.findMany({
		where: {
			...where,
			status: { in: ["PENDING", "IN_PROGRESS"] },
		},
		orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
		include: entityInclude,
	});
	return tasks.map(t => toTaskItem(t as unknown as TaskRow));
}

/** Todas las tareas activas (tablero general). */
export async function listAllTasks(): Promise<TaskItem[]> {
	const tasks = await prisma.task.findMany({
		where: { deletedAt: null },
		orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
		include: entityInclude,
	});
	return tasks.map(t => toTaskItem(t as unknown as TaskRow));
}

/**
 * Tareas de mayor prioridad para el tablero de Inicio: pendientes/en progreso
 * de cualquier tipo (asociadas o no), ordenadas por vencimiento más próximo
 * (las sin fecha al final). Acotadas para una vista rápida del operador.
 */
export async function listPriorityTasks(limit = 6): Promise<TaskItem[]> {
	const tasks = await prisma.task.findMany({
		where: {
			deletedAt: null,
			status: { in: ["PENDING", "IN_PROGRESS"] },
		},
		orderBy: [
			{ dueAt: { sort: "asc", nulls: "last" } },
			{ createdAt: "desc" },
		],
		take: limit,
		include: entityInclude,
	});
	return tasks.map(t => toTaskItem(t as unknown as TaskRow));
}

/** Una tarea editable por id (incluye el valor de asociación para el formulario). */
export async function getTask(
	id: string,
): Promise<(TaskItem & { entityValue: string }) | null> {
	const task = await prisma.task.findFirst({
		where: { id, deletedAt: null },
		include: entityInclude,
	});
	if (!task) return null;
	const item = toTaskItem(task as unknown as TaskRow);
	let entityValue = "";
	if (task.clientId) entityValue = `client:${task.clientId}`;
	else if (task.eventId) entityValue = `event:${task.eventId}`;
	else if (task.collaboratorId) entityValue = `collaborator:${task.collaboratorId}`;
	return { ...item, entityValue };
}

/** Borrado lógico (conserva el registro con deletedAt). */
export async function softDeleteTask(id: string): Promise<void> {
	await prisma.task.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
}

/** Tareas generales: no están asociadas a cliente, evento ni colaborador. */
export async function listGeneralTasks(): Promise<TaskItem[]> {
	const tasks = await prisma.task.findMany({
		where: {
			deletedAt: null,
			clientId: null,
			eventId: null,
			collaboratorId: null,
			status: { in: ["PENDING", "IN_PROGRESS"] },
		},
		orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
		include: entityInclude,
	});
	return tasks.map(t => toTaskItem(t as unknown as TaskRow));
}

export type TaskEntityOption = {
	value: string;
	label: string;
	group: string;
};

export async function listTaskEntityOptions(): Promise<TaskEntityOption[]> {
	const [clients, events, quotes] = await Promise.all([
		prisma.client.findMany({
			where: { deletedAt: null },
			orderBy: { firstName: "asc" },
			select: { id: true, firstName: true, lastName: true },
		}),
		prisma.event.findMany({
			where: { deletedAt: null },
			orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
			select: { id: true, name: true },
		}),
		prisma.quote.findMany({
			where: { deletedAt: null },
			orderBy: { issuedAt: "desc" },
			select: {
				quoteNumber: true,
				eventId: true,
				event: { select: { name: true } },
			},
		}),
	]);

	return [
		...clients.map(client => ({
			value: `client:${client.id}`,
			label: `${client.firstName} ${client.lastName}`,
			group: "Clientes",
		})),
		...events.map(event => ({
			value: `event:${event.id}`,
			label: event.name,
			group: "Eventos",
		})),
		...quotes.map(quote => ({
			value: `event:${quote.eventId}`,
			label: `${quote.quoteNumber} · ${quote.event.name}`,
			group: "Cotizaciones",
		})),
	];
}

export type CreateTaskData = {
	title: string;
	description?: string | null;
	dueAt?: Date | null;
	dueHasTime?: boolean;
	ref: EntityRef;
	createdById?: string;
};

export async function createTask(data: CreateTaskData): Promise<{ id: string }> {
	const task = await prisma.task.create({
		data: {
			title: data.title,
			description: data.description || null,
			dueAt: data.dueAt ?? null,
			dueHasTime: data.dueHasTime ?? false,
			status: "PENDING",
			origin: "MANUAL",
			clientId: data.ref.clientId ?? null,
			eventId: data.ref.eventId ?? null,
			collaboratorId: data.ref.collaboratorId ?? null,
			createdById: data.createdById ?? null,
		},
		select: { id: true },
	});
	return task;
}

export async function completeTask(id: string): Promise<void> {
	await prisma.task.update({
		where: { id },
		data: { status: "COMPLETED", completedAt: new Date() },
	});
}

export async function reopenTask(id: string): Promise<void> {
	await prisma.task.update({
		where: { id },
		data: { status: "PENDING", completedAt: null },
	});
}
