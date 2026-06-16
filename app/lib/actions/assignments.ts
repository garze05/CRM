"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";

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

	revalidatePath(`/eventos/${eventId}`);
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

	if (eventId) revalidatePath(`/eventos/${eventId}`);
}

export async function removeAssignmentAction(formData: FormData): Promise<void> {
	const assignmentId = String(formData.get("assignmentId") ?? "");
	const eventId = String(formData.get("eventId") ?? "");
	if (!assignmentId) return;

	await prisma.eventAssignment.delete({ where: { id: assignmentId } });

	if (eventId) revalidatePath(`/eventos/${eventId}`);
}
