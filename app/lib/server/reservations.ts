import "server-only";
import { prisma } from "../db";
import { formatDocumentCode, SEQUENTIAL_START } from "../domain/numbering";
import { getSettings } from "./settings";

export type ReservationListRow = {
	id: string;
	eventId: string;
	eventName: string;
	clientName: string;
	eventDate: Date | null;
	startTime: string | null;
	paymentStatus: string;
	quoteNumber: string;
	reservationNumber: string;
	agreedTotal: number;
	advancePayment: number;
	balancePayment: number;
};

export async function listReservations(): Promise<ReservationListRow[]> {
	const reservations = await prisma.reservation.findMany({
		where: { deletedAt: null },
		orderBy: [{ depositDueDate: "asc" }, { createdAt: "desc" }],
		include: {
			quote: { select: { quoteNumber: true } },
			event: {
				select: {
					id: true,
					name: true,
					eventDate: true,
					startTime: true,
					client: { select: { firstName: true, lastName: true } },
				},
			},
		},
	});

	return reservations.map(reservation => ({
		id: reservation.id,
		eventId: reservation.event.id,
		eventName: reservation.event.name,
		clientName: reservation.event.client
			? `${reservation.event.client.firstName} ${reservation.event.client.lastName}`
			: "Sin cliente",
		eventDate: reservation.event.eventDate,
		startTime: reservation.event.startTime,
		paymentStatus: reservation.paymentStatus,
		quoteNumber: reservation.quote.quoteNumber,
		reservationNumber: reservation.reservationNumber,
		agreedTotal: Number(reservation.agreedTotal),
		advancePayment: Number(reservation.depositAmount),
		balancePayment: Number(reservation.balanceAmount),
	}));
}

async function nextReservationSequential(
	tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
	year: number,
): Promise<number> {
	const counter = await tx.documentCounter.upsert({
		where: { type_year: { type: "RESERVATION", year } },
		create: { type: "RESERVATION", year, lastValue: SEQUENTIAL_START },
		update: { lastValue: { increment: 1 } },
	});
	return counter.lastValue;
}

function subtractDays(date: Date, days: number): Date {
	const copy = new Date(date);
	copy.setUTCDate(copy.getUTCDate() - days);
	return copy;
}

export type ReservationMutationResult =
	| { ok: true; reservationId: string }
	| { ok: false; error: string };

export async function createReservationForQuote(
	quoteId: string,
): Promise<ReservationMutationResult> {
	const quote = await prisma.quote.findFirst({
		where: { id: quoteId, deletedAt: null },
		include: {
			event: { select: { id: true, eventDate: true } },
			options: { select: { id: true } },
			reservation: { select: { id: true } },
		},
	});

	if (!quote) return { ok: false, error: "La cotización no existe." };
	if (quote.reservation) {
		return { ok: true, reservationId: quote.reservation.id };
	}
	if (!quote.event?.eventDate) {
		return {
			ok: false,
			error: "La cotización necesita fecha de evento para reservar.",
		};
	}
	if (quote.options.length > 0 && !quote.selectedOptionId) {
		return {
			ok: false,
			error: "Marcá cuál opción eligió el cliente antes de reservar.",
		};
	}

	const eventDate = quote.event.eventDate;
	const settings = await getSettings();
	const total = Number(quote.total);
	const depositAmount = Math.round(
		(total * Number(settings.depositPercent)) / 100,
	);
	const balanceAmount = Math.max(total - depositAmount, 0);
	const depositDueDate = subtractDays(
		eventDate,
		settings.depositLeadTimeDays,
	);

	const created = await prisma.$transaction(async tx => {
		const sequential = await nextReservationSequential(
			tx,
			eventDate.getUTCFullYear(),
		);
		const reservationNumber = formatDocumentCode(
			"RESERVATION",
			eventDate,
			sequential,
		);
		const reservation = await tx.reservation.create({
			data: {
				eventId: quote.eventId,
				quoteId: quote.id,
				reservationNumber,
				agreedTotal: quote.total,
				depositAmount,
				depositDueDate,
				balanceAmount,
				balanceDueDate: eventDate,
				paymentStatus: "PENDING_DEPOSIT",
			},
			select: { id: true },
		});
		await tx.quote.update({
			where: { id: quote.id },
			data: { status: "ACCEPTED" },
		});
		await tx.event.update({
			where: { id: quote.eventId },
			data: { funnelStage: "RESERVED" },
		});
		return reservation;
	});

	return { ok: true, reservationId: created.id };
}

export async function confirmReservationDeposit(
	reservationId: string,
	method: string | null,
): Promise<ReservationMutationResult> {
	const reservation = await prisma.reservation.findFirst({
		where: { id: reservationId, deletedAt: null },
		select: {
			id: true,
			eventId: true,
			depositAmount: true,
			depositPaidAt: true,
		},
	});

	if (!reservation) return { ok: false, error: "La reservación no existe." };
	if (reservation.depositPaidAt) {
		return { ok: true, reservationId: reservation.id };
	}

	await prisma.$transaction(async tx => {
		const paidAt = new Date();
		await tx.reservation.update({
			where: { id: reservation.id },
			data: {
				depositPaidAt: paidAt,
				depositMethod: method || null,
				paymentStatus: "BALANCE_PENDING",
			},
		});
		await tx.payment.create({
			data: {
				reservationId: reservation.id,
				kind: "DEPOSIT",
				amount: reservation.depositAmount,
				paidAt,
				method: method || null,
			},
		});
		await tx.event.update({
			where: { id: reservation.eventId },
			data: { funnelStage: "CONFIRMED" },
		});
	});

	return { ok: true, reservationId: reservation.id };
}
