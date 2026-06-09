import { CrmShell } from "../components/crm-shell";
import { ManagementTable, type ManagementColumn } from "../components/management-table";
import { StatusBadge } from "../components/status-badge";
import {
	events,
	formatCrc,
	formatDate,
	getEventClient,
	type EventRecord,
} from "../lib/mock-data";

const columns: ManagementColumn<EventRecord>[] = [
	{
		key: "event",
		header: "Evento",
		render: event => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>{event.name}</p>
				<p className='mt-1 text-base'>{event.venueName}</p>
			</div>
		),
	},
	{
		key: "client",
		header: "Cliente",
		render: event => {
			const client = getEventClient(event);

			return client ? `${client.firstName} ${client.lastName}` : "Sin cliente";
		},
	},
	{
		key: "date",
		header: "Fecha",
		render: event => (
			<div>
				<p>{formatDate(event.date)}</p>
				<p className='mt-1 text-base'>{event.startTime}</p>
			</div>
		),
	},
	{
		key: "type",
		header: "Tipo",
		render: event => <StatusBadge value={event.type} />,
	},
	{
		key: "status",
		header: "Estado",
		render: event => <StatusBadge value={event.pipelineStatus} />,
	},
	{
		key: "payment",
		header: "Pago",
		render: event => <StatusBadge value={event.paymentStatus} />,
	},
	{
		key: "total",
		header: "Total",
		render: event => (
			<span className='font-black text-[var(--text-primary)]'>
				{formatCrc(event.estimatedTotal)}
			</span>
		),
	},
];

export default function EventsPage() {
	return (
		<CrmShell>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<p className='page-kicker mb-2'>
							Gestión
						</p>
						<h1 className='page-heading'>
							Eventos
						</h1>
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							Seguimiento de eventos cotizados, reservados, confirmados y
							realizados.
						</p>
					</div>
					<button
						type='button'
						className='primary-action min-h-12 w-fit rounded-full px-5 py-3 text-base font-black transition'
					>
						Nuevo evento
					</button>
				</div>
			</header>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<section className='surface-card p-5 md:p-7'>
					<div className='mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Buscar evento</span>
							<input
								placeholder='Nombre, cliente, lugar o fecha'
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Estado</span>
							<select className='form-control'>
								<option>Todos</option>
								<option>Cotizado</option>
								<option>Reservado</option>
								<option>Confirmado</option>
								<option>Realizado</option>
							</select>
						</label>
					</div>

					<ManagementTable columns={columns} rows={events} />
				</section>
			</div>
		</CrmShell>
	);
}
