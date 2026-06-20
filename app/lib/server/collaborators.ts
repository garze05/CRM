// Servicio server-side de Colaboradores y asignaciones a eventos.
import "server-only";
import { prisma } from "../db";
import { COLLABORATOR_ROLE_LABELS } from "../domain/labels";

export type CollaboratorListRow = {
	id: string;
	firstName: string;
	lastName: string;
	phoneFormatted: string | null;
	role: string;
	active: boolean;
	ratingAverage: number | null;
	assignmentsCount: number;
};

export async function listCollaborators(): Promise<CollaboratorListRow[]> {
	const collaborators = await prisma.collaborator.findMany({
		where: { deletedAt: null },
		orderBy: { firstName: "asc" },
		include: { _count: { select: { assignments: true } } },
	});
	return collaborators.map(c => ({
		id: c.id,
		firstName: c.firstName,
		lastName: c.lastName,
		phoneFormatted: c.phoneFormatted,
		role: c.role,
		active: c.active,
		ratingAverage: c.ratingAverage != null ? Number(c.ratingAverage) : null,
		assignmentsCount: c._count.assignments,
	}));
}

export async function getCollaboratorDetail(id: string) {
	return prisma.collaborator.findFirst({
		where: { id, deletedAt: null },
		include: {
			assignments: {
				include: { event: { select: { id: true, name: true, eventDate: true } } },
				orderBy: { createdAt: "desc" },
			},
		},
	});
}

export type CollaboratorDetail = NonNullable<
	Awaited<ReturnType<typeof getCollaboratorDetail>>
>;

/** Colaboradores activos para el combobox de asignación. */
export async function listCollaboratorsForSelect() {
	const collaborators = await prisma.collaborator.findMany({
		where: { deletedAt: null, active: true },
		orderBy: { firstName: "asc" },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			phoneFormatted: true,
			role: true,
		},
	});
	return collaborators.map(c => {
		const name = `${c.firstName} ${c.lastName}`;
		const roleLabel = COLLABORATOR_ROLE_LABELS[c.role] ?? c.role;
		return {
			id: c.id,
			label: `${name} · ${roleLabel}`,
			searchText: `${name} ${c.phoneFormatted ?? ""} ${roleLabel}`,
		};
	});
}
