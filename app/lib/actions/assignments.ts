"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { recordActivity } from "../server/activity";

export type AssignmentState = { error?: string; ok?: boolean };

const VALID_ROLES = [
	"MASCOT_COSTUME",
	"ENTERTAINER",
	"LOGISTICS",
	"OTHER",
] as const;

function normalizeRole(value: string): string | null {
	return (VALID_ROLES as readonly string[]).includes(value) ? value : null;
}

/** Asigna un colaborador a un evento con un rol específico para ese evento. */
export async function assignCollaboratorAction(
	_prevState: AssignmentState,
	formData: FormData,
): Promise<AssignmentState> {
	const eventId = String(formData.get("eventId") ?? "");
	const collaboratorId = String(formData.get("collaboratorId") ?? "");
	const roleInEvent = normalizeRole(String(formData.get("roleInEvent") ?? ""));

	if (!eventId || !collaboratorId) {
		return { error: "Seleccioná un colaborador." };
	}

	const existing = await prisma.eventAssignment.findUnique({
		where: { eventId_collaboratorId: { eventId, collaboratorId } },
		select: { id: true },
	});
	if (existing) {
		return { error: "Ese colaborador ya está asignado a este evento." };
	}

	await prisma.eventAssignment.create({
		data: { eventId, collaboratorId, roleInEvent: roleInEvent as never },
	});
	await recordActivity({
		action: "event.collaborator_assigned",
		entityType: "Event",
		entityId: eventId,
		summary: "asignó un colaborador a un evento",
	});

	revalidatePath(`/eventos/${eventId}`);
	revalidatePath("/");
	return { ok: true };
}

/** Cambia el rol que desempeña un colaborador en un evento concreto. */
export async function updateAssignmentRoleAction(
	formData: FormData,
): Promise<void> {
	const assignmentId = String(formData.get("assignmentId") ?? "");
	const eventId = String(formData.get("eventId") ?? "");
	const roleInEvent = normalizeRole(String(formData.get("roleInEvent") ?? ""));
	if (!assignmentId) return;

	await prisma.eventAssignment.update({
		where: { id: assignmentId },
		data: { roleInEvent: roleInEvent as never },
	});
	if (eventId) {
		await recordActivity({
			action: "event.assignment_role_updated",
			entityType: "Event",
			entityId: eventId,
			summary: "actualizó rol de colaborador en evento",
		});
	}

	if (eventId) revalidatePath(`/eventos/${eventId}`);
	revalidatePath("/");
}

export async function removeAssignmentAction(formData: FormData): Promise<void> {
	const assignmentId = String(formData.get("assignmentId") ?? "");
	const eventId = String(formData.get("eventId") ?? "");
	if (!assignmentId) return;

	await prisma.eventAssignment.delete({ where: { id: assignmentId } });
	if (eventId) {
		await recordActivity({
			action: "event.collaborator_removed",
			entityType: "Event",
			entityId: eventId,
			summary: "quitó un colaborador de un evento",
		});
	}

	if (eventId) revalidatePath(`/eventos/${eventId}`);
	revalidatePath("/");
}
