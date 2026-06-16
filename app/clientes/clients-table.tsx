"use client";

import { DeleteAction } from "../components/delete-action";
import { InitialsThumbnail } from "../components/entity-thumbnail";
import {
	DataTable,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import type { ClientListRow } from "../lib/server/clients";
import {
	CLIENT_TYPE_LABELS,
	FUNNEL_STAGE_LABELS,
} from "../lib/domain/labels";

export type ClientRow = ClientListRow;

function fullName(client: ClientRow) {
	return `${client.firstName} ${client.lastName}`;
}

function typeLabel(type: string) {
	return CLIENT_TYPE_LABELS[type as keyof typeof CLIENT_TYPE_LABELS] ?? type;
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "America/Costa_Rica",
	}).format(date);
}

const columns: DataTableColumn<ClientRow>[] = [
	{
		key: "name",
		header: "Cliente",
		sortValue: client => fullName(client).toLocaleLowerCase("es"),
		render: client => (
			<div className='flex items-center gap-3'>
				<InitialsThumbnail
					initials={`${client.firstName[0]}${client.lastName[0]}`}
				/>
				<div>
					<p className='font-black text-[var(--text-primary)]'>
						{fullName(client)}
					</p>
					<p className='mt-1 text-base'>{client.phoneFormatted}</p>
				</div>
			</div>
		),
	},
	{
		key: "type",
		header: "Tipo",
		filterValue: client => client.type,
		filterLabel: typeLabel,
		render: client => (
			<StatusBadge value={client.type} label={typeLabel(client.type)} />
		),
	},
	{
		key: "stage",
		header: "Estado",
		filterValue: client => (client.isRecurring ? "RECURRING" : client.stage),
		filterLabel: value =>
			value === "RECURRING"
				? "Recurrente"
				: FUNNEL_STAGE_LABELS[value as keyof typeof FUNNEL_STAGE_LABELS] ?? value,
		render: client => (
			<div className='flex flex-wrap items-center gap-1.5'>
				<StatusBadge
					value={client.stage}
					label={FUNNEL_STAGE_LABELS[client.stage]}
				/>
				{client.isRecurring ? (
					<StatusBadge value='RECURRING' label='Recurrente' />
				) : null}
			</div>
		),
	},
	{
		key: "lastContact",
		header: "Último contacto",
		sortValue: client => client.lastContactAt.getTime(),
		render: client => formatDate(client.lastContactAt),
	},
	{
		key: "events",
		header: "# Eventos",
		sortValue: client => client.eventsCount,
		render: client => (
			<span className='font-black text-[var(--text-primary)]'>
				{client.eventsCount}
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

export function ClientsTable({ rows }: { rows: ClientRow[] }) {
	return (
		<DataTable
			tableId='clientes'
			columns={columns}
			rows={rows}
			rowHref={client => `/clientes/${client.id}`}
			searchLabel='Buscar cliente'
			searchPlaceholder='Nombre, teléfono o tipo de cliente'
			searchText={client =>
				`${fullName(client)} ${client.phoneFormatted} ${typeLabel(client.type)}`
			}
			emptyTitle='Sin clientes todavía'
			emptyDescription='Creá el primer cliente para iniciar el embudo de ventas.'
		/>
	);
}
