import "server-only";
import { prisma } from "../db";

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
