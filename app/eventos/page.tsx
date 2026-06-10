import Link from "next/link";
import { DeleteAction } from "../components/delete-action";
import { IconLabel } from "../components/icon-label";
import { ListFilters } from "../components/list-filters";
import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
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
	{
		key: "action",
		header: "Acción",
		width: "minmax(130px, 0.75fr)",
		render: () => <DeleteAction />,
	},
];

export default function EventsPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Eventos" }]}
				title='Eventos'
				description='Seguimiento de eventos cotizados, reservados, confirmados y realizados.'
				actions={
					<Link
						href='/eventos/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo evento' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<ListFilters
						searchLabel='Buscar evento'
						searchPlaceholder='Nombre, cliente, lugar o fecha'
						selectLabel='Estado'
						selectOptions={[
							{ label: "Todos" },
							{ label: "Cotizado" },
							{ label: "Reservado" },
							{ label: "Confirmado" },
							{ label: "Realizado" },
						]}
					/>

					<ManagementTable
						columns={columns}
						rows={events}
						rowHref={event => `/eventos/${event.id}`}
					/>
				</SectionCard>
			</div>
		</>
	);
}
