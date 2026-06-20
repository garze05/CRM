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
	type EntityRef,
} from "../server/tasks";
import type { EntityType } from "../server/activity";

export type QuickTaskState = { error?: string; ok?: boolean };

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
	const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
	const dueAt = dueDateRaw ? new Date(`${dueDateRaw}T12:00:00Z`) : null;

	const { ref, revalidate } = refFromForm(formData);
	const explicitRevalidate = String(formData.get("revalidate") ?? "").trim();
	const session = await auth();
	const createdById = isAuthBypassEnabled() ? undefined : session?.user?.id;

	const task = await createTask({
		title,
		description: String(formData.get("description") ?? "").trim() || null,
		dueAt,
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

	const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
	const dueAt = dueDateRaw ? new Date(`${dueDateRaw}T12:00:00Z`) : null;
	const session = await auth();
	const createdById = isAuthBypassEnabled() ? undefined : session?.user?.id;
	const ref = refFromValue(String(formData.get("entity") ?? ""));

	const task = await createTask({
		title,
		description: String(formData.get("description") ?? "").trim() || null,
		dueAt,
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
	redirect("/tareas");
}

export async function updateTaskAction(formData: FormData): Promise<void> {
	const id = String(formData.get("taskId") ?? "");
	if (!id) return;

	const title = String(formData.get("title") ?? "").trim();
	if (!title) return;

	const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
	const dueAt = dueDateRaw ? new Date(`${dueDateRaw}T12:00:00Z`) : null;
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

	await prisma.task.update({
		where: { id },
		data: { title, description, dueAt },
	});

	const activityTarget = activityTargetFromRef(
		{
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
}
