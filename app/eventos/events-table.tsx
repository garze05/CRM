"use client";

import { DeleteAction } from "../components/delete-action";
import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatCrc, formatDate, type EventRecord } from "../lib/mock-data";

export type EventRow = EventRecord & {
	clientName: string;
	clientPhone: string;
};

const columns: DataTableColumn<EventRow>[] = [
	{
		key: "event",
		header: "Evento",
		sortValue: event => event.name.toLocaleLowerCase("es"),
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
		sortValue: event => event.clientName.toLocaleLowerCase("es"),
		render: event => event.clientName,
	},
	{
		key: "date",
		header: "Fecha",
		sortValue: event => `${event.date} ${event.startTime}`,
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
		filterValue: event => event.type,
		filterLabel: formatEnumLabel,
		render: event => <StatusBadge value={event.type} />,
	},
	{
		key: "status",
		header: "Estado",
		filterValue: event => event.pipelineStatus,
		filterLabel: formatEnumLabel,
		render: event => <StatusBadge value={event.pipelineStatus} />,
	},
	{
		key: "payment",
		header: "Pago",
		filterValue: event => event.paymentStatus,
		filterLabel: formatEnumLabel,
		render: event => <StatusBadge value={event.paymentStatus} />,
	},
	{
		key: "total",
		header: "Total",
		sortValue: event => event.estimatedTotal,
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

export function EventsTable({
	rows,
	initialStage,
}: {
	rows: EventRow[];
	/** Etapa preseleccionada desde query param (?etapa=COTIZADO). */
	initialStage?: string;
}) {
	return (
		<DataTable
			tableId='eventos'
			columns={columns}
			rows={rows}
			rowHref={event => `/eventos/${event.id}`}
			searchLabel='Buscar evento'
			searchPlaceholder='Cliente, teléfono, lugar o estado'
			searchText={event =>
				[
					event.name,
					event.clientName,
					event.clientPhone,
					event.venueName,
					event.venueAddress,
					formatEnumLabel(event.pipelineStatus),
					formatEnumLabel(event.type),
				].join(" ")
			}
			emptyTitle='Sin eventos todavía'
			emptyDescription='Creá un evento desde un cliente para empezar a cotizar.'
			initialFilters={initialStage ? { status: [initialStage] } : undefined}
		/>
	);
}
