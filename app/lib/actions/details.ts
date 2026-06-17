"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../db";
import { normalizePhone } from "../validation/phone";
import { recordActivity, type EntityType } from "../server/activity";

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

	await prisma.client.update({
		where: { id },
		data: {
			firstName,
			lastName,
			phone: normalized.e164,
			phoneCountry: normalized.country,
			phoneFormatted: normalized.formatted,
			type: type as never,
			notes: notes || null,
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
	const quote = await prisma.quote.update({
		where: { id },
		data: {
			status: text(formData, "status") as never,
			validUntil: dateOnly(text(formData, "validUntil")) ?? new Date(),
			notes: text(formData, "notes") || null,
		},
		select: { quoteNumber: true, eventId: true },
	});
	await touchActivity("quote.updated", "Quote", id, `actualizó cotización ${quote.quoteNumber}`);
	revalidatePath(`/cotizaciones/${id}`);
	revalidatePath(`/eventos/${quote.eventId}`);
	revalidatePath("/cotizaciones");
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
