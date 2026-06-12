import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import {
	ReservationsTable,
	type ReservationRow,
} from "./reservations-table";
import {
	events,
	formatCrc,
	getEventClient,
	getMockDocumentCode,
	quotes,
} from "../lib/mock-data";

const reservedEvents = events.filter(event =>
	["RESERVADO", "CONFIRMADO", "REALIZADO"].includes(event.pipelineStatus),
);

const rows: ReservationRow[] = reservedEvents.map((event, index) => {
	const quote = quotes.find(item => item.eventId === event.id);
	const client = getEventClient(event);
	const half = Math.round(event.estimatedTotal / 2);

	return {
		...event,
		clientName: client
			? `${client.firstName} ${client.lastName}`
			: "Sin cliente",
		quoteNumber: quote?.number ?? getMockDocumentCode("C", event.date, 100 + index),
		reservationNumber: getMockDocumentCode("R", event.date, 100 + index),
		advancePayment: half,
		balancePayment: event.estimatedTotal - half,
	};
});

export default function ReservationsPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Reservaciones" },
				]}
				title='Reservaciones'
				description='Control de anticipos, saldos y eventos comercialmente aceptados.'
				actions={
					<Link
						href='/cotizaciones'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel
							icon='material-symbols:request-quote-rounded'
							label='Ver cotizaciones'
						/>
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard
					title='Pagos por confirmar'
					description='El anticipo confirma el evento y el saldo cierra el cobro operativo.'
				>
					<div className='mb-5 grid gap-4 md:grid-cols-3'>
						<div className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-4'>
							<p className='text-base font-black text-[var(--text-muted)]'>
								Pendientes de anticipo
							</p>
							<p className='mt-2 text-3xl font-black text-[var(--primary-color)]'>
								1
							</p>
						</div>
						<div className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-4'>
							<p className='text-base font-black text-[var(--text-muted)]'>
								Anticipos recibidos
							</p>
							<p className='mt-2 text-3xl font-black text-[var(--secondary-color)]'>
								1
							</p>
						</div>
						<div className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-4'>
							<p className='text-base font-black text-[var(--text-muted)]'>
								Total reservado
							</p>
							<p className='mt-2 text-3xl font-black text-[var(--text-primary)]'>
								{formatCrc(
									rows.reduce((total, row) => total + row.estimatedTotal, 0),
								)}
							</p>
						</div>
					</div>

					<ReservationsTable rows={rows} />
				</SectionCard>
			</div>
		</>
	);
}
