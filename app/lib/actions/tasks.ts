"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../auth";
import { isAuthBypassEnabled } from "../auth-bypass";
import { recordActivity } from "../server/activity";
import { prisma } from "../db";
import {
	createTask,
	completeTask,
	reopenTask,
	softDeleteTask,
	type EntityRef,
} from "../server/tasks";
import type { EntityType } from "../server/activity";

export type QuickTaskState = { error?: string; ok?: boolean };

/**
 * Combina `dueDate` (YYYY-MM-DD) y `dueTime` (HH:mm, opcional) en un Date.
 * `dueHasTime` indica si el usuario fijó una hora (vs. solo fecha), para no
 * inventar una hora al releer la tarea.
 */
function parseDueAt(formData: FormData): {
	dueAt: Date | null;
	dueHasTime: boolean;
} {
	const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
	if (!dueDateRaw) return { dueAt: null, dueHasTime: false };
	const dueTimeRaw = String(formData.get("dueTime") ?? "").trim();
	if (/^\d{2}:\d{2}$/.test(dueTimeRaw)) {
		// Hora local de Costa Rica (UTC-6, sin horario de verano).
		return {
			dueAt: new Date(`${dueDateRaw}T${dueTimeRaw}:00-06:00`),
			dueHasTime: true,
		};
	}
	// Solo fecha: mediodía UTC para que el día calendario no se corra.
	return { dueAt: new Date(`${dueDateRaw}T12:00:00Z`), dueHasTime: false };
}

function refFromForm(formData: FormData): {
	ref: EntityRef;
	revalidate: string | null;
} {
	const entityType = String(formData.get("entityType") ?? "");
	const entityId = String(formData.get("entityId") ?? "");
	if (entityType === "client" && entityId) {
		return { ref: { clientId: entityId }, revalidate: `/clientes/${entityId}` };
	}
	if (entityType === "event" && entityId) {
		return { ref: { eventId: entityId }, revalidate: `/eventos/${entityId}` };
	}
	if (entityType === "collaborator" && entityId) {
		return {
			ref: { collaboratorId: entityId },
			revalidate: `/colaboradores/${entityId}`,
		};
	}
	return { ref: {}, revalidate: null };
}

function activityTargetFromRef(ref: EntityRef, fallbackTaskId: string): {
	entityType: EntityType;
	entityId: string;
} {
	if (ref.clientId) return { entityType: "Client", entityId: ref.clientId };
	if (ref.eventId) return { entityType: "Event", entityId: ref.eventId };
	if (ref.collaboratorId) {
		return { entityType: "Collaborator", entityId: ref.collaboratorId };
	}
	return { entityType: "Task", entityId: fallbackTaskId };
}

export async function createTaskAction(
	_prevState: QuickTaskState,
	formData: FormData,
): Promise<QuickTaskState> {
	const title = String(formData.get("title") ?? "").trim();
	if (!title) {
		return { error: "El título es obligatorio." };
	}
	const { dueAt, dueHasTime } = parseDueAt(formData);

	const { ref, revalidate } = refFromForm(formData);
	const explicitRevalidate = String(formData.get("revalidate") ?? "").trim();
	const session = await auth();
	const createdById = isAuthBypassEnabled() ? undefined : session?.user?.id;

	const task = await createTask({
		title,
		description: String(formData.get("description") ?? "").trim() || null,
		dueAt,
		dueHasTime,
		ref,
		createdById,
	});
	const activityTarget = activityTargetFromRef(ref, task.id);
	await recordActivity({
		action: "task.created",
		...activityTarget,
		summary: `creó tarea ${title}`,
	});

	if (explicitRevalidate) revalidatePath(explicitRevalidate);
	else if (revalidate) revalidatePath(revalidate);
	revalidatePath("/tareas");
	revalidatePath("/");
	return { ok: true };
}

function refFromValue(value: string): EntityRef {
	const [type, id] = value.split(":");
	if (!id) return {};
	if (type === "client") return { clientId: id };
	if (type === "event") return { eventId: id };
	if (type === "collaborator") return { collaboratorId: id };
	return {};
}

export async function createStandaloneTaskAction(formData: FormData): Promise<void> {
	const title = String(formData.get("title") ?? "").trim();
	if (!title) return;

	const { dueAt, dueHasTime } = parseDueAt(formData);
	const session = await auth();
	const createdById = isAuthBypassEnabled() ? undefined : session?.user?.id;
	const ref = refFromValue(String(formData.get("entity") ?? ""));

	const task = await createTask({
		title,
		description: String(formData.get("description") ?? "").trim() || null,
		dueAt,
		dueHasTime,
		ref,
		createdById,
	});
	const activityTarget = activityTargetFromRef(ref, task.id);
	await recordActivity({
		action: "task.created",
		...activityTarget,
		summary: `creó tarea ${title}`,
	});

	revalidatePath("/tareas");
	revalidatePath("/");
	redirect("/tareas");
}

export async function updateTaskAction(formData: FormData): Promise<void> {
	const id = String(formData.get("taskId") ?? "");
	if (!id) return;

	const title = String(formData.get("title") ?? "").trim();
	if (!title) return;

	const { dueAt, dueHasTime } = parseDueAt(formData);
	const description = String(formData.get("description") ?? "").trim() || null;

	const task = await prisma.task.findUnique({
		where: { id },
		select: {
			clientId: true,
			eventId: true,
			collaboratorId: true,
		},
	});
	if (!task) return;

	// La asociación solo se reasigna si el formulario incluye `entity`
	// (la edición en línea del tablero la omite y la conserva intacta).
	const hasEntityField = formData.has("entity");
	const newRef = hasEntityField
		? refFromValue(String(formData.get("entity") ?? ""))
		: null;
	const associationData = newRef
		? {
				clientId: newRef.clientId ?? null,
				eventId: newRef.eventId ?? null,
				collaboratorId: newRef.collaboratorId ?? null,
			}
		: {};

	await prisma.task.update({
		where: { id },
		data: { title, description, dueAt, dueHasTime, ...associationData },
	});

	const activityTarget = activityTargetFromRef(
		newRef ?? {
			clientId: task.clientId ?? undefined,
			eventId: task.eventId ?? undefined,
			collaboratorId: task.collaboratorId ?? undefined,
		},
		id,
	);
	await recordActivity({
		action: "task.updated",
		...activityTarget,
		summary: `actualizó tarea ${title}`,
	});

	const revalidate = String(formData.get("revalidate") ?? "");
	if (revalidate) revalidatePath(revalidate);
	revalidatePath("/tareas");
	revalidatePath("/");
	// La pantalla de edición vuelve al listado tras guardar.
	if (formData.get("redirectToList")) redirect("/tareas");
}

export async function reopenTaskAction(formData: FormData): Promise<void> {
	const id = String(formData.get("taskId") ?? "");
	if (!id) return;
	const task = await prisma.task.findUnique({
		where: { id },
		select: { title: true, clientId: true, eventId: true, collaboratorId: true },
	});
	await reopenTask(id);
	if (task) {
		const activityTarget = activityTargetFromRef(
			{
				clientId: task.clientId ?? undefined,
				eventId: task.eventId ?? undefined,
				collaboratorId: task.collaboratorId ?? undefined,
			},
			id,
		);
		await recordActivity({
			action: "task.reopened",
			...activityTarget,
			summary: `reabrió tarea ${task.title}`,
		});
	}

	const revalidate = String(formData.get("revalidate") ?? "");
	if (revalidate) revalidatePath(revalidate);
	revalidatePath("/tareas");
	revalidatePath("/");
}

export async function completeTaskAction(formData: FormData): Promise<void> {
	const id = String(formData.get("taskId") ?? "");
	if (!id) return;
	const task = await prisma.task.findUnique({
		where: { id },
		select: { title: true, clientId: true, eventId: true, collaboratorId: true },
	});
	await completeTask(id);
	if (task) {
		const activityTarget = activityTargetFromRef(
			{
				clientId: task.clientId ?? undefined,
				eventId: task.eventId ?? undefined,
				collaboratorId: task.collaboratorId ?? undefined,
			},
			id,
		);
		await recordActivity({
			action: "task.completed",
			...activityTarget,
			summary: `completó tarea ${task.title}`,
		});
	}

	const revalidate = String(formData.get("revalidate") ?? "");
	if (revalidate) revalidatePath(revalidate);
	revalidatePath("/tareas");
	revalidatePath("/");
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
	const id = String(formData.get("taskId") ?? "");
	if (!id) return;
	const task = await prisma.task.findUnique({
		where: { id },
		select: { title: true, clientId: true, eventId: true, collaboratorId: true },
	});
	await softDeleteTask(id);
	if (task) {
		const activityTarget = activityTargetFromRef(
			{
				clientId: task.clientId ?? undefined,
				eventId: task.eventId ?? undefined,
				collaboratorId: task.collaboratorId ?? undefined,
			},
			id,
		);
		await recordActivity({
			action: "task.deleted",
			...activityTarget,
			summary: `eliminó tarea ${task.title}`,
		});
	}

	const revalidate = String(formData.get("revalidate") ?? "");
	if (revalidate) revalidatePath(revalidate);
	revalidatePath("/tareas");
	revalidatePath("/");
	// Si la eliminación viene de la pantalla de edición, volver al listado.
	if (formData.get("redirectToList")) redirect("/tareas");
}
