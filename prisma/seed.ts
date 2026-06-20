// Seed de importación de datos históricos reales (Google Sheets → BD).
//
// La data vive en prisma/seed-data/import.json, generada desde los Excel con
// prisma/seed-data/extract.py. Para regenerarla:
//   python3 prisma/seed-data/extract.py
//
// Fuentes importadas:
//   - Servicios (CATÁLOGO_GENERAL)            → Service
//   - Botargas / personajes (BOTARGAS)        → CatalogItem (CHARACTER)
//   - Reglas de descuento (REGLAS_DESCUENTO)  → Settings (editables en /ajustes)
//   - Clientes (CLIENTES)                     → Client (+ User responsable)
//   - Eventos (EVENTOS)                       → Event
//
// Idempotente: purga datos de negocio y recarga. Los usuarios responsables se
// upsertean por email (no se borran en la purga para no romper auth).
//
// Ejecutar: npx prisma db seed   (o: npm run db:seed)
import { loadEnvFile } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import importData from "./seed-data/import.json" with { type: "json" };

// El seed corre fuera de Next.js; cargamos .env.local explícitamente.
try {
	loadEnvFile(".env.local");
} catch {
	// Si las variables ya están exportadas, continuar.
}

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });
const purgeOnly = process.argv.includes("--purge");

async function purgeBusinessData() {
	// Orden inverso de dependencias para limpiar solo datos de negocio/demo.
	await prisma.payment.deleteMany();
	await prisma.note.deleteMany();
	await prisma.auditLog.deleteMany();
	await prisma.task.deleteMany();
	await prisma.eventAssignment.deleteMany();
	await prisma.reservation.deleteMany();
	await prisma.quote.deleteMany();
	await prisma.interaction.deleteMany();
	await prisma.eventCatalogItem.deleteMany();
	await prisma.eventService.deleteMany();
	await prisma.event.deleteMany();
	await prisma.client.deleteMany();
	await prisma.collaboratorCharacter.deleteMany();
	await prisma.collaborator.deleteMany();
	await prisma.packageItem.deleteMany();
	await prisma.package.deleteMany();
	await prisma.service.deleteMany();
	await prisma.catalogItem.deleteMany();
	await prisma.documentCounter.deleteMany();
	await prisma.settings.deleteMany();
}

function dateOnly(value: string | null) {
	return value ? new Date(`${value}T00:00:00Z`) : null;
}

async function main() {
	await purgeBusinessData();

	if (purgeOnly) {
		console.log("Seed purgado: datos de negocio eliminados. Usuarios/auth se conservaron.");
		return;
	}

	// --- Configuración (reglas de descuento/recargo desde REGLAS_DESCUENTO) ---
	await prisma.settings.create({ data: importData.settings });

	// --- Servicios (à la carte) ---
	if (importData.services.length > 0) {
		await prisma.service.createMany({
			data: importData.services.map(svc => ({
				name: svc.name,
				category: svc.category,
				unitPrice: svc.unitPrice,
				priceType: svc.priceType as never,
			})),
		});
	}

	// --- Personajes / botargas (catálogo) ---
	if (importData.characters.length > 0) {
		await prisma.catalogItem.createMany({
			data: importData.characters.map(c => ({
				name: c.name,
				category: c.category as never,
				description: c.description,
				tags: c.tags,
				hourlyPrice: c.hourlyPrice,
				active: c.active,
			})),
		});
	}

	// --- Usuarios responsables (upsert por email; no se purgan) ---
	const userIdByEmail = new Map<string, string>();
	for (const u of importData.users) {
		const user = await prisma.user.upsert({
			where: { email: u.email },
			update: { name: u.name },
			create: { email: u.email, name: u.name },
			select: { id: true },
		});
		userIdByEmail.set(u.email, user.id);
	}

	// --- Clientes ---
	const clientIdByExternal = new Map<string, string>();
	for (const c of importData.clients) {
		const client = await prisma.client.create({
			data: {
				firstName: c.firstName,
				lastName: c.lastName,
				phone: c.phone.e164,
				phoneCountry: c.phone.country,
				phoneFormatted: c.phone.formatted,
				type: c.type as never,
				companyName: c.companyName,
				companyPhone: c.companyPhone,
				notes: c.notes,
				responsibleId: c.responsibleEmail
					? (userIdByEmail.get(c.responsibleEmail) ?? null)
					: null,
				firstContactAt: c.firstContactAt ? new Date(c.firstContactAt) : new Date(),
				lastContactAt: c.lastContactAt ? new Date(c.lastContactAt) : new Date(),
			},
			select: { id: true },
		});
		clientIdByExternal.set(c.externalId, client.id);
	}

	// --- Eventos ---
	let skippedEvents = 0;
	const completedByClient = new Map<string, number>();
	for (const e of importData.events) {
		const clientId = clientIdByExternal.get(e.clientExternalId);
		if (!clientId) {
			skippedEvents++;
			continue;
		}
		await prisma.event.create({
			data: {
				clientId,
				name: e.name,
				eventType: e.eventType as never,
				funnelStage: e.funnelStage as never,
				eventDate: dateOnly(e.eventDate),
				startTime: e.startTime,
				durationHours: e.durationHours,
				venueAddress: e.venueAddress,
				guestCount: e.guestCount,
				honoreeName: e.honoreeName,
				honoreeAge: e.honoreeAge,
				rating: e.rating,
				internalNotes: e.internalNotes,
			},
		});
		if (e.funnelStage === "COMPLETED") {
			completedByClient.set(
				e.clientExternalId,
				(completedByClient.get(e.clientExternalId) ?? 0) + 1,
			);
		}
	}

	// --- Recurrencia: clientes con más de 1 evento COMPLETED ---
	const recurringExternalIds = [...completedByClient.entries()]
		.filter(([, n]) => n > 1)
		.map(([ext]) => ext);
	for (const ext of recurringExternalIds) {
		const id = clientIdByExternal.get(ext);
		if (id) await prisma.client.update({ where: { id }, data: { isRecurring: true } });
	}

	console.log(
		`Seed completado: ${importData.services.length} servicios, ${importData.characters.length} personajes, ` +
			`${importData.users.length} usuarios responsables, ${clientIdByExternal.size} clientes, ` +
			`${importData.events.length - skippedEvents} eventos` +
			(skippedEvents ? ` (${skippedEvents} omitidos sin cliente)` : "") +
			`, ${recurringExternalIds.length} clientes recurrentes.`,
	);
}

main()
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
