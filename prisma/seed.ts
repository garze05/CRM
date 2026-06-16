// Seed de desarrollo — traduce los datos de ejemplo (antes en app/lib/mock-data.ts)
// al esquema real de Prisma. Idempotente: limpia y recarga las tablas sembradas.
//
// Ejecutar: npx prisma db seed
import { loadEnvFile } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

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

// Normalización mínima para el seed (números CR conocidos). En el flujo real,
// el alta de cliente usa normalizePhone() de app/lib/validation/phone.ts; aquí
// evitamos esa dependencia por un bug de metadata de libphonenumber-js bajo tsx.
function phone(input: string) {
	const digits = input.replace(/[^\d+]/g, "");
	const national = digits.replace(/^\+506/, "");
	const formatted = `${national.slice(0, 4)} ${national.slice(4)}`.trim();
	return { e164: digits, country: "CR", formatted };
}

async function main() {
	// Orden inverso de dependencias para limpiar.
	await prisma.interaction.deleteMany();
	await prisma.event.deleteMany();
	await prisma.client.deleteMany();

	const maria = await prisma.client.create({
		data: {
			firstName: "María",
			lastName: "Rodríguez",
			...mapPhone(phone("+506 8888 1144")),
			type: "FAMILY",
			notes:
				"Prefiere contacto por WhatsApp. Le interesan paquetes con personaje principal e inflable pequeño.",
			firstContactAt: new Date("2026-06-07T12:00:00Z"),
			lastContactAt: new Date("2026-06-08T12:00:00Z"),
		},
	});

	const andrea = await prisma.client.create({
		data: {
			firstName: "Andrea",
			lastName: "Mora",
			...mapPhone(phone("+506 8701 3320")),
			type: "EDUCATIONAL",
			notes: "Coordina actividades institucionales para preescolar y primaria.",
			firstContactAt: new Date("2026-05-28T12:00:00Z"),
			lastContactAt: new Date("2026-06-06T12:00:00Z"),
		},
	});

	const carlos = await prisma.client.create({
		data: {
			firstName: "Carlos",
			lastName: "Jiménez",
			...mapPhone(phone("+506 6044 9001")),
			type: "CORPORATE",
			notes:
				"Busca opciones para día familiar empresarial con logística completa.",
			firstContactAt: new Date("2026-05-20T12:00:00Z"),
			lastContactAt: new Date("2026-06-04T12:00:00Z"),
		},
	});

	// Cliente recurrente: más de 1 evento COMPLETED → isRecurring = true.
	await prisma.client.create({
		data: {
			firstName: "Sofía",
			lastName: "Castro",
			...mapPhone(phone("+506 8312 4477")),
			type: "FAMILY",
			notes: "Cliente recurrente. Le gustan paquetes con animación musical.",
			isRecurring: true,
			firstContactAt: new Date("2025-11-15T12:00:00Z"),
			lastContactAt: new Date("2026-03-01T12:00:00Z"),
		},
	});

	const emma = await prisma.event.create({
		data: {
			clientId: maria.id,
			name: "Cumpleaños de Emma",
			eventType: "CHILDREN",
			funnelStage: "QUOTED",
			eventDate: new Date("2026-06-22"),
			startTime: "14:00",
			durationHours: 3,
			venueName: "Casa Rodríguez",
			venueAddress: "San Pedro, Montes de Oca",
			venueType: "OUTDOOR",
			guestCount: 35,
			honoreeName: "Emma",
			honoreeAge: 6,
		},
	});

	await prisma.event.create({
		data: {
			clientId: carlos.id,
			name: "Fiesta Empresa Sol",
			eventType: "CORPORATE",
			funnelStage: "RESERVED",
			eventDate: new Date("2026-07-04"),
			startTime: "10:00",
			durationHours: 5,
			venueName: "Centro de Eventos Heredia",
			venueAddress: "San Francisco, Heredia",
			venueType: "INDOOR",
			guestCount: 120,
		},
	});

	await prisma.event.create({
		data: {
			clientId: andrea.id,
			name: "Día familiar escolar",
			eventType: "INSTITUTIONAL",
			funnelStage: "CONFIRMED",
			eventDate: new Date("2026-07-18"),
			startTime: "09:00",
			durationHours: 4,
			venueName: "Escuela Los Pinos",
			venueAddress: "Curridabat, San José",
			venueType: "OUTDOOR",
			guestCount: 180,
		},
	});

	await prisma.event.create({
		data: {
			clientId: maria.id,
			name: "Cumpleaños de Mateo",
			eventType: "CHILDREN",
			funnelStage: "COMPLETED",
			eventDate: new Date("2026-02-15"),
			startTime: "15:00",
			durationHours: 2.5,
			venueName: "Salón Comunal Barrio Dent",
			venueAddress: "Barrio Dent, San José",
			venueType: "INDOOR",
			guestCount: 28,
			honoreeName: "Mateo",
			honoreeAge: 7,
			rating: 5,
		},
	});

	// Interacciones de María (actualizan el último contacto en el flujo real).
	await prisma.interaction.createMany({
		data: [
			{
				clientId: maria.id,
				eventId: emma.id,
				channel: "WHATSAPP",
				direction: "OUTBOUND",
				summary:
					"Se envió la cotización con paquete de personaje principal.",
				occurredAt: new Date("2026-06-08T16:00:00Z"),
			},
			{
				clientId: maria.id,
				eventId: emma.id,
				channel: "WHATSAPP",
				direction: "INBOUND",
				summary:
					"Preguntó por disponibilidad de Princesa Estrella para el 22 de junio.",
				occurredAt: new Date("2026-06-07T18:00:00Z"),
			},
			{
				clientId: maria.id,
				channel: "PHONE_CALL",
				direction: "INBOUND",
				summary:
					"Primer contacto: cumpleaños para Emma, 35 invitados, patio exterior.",
				occurredAt: new Date("2026-06-07T15:00:00Z"),
			},
		],
	});

	console.log("Seed completado: 4 clientes, 4 eventos, 3 interacciones.");
}

function mapPhone(p: ReturnType<typeof phone>) {
	return {
		phone: p.e164,
		phoneCountry: p.country,
		phoneFormatted: p.formatted,
	};
}

main()
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
