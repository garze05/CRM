"use client";

import { DeleteAction } from "../components/delete-action";
import {
	DataTable,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatCrc, formatDateKey } from "../lib/format";
import {
	EVENT_TYPE_LABELS,
	FUNNEL_STAGE_LABELS,
	PAYMENT_STATUS_LABELS,
} from "../lib/domain/labels";
import type { EventListItem } from "../lib/server/events";

export type EventRow = EventListItem;

function eventTypeLabel(type: string) {
	return EVENT_TYPE_LABELS[type] ?? type;
}

function stageLabel(stage: string) {
	return FUNNEL_STAGE_LABELS[stage as keyof typeof FUNNEL_STAGE_LABELS] ?? stage;
}

const columns: DataTableColumn<EventRow>[] = [
	{
		key: "event",
		header: "Evento",
		sortValue: event => event.name.toLocaleLowerCase("es"),
		render: event => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>{event.name}</p>
				<p className='mt-1 text-base'>
					{event.venueAddress || "Dirección por definir"}
				</p>
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
				<p>{formatDateKey(event.date || null)}</p>
				{event.startTime ? (
					<p className='mt-1 text-base'>{event.startTime}</p>
				) : null}
			</div>
		),
	},
	{
		key: "type",
		header: "Tipo",
		filterValue: event => event.type,
		filterLabel: eventTypeLabel,
		render: event => (
			<StatusBadge value={event.type} label={eventTypeLabel(event.type)} />
		),
	},
	{
		key: "status",
		header: "Estado",
		filterValue: event => event.pipelineStatus,
		filterLabel: stageLabel,
		render: event => (
			<StatusBadge
				value={event.pipelineStatus}
				label={stageLabel(event.pipelineStatus)}
			/>
		),
	},
	{
		key: "payment",
		header: "Pago",
		filterValue: event => event.paymentStatus ?? "—",
		filterLabel: value =>
			value === "—" ? "Sin reservación" : PAYMENT_STATUS_LABELS[value] ?? value,
		render: event =>
			event.paymentStatus ? (
				<StatusBadge
					value={event.paymentStatus}
					label={PAYMENT_STATUS_LABELS[event.paymentStatus]}
				/>
			) : (
				<span className='text-base text-[var(--text-muted)]'>—</span>
			),
	},
	{
		key: "total",
		header: "Total",
		sortValue: event => event.estimatedTotal ?? -1,
		render: event => (
			<span className='font-black text-[var(--text-primary)]'>
				{event.estimatedTotal !== null ? formatCrc(event.estimatedTotal) : "—"}
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
	/** Etapa preseleccionada desde query param (?etapa=QUOTED). */
	initialStage?: string;
}) {
	return (
		<DataTable
			tableId='eventos'
			columns={columns}
			rows={rows}
			rowHref={event => `/eventos/${event.id}`}
			searchLabel='Buscar evento'
			searchPlaceholder='Cliente, teléfono, personaje o servicio'
			searchText={event =>
				[
					event.name,
					event.clientName,
					event.clientPhone,
					event.venueAddress,
					stageLabel(event.pipelineStatus),
					eventTypeLabel(event.type),
					...event.characters,
					...event.serviceTags,
				].join(" ")
			}
			emptyTitle='Sin eventos todavía'
			emptyDescription='Creá un evento desde un cliente para empezar a cotizar.'
			initialFilters={initialStage ? { status: [initialStage] } : undefined}
		/>
	);
}
