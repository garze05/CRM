// Seed de desarrollo sobre el esquema real de Prisma.
// Idempotente: limpia y recarga las tablas sembradas.
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
const purgeOnly = process.argv.includes("--purge");

// Normalización mínima para el seed (números CR conocidos). En el flujo real,
// el alta de cliente usa normalizePhone() de app/lib/validation/phone.ts; aquí
// evitamos esa dependencia por un bug de metadata de libphonenumber-js bajo tsx.
function phone(input: string) {
	const digits = input.replace(/[^\d+]/g, "");
	const national = digits.replace(/^\+506/, "");
	const formatted = `${national.slice(0, 4)} ${national.slice(4)}`.trim();
	return { e164: digits, country: "CR", formatted };
}

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

async function main() {
	await purgeBusinessData();

	if (purgeOnly) {
		console.log("Seed purgado: datos de negocio eliminados. Usuarios/auth se conservaron.");
		return;
	}

	await prisma.settings.create({ data: {} });

	const princesa = await prisma.catalogItem.create({
		data: {
			name: "Princesa Estrella",
			category: "CHARACTER",
			description: "Personaje principal para fiestas infantiles con sesión de fotos.",
			tags: ["princesas", "niñas", "fotos"],
			hourlyPrice: 90000,
		},
	});
	const superheroe = await prisma.catalogItem.create({
		data: {
			name: "Superhéroe Azul",
			category: "CHARACTER",
			description: "Botarga de superhéroe con dinámica de juegos.",
			tags: ["superheroes", "niños", "juegos"],
			hourlyPrice: 85000,
		},
	});
	const inflable = await prisma.catalogItem.create({
		data: {
			name: "Inflable Jungla",
			category: "INFLATABLE",
			description: "Inflable mediano para exterior.",
			tags: ["inflable", "jungla", "exterior"],
			hourlyPrice: 70000,
		},
	});

	const pintacaritas = await prisma.service.create({
		data: {
			name: "Pintacaritas",
			category: "Animación",
			unitPrice: 35000,
			priceType: "PER_HOUR",
		},
	});
	await prisma.service.create({
		data: {
			name: "Hora adicional",
			category: "Extensión",
			unitPrice: 25000,
			priceType: "PER_HOUR",
		},
	});

	await prisma.package.create({
		data: {
			name: "Fiesta",
			description: "Personaje, animación e inflable para fiesta infantil.",
			durationHours: 3,
			priceFamily: 150000,
			priceEducational: 157500,
			priceCorporate: 165000,
			items: {
				create: [
					{ catalogItemId: princesa.id, quantity: 1 },
					{ catalogItemId: inflable.id, quantity: 1 },
					{ serviceId: pintacaritas.id, quantity: 1, hours: 1 },
				],
			},
		},
	});

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

	const diaFamiliar = await prisma.event.create({
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

	await prisma.eventCatalogItem.createMany({
		data: [
			{ eventId: emma.id, catalogItemId: princesa.id, quantity: 1 },
			{ eventId: diaFamiliar.id, catalogItemId: princesa.id, quantity: 1 },
			{ eventId: diaFamiliar.id, catalogItemId: inflable.id, quantity: 1 },
		],
	});

	await prisma.eventService.createMany({
		data: [
			{ eventId: emma.id, serviceId: pintacaritas.id, quantity: 1, hours: 2 },
		],
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

	// Cotizaciones de ejemplo con el formato real de codigo C{DDMM}-{YY}{seq}
	// (como lo arma la Quotation API). Permiten ver totales en eventos y la
	// pantalla de cotizaciones sin depender del motor externo.
	const emmaLineItems = [
		{ concepto: "Personaje: Princesa Estrella", cantidad: 1, horas: 3, precio_unitario: 90000, subtotal: 90000 },
		{ concepto: "Pintacaritas", cantidad: 1, horas: 2, precio_unitario: 35000, subtotal: 35000 },
		{ concepto: "Transporte", cantidad: 1, horas: 1, precio_unitario: 20000, subtotal: 20000 },
	];
	await prisma.quote.create({
		data: {
			eventId: emma.id,
			quoteNumber: "C2206-26100",
			subtotal: 125000,
			transportCost: 20000,
			discount: 0,
			taxAmount: 0,
			total: 145000,
			currency: "CRC",
			validUntil: new Date("2026-06-15"),
			status: "SENT",
			lineItems: emmaLineItems,
			documentPayload: {
				codigo: "C2206-26100",
				tipo_documento: "Cotización",
				fecha_envio: "2026-06-08",
				descripcion: "Paquete con personaje principal y pintacaritas.",
				cliente: {
					nombre: "María Rodríguez",
					telefono: "88881144",
					empresa: "No aplica",
					tel_empresa: "No aplica",
					tipo_cliente: "familiar",
				},
				evento: {
					tipo: "Infantil",
					fecha: "2026-06-22",
					ubicacion: "San Pedro, Montes de Oca",
					duracion: "3",
					homenajeado: "Emma",
					edad: "6",
					invitados: "35",
					info_extra: "",
				},
				servicios: emmaLineItems,
				totales: {
					subtotal_sin_iva: 125000,
					iva: 0,
					total: 145000,
					abono: 72500,
					pendiente: 72500,
				},
			},
			notes: "Paquete con personaje principal y pintacaritas.",
		},
	});

	const diaLineItems = [
		{ concepto: "Show institucional (2 personajes)", cantidad: 2, horas: 4, precio_unitario: 210000, subtotal: 420000 },
		{ concepto: "Transporte", cantidad: 1, horas: 1, precio_unitario: 35000, subtotal: 35000 },
	];
	const diaQuote = await prisma.quote.create({
		data: {
			eventId: diaFamiliar.id,
			quoteNumber: "C1807-26101",
			subtotal: 420000,
			transportCost: 35000,
			discount: 0,
			taxAmount: 59150,
			total: 514150,
			currency: "CRC",
			validUntil: new Date("2026-07-11"),
			status: "ACCEPTED",
			lineItems: diaLineItems,
			documentPayload: {
				codigo: "C1807-26101",
				tipo_documento: "Cotización",
				fecha_envio: "2026-06-10",
				descripcion: "Evento institucional con factura.",
				cliente: {
					nombre: "Andrea Mora",
					telefono: "87013320",
					empresa: "No aplica",
					tel_empresa: "No aplica",
					tipo_cliente: "escolar",
				},
				evento: {
					tipo: "Institucional",
					fecha: "2026-07-18",
					ubicacion: "Curridabat, San José",
					duracion: "4",
					homenajeado: "",
					edad: "",
					invitados: "180",
					info_extra: "",
				},
				servicios: diaLineItems,
				totales: {
					subtotal_sin_iva: 455000,
					iva: 59150,
					total: 514150,
					abono: 257075,
					pendiente: 257075,
				},
			},
			notes: "Evento institucional con factura.",
		},
	});

	await prisma.reservation.create({
		data: {
			eventId: diaFamiliar.id,
			quoteId: diaQuote.id,
			reservationNumber: "R1807-26101",
			agreedTotal: 514150,
			depositAmount: 257075,
			depositDueDate: new Date("2026-07-04"),
			balanceAmount: 257075,
			balanceDueDate: new Date("2026-07-18"),
			paymentStatus: "DEPOSIT_RECEIVED",
			notes: "Anticipo recibido por transferencia.",
		},
	});

	// Tareas de ejemplo (manuales y automáticas) asociadas a cliente/evento.
	await prisma.task.createMany({
		data: [
			{
				title: "Dar seguimiento a la cotización enviada",
				description: "Cotización enviada hace 24 h sin respuesta del cliente.",
				dueAt: new Date("2026-06-11T12:00:00Z"),
				status: "PENDING",
				origin: "AUTOMATIC",
				clientId: maria.id,
				eventId: emma.id,
			},
			{
				title: "Recordar anticipo al cliente",
				description: "El anticipo del Día familiar escolar vence pronto.",
				dueAt: new Date("2026-07-01T12:00:00Z"),
				status: "PENDING",
				origin: "AUTOMATIC",
				eventId: diaFamiliar.id,
			},
			{
				title: "Confirmar dirección exacta del evento",
				dueAt: new Date("2026-07-10T12:00:00Z"),
				status: "IN_PROGRESS",
				origin: "MANUAL",
				eventId: diaFamiliar.id,
			},
			{
				title: "Reactivar cliente sin contacto reciente",
				description: "Más de 3 meses sin contacto tras su último evento.",
				status: "PENDING",
				origin: "AUTOMATIC",
				clientId: carlos.id,
			},
		],
	});

	// Colaboradores (botargueros / animadores / logística).
	const luis = await prisma.collaborator.create({
		data: {
			firstName: "Luis",
			lastName: "Alvarado",
			...mapPhone(phone("+506 7010 5500")),
			role: "MASCOT_COSTUME",
			active: true,
			ratingAverage: 4.8,
		},
	});
	const paola = await prisma.collaborator.create({
		data: {
			firstName: "Paola",
			lastName: "Vargas",
			...mapPhone(phone("+506 8890 2112")),
			role: "ENTERTAINER",
			active: true,
			ratingAverage: 4.9,
		},
	});
	await prisma.collaborator.create({
		data: {
			firstName: "Mauricio",
			lastName: "Solano",
			...mapPhone(phone("+506 6222 8300")),
			role: "LOGISTICS",
			active: true,
		},
	});

	await prisma.collaboratorCharacter.createMany({
		data: [
			{ collaboratorId: luis.id, catalogItemId: superheroe.id },
			{ collaboratorId: paola.id, catalogItemId: princesa.id },
		],
	});

	// Asignaciones al evento confirmado, con rol por evento.
	await prisma.eventAssignment.createMany({
		data: [
			{
				eventId: diaFamiliar.id,
				collaboratorId: luis.id,
				roleInEvent: "MASCOT_COSTUME",
				notes: "Confirmar vestuario del personaje el jueves anterior.",
			},
			{
				eventId: diaFamiliar.id,
				collaboratorId: paola.id,
				roleInEvent: "ENTERTAINER",
			},
		],
	});

	console.log(
		"Seed completado: catálogo, servicios, paquetes, 4 clientes, 4 eventos, 3 interacciones, 2 cotizaciones, 1 reservación, 4 tareas, 3 colaboradores, 2 asignaciones.",
	);
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
