"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../db";
import { normalizePhone } from "../validation/phone";
import { currentUserId } from "../server/session";
import { recordActivity, type EntityType } from "../server/activity";
import {
	deleteTrashItemPermanently,
	type TrashEntityType,
} from "../server/trash";

function text(formData: FormData, key: string) {
	return String(formData.get(key) ?? "").trim();
}

function dateOnly(value: string) {
	return value ? new Date(`${value}T00:00:00Z`) : null;
}

async function touchActivity(
	action: string,
	entityType: EntityType,
	entityId: string,
	summary: string,
) {
	await recordActivity({ action, entityType, entityId, summary });
	revalidatePath("/");
	revalidatePath("/papeleria");
}

export async function updateClientDetailAction(
	formData: FormData,
): Promise<void> {
	const id = text(formData, "id");
	const firstName = text(formData, "firstName");
	const lastName = text(formData, "lastName");
	const phone = text(formData, "phone");
	const type = text(formData, "type");
	const notes = text(formData, "notes");
	if (!id || !firstName || !lastName) return;
	const normalized = normalizePhone(phone, "CR");
	if (!normalized) return;

	// Empresa solo aplica a tipos distintos de Familiar.
	const isCompany = type !== "FAMILY";
	const companyPhone = isCompany
		? normalizePhone(text(formData, "companyPhone"), "CR")
		: null;

	await prisma.client.update({
		where: { id },
		data: {
			firstName,
			lastName,
			phone: normalized.e164,
			phoneCountry: normalized.country,
			phoneFormatted: normalized.formatted,
			type: type as never,
			companyName: isCompany ? text(formData, "companyName") || null : null,
			companyPhone: companyPhone?.e164 ?? null,
			notes: notes || null,
			// El responsable queda como el usuario de la sesión actual.
			responsibleId: (await currentUserId()) ?? undefined,
		},
	});
	await touchActivity("client.updated", "Client", id, `actualizó cliente ${firstName} ${lastName}`);
	revalidatePath(`/clientes/${id}`);
	revalidatePath("/clientes");
}

export async function updateCollaboratorDetailAction(
	formData: FormData,
): Promise<void> {
	const id = text(formData, "id");
	const firstName = text(formData, "firstName");
	const lastName = text(formData, "lastName");
	const phone = text(formData, "phone");
	const normalized = phone ? normalizePhone(phone, "CR") : null;
	if (!id || !firstName || !lastName) return;
	if (phone && !normalized) return;

	await prisma.collaborator.update({
		where: { id },
		data: {
			firstName,
			lastName,
			phone: normalized?.e164 ?? null,
			phoneCountry: normalized?.country ?? "CR",
			phoneFormatted: normalized?.formatted ?? null,
			role: text(formData, "role") as never,
			active: text(formData, "active") === "ACTIVE",
			notes: text(formData, "notes") || null,
		},
	});
	await touchActivity(
		"collaborator.updated",
		"Collaborator",
		id,
		`actualizó colaborador ${firstName} ${lastName}`,
	);
	revalidatePath(`/colaboradores/${id}`);
	revalidatePath("/colaboradores");
}

export async function updateCatalogItemDetailAction(
	formData: FormData,
): Promise<void> {
	const id = text(formData, "id");
	const name = text(formData, "name");
	if (!id || !name) return;
	const tags = text(formData, "tags")
		.split(",")
		.map(tag => tag.trim())
		.filter(Boolean);

	await prisma.catalogItem.update({
		where: { id },
		data: {
			name,
			category: text(formData, "category") as never,
			active: text(formData, "active") === "ACTIVE",
			description: text(formData, "description") || null,
			tags,
		},
	});
	await touchActivity("catalog.updated", "CatalogItem", id, `actualizó catálogo ${name}`);
	revalidatePath(`/inventario/${id}`);
	revalidatePath("/inventario");
	revalidatePath("/catalogo");
}

export async function updateQuoteDetailAction(
	formData: FormData,
): Promise<void> {
	const id = text(formData, "id");
	if (!id) return;

	const current = await prisma.quote.findUnique({
		where: { id },
		select: { quoteNumber: true, eventId: true, documentPayload: true },
	});
	if (!current) return;

	const description = text(formData, "description") || null;
	const documentPayload =
		current.documentPayload &&
		typeof current.documentPayload === "object" &&
		!Array.isArray(current.documentPayload)
			? { ...current.documentPayload, descripcion: description ?? "" }
			: undefined;

	await prisma.quote.update({
		where: { id },
		data: {
			status: text(formData, "status") as never,
			validUntil: dateOnly(text(formData, "validUntil")) ?? new Date(),
			notes: description,
			...(documentPayload ? { documentPayload } : {}),
		},
	});
	await touchActivity("quote.updated", "Quote", id, `actualizó cotización ${current.quoteNumber}`);
	revalidatePath(`/cotizaciones/${id}`);
	revalidatePath(`/eventos/${current.eventId}`);
	revalidatePath("/cotizaciones");
}

export async function moveToTrashNoRedirect(
	entityType: EntityType,
	id: string,
): Promise<{ label: string }> {
	const now = new Date();
	let label = "registro";

	if (entityType === "Client") {
		const row = await prisma.client.update({
			where: { id },
			data: { deletedAt: now },
			select: { firstName: true, lastName: true },
		});
		label = `${row.firstName} ${row.lastName}`;
		revalidatePath("/clientes");
	} else if (entityType === "Event") {
		const row = await prisma.event.update({
			where: { id },
			data: { deletedAt: now },
			select: { name: true },
		});
		label = row.name;
		revalidatePath("/eventos");
	} else if (entityType === "Quote") {
		const row = await prisma.quote.update({
			where: { id },
			data: { deletedAt: now },
			select: { quoteNumber: true },
		});
		label = row.quoteNumber;
		revalidatePath("/cotizaciones");
	} else if (entityType === "CatalogItem") {
		const row = await prisma.catalogItem.update({
			where: { id },
			data: { deletedAt: now },
			select: { name: true },
		});
		label = row.name;
		revalidatePath("/inventario");
	} else if (entityType === "Collaborator") {
		const row = await prisma.collaborator.update({
			where: { id },
			data: { deletedAt: now },
			select: { firstName: true, lastName: true },
		});
		label = `${row.firstName} ${row.lastName}`;
		revalidatePath("/colaboradores");
	}

	await touchActivity(
		`${entityType.toLowerCase()}.trashed`,
		entityType,
		id,
		`envió a papelera ${label}`,
	);
	return { label };
}

export async function undoTrashAction(
	entityType: EntityType,
	id: string,
): Promise<void> {
	if (entityType === "Client") {
		await prisma.client.update({ where: { id }, data: { deletedAt: null } });
		revalidatePath("/clientes");
		revalidatePath(`/clientes/${id}`);
	} else if (entityType === "Event") {
		await prisma.event.update({ where: { id }, data: { deletedAt: null } });
		revalidatePath("/eventos");
		revalidatePath(`/eventos/${id}`);
	} else if (entityType === "Quote") {
		await prisma.quote.update({ where: { id }, data: { deletedAt: null } });
		revalidatePath("/cotizaciones");
		revalidatePath(`/cotizaciones/${id}`);
	} else if (entityType === "CatalogItem") {
		await prisma.catalogItem.update({ where: { id }, data: { deletedAt: null } });
		revalidatePath("/inventario");
		revalidatePath(`/inventario/${id}`);
	} else if (entityType === "Collaborator") {
		await prisma.collaborator.update({ where: { id }, data: { deletedAt: null } });
		revalidatePath("/colaboradores");
		revalidatePath(`/colaboradores/${id}`);
	} else {
		return;
	}
	await touchActivity(
		`${entityType.toLowerCase()}.restored`,
		entityType,
		id,
		"deshizo eliminación a papelera",
	);
}

export async function restoreNoRedirect(
	entityType: EntityType,
	id: string,
): Promise<{ label: string }> {
	let label = "registro";

	if (entityType === "Client") {
		const row = await prisma.client.update({
			where: { id },
			data: { deletedAt: null },
			select: { firstName: true, lastName: true },
		});
		label = `${row.firstName} ${row.lastName}`;
		revalidatePath("/clientes");
	} else if (entityType === "Event") {
		const row = await prisma.event.update({
			where: { id },
			data: { deletedAt: null },
			select: { name: true },
		});
		label = row.name;
		revalidatePath("/eventos");
	} else if (entityType === "Quote") {
		const row = await prisma.quote.update({
			where: { id },
			data: { deletedAt: null },
			select: { quoteNumber: true },
		});
		label = row.quoteNumber;
		revalidatePath("/cotizaciones");
	} else if (entityType === "CatalogItem") {
		const row = await prisma.catalogItem.update({
			where: { id },
			data: { deletedAt: null },
			select: { name: true },
		});
		label = row.name;
		revalidatePath("/inventario");
	} else if (entityType === "Collaborator") {
		const row = await prisma.collaborator.update({
			where: { id },
			data: { deletedAt: null },
			select: { firstName: true, lastName: true },
		});
		label = `${row.firstName} ${row.lastName}`;
		revalidatePath("/colaboradores");
	}

	await touchActivity(
		`${entityType.toLowerCase()}.restored`,
		entityType,
		id,
		`restauró desde papelera ${label}`,
	);
	return { label };
}

export async function moveToTrashAction(formData: FormData): Promise<void> {
	const entityType = text(formData, "entityType") as EntityType;
	const id = text(formData, "id");
	const returnTo = text(formData, "returnTo") || "/";
	if (!id) return;
	const now = new Date();
	let label = "registro";

	if (entityType === "Client") {
		const row = await prisma.client.update({
			where: { id },
			data: { deletedAt: now },
			select: { firstName: true, lastName: true },
		});
		label = `${row.firstName} ${row.lastName}`;
	} else if (entityType === "Event") {
		const row = await prisma.event.update({
			where: { id },
			data: { deletedAt: now },
			select: { name: true },
		});
		label = row.name;
	} else if (entityType === "Quote") {
		const row = await prisma.quote.update({
			where: { id },
			data: { deletedAt: now },
			select: { quoteNumber: true },
		});
		label = row.quoteNumber;
	} else if (entityType === "CatalogItem") {
		const row = await prisma.catalogItem.update({
			where: { id },
			data: { deletedAt: now },
			select: { name: true },
		});
		label = row.name;
	} else if (entityType === "Collaborator") {
		const row = await prisma.collaborator.update({
			where: { id },
			data: { deletedAt: now },
			select: { firstName: true, lastName: true },
		});
		label = `${row.firstName} ${row.lastName}`;
	}

	await touchActivity(`${entityType.toLowerCase()}.trashed`, entityType, id, `envió a papelera ${label}`);
	revalidatePath(returnTo);
	redirect(returnTo);
}

export async function restoreFromTrashAction(formData: FormData): Promise<void> {
	const entityType = text(formData, "entityType") as EntityType;
	const id = text(formData, "id");
	if (!id) return;

	if (entityType === "Client") {
		await prisma.client.update({ where: { id }, data: { deletedAt: null } });
	} else if (entityType === "Event") {
		await prisma.event.update({ where: { id }, data: { deletedAt: null } });
	} else if (entityType === "Quote") {
		await prisma.quote.update({ where: { id }, data: { deletedAt: null } });
	} else if (entityType === "CatalogItem") {
		await prisma.catalogItem.update({ where: { id }, data: { deletedAt: null } });
	} else if (entityType === "Collaborator") {
		await prisma.collaborator.update({ where: { id }, data: { deletedAt: null } });
	} else {
		return;
	}
	await touchActivity(`${entityType.toLowerCase()}.restored`, entityType, id, "restauró un registro desde papelera");
	revalidatePath("/papeleria");
	redirect("/papeleria");
}

export async function deletePermanentlyAction(formData: FormData): Promise<void> {
	const entityType = text(formData, "entityType") as TrashEntityType;
	const id = text(formData, "id");
	if (!id) return;

	const label = await deleteTrashItemPermanently(entityType, id);
	if (!label) return;

	await touchActivity(
		`${entityType.toLowerCase()}.permanently_deleted`,
		entityType,
		id,
		`eliminó definitivamente ${label}`,
	);
	revalidatePath("/papeleria");
	redirect("/papeleria");
}

export async function deletePermanentlyNoRedirect(
	entityType: TrashEntityType,
	id: string,
): Promise<{ label: string } | null> {
	const label = await deleteTrashItemPermanently(entityType, id);
	if (!label) return null;

	await touchActivity(
		`${entityType.toLowerCase()}.permanently_deleted`,
		entityType,
		id,
		`eliminó definitivamente ${label}`,
	);
	revalidatePath("/papeleria");
	revalidatePath("/");
	return { label };
}
