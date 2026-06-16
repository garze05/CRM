import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import {
	ReservationsTable,
	type ReservationRow,
} from "./reservations-table";
import { formatCrc } from "../lib/format";
import { listReservations } from "../lib/server/reservations";

export default async function ReservationsPage() {
	const rows: ReservationRow[] = await listReservations();
	const pendingDeposit = rows.filter(
		row => row.paymentStatus === "PENDING_DEPOSIT",
	).length;
	const depositsReceived = rows.filter(
		row => row.paymentStatus !== "PENDING_DEPOSIT",
	).length;

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Reservaciones" },
				]}
				title='Reservaciones'
				description='Anticipos, saldos y eventos aceptados.'
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
								{pendingDeposit}
							</p>
						</div>
						<div className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-4'>
							<p className='text-base font-black text-[var(--text-muted)]'>
								Anticipos recibidos
							</p>
							<p className='mt-2 text-3xl font-black text-[var(--secondary-color)]'>
								{depositsReceived}
							</p>
						</div>
						<div className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-4'>
							<p className='text-base font-black text-[var(--text-muted)]'>
								Total reservado
							</p>
							<p className='mt-2 text-3xl font-black text-[var(--text-primary)]'>
								{formatCrc(
									rows.reduce((total, row) => total + row.agreedTotal, 0),
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
