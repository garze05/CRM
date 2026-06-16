"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../auth";
import {
	createTask,
	completeTask,
	type EntityRef,
} from "../server/tasks";

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
	const session = await auth();

	await createTask({
		title,
		description: String(formData.get("description") ?? "").trim() || null,
		dueAt,
		ref,
		createdById: session?.user?.id,
	});

	if (revalidate) revalidatePath(revalidate);
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

	await createTask({
		title,
		description: String(formData.get("description") ?? "").trim() || null,
		dueAt,
		ref: refFromValue(String(formData.get("entity") ?? "")),
		createdById: session?.user?.id,
	});

	revalidatePath("/tareas");
	redirect("/tareas");
}

export async function completeTaskAction(formData: FormData): Promise<void> {
	const id = String(formData.get("taskId") ?? "");
	if (!id) return;
	await completeTask(id);

	const revalidate = String(formData.get("revalidate") ?? "");
	if (revalidate) revalidatePath(revalidate);
	revalidatePath("/tareas");
}
