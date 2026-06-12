"use client";

import { DeleteAction } from "../components/delete-action";
import { InitialsThumbnail } from "../components/entity-thumbnail";
import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatDate, getClientFullName, type Client } from "../lib/mock-data";

export type ClientRow = Client & { eventsCount: number };

const columns: DataTableColumn<ClientRow>[] = [
	{
		key: "name",
		header: "Cliente",
		sortValue: client => getClientFullName(client).toLocaleLowerCase("es"),
		render: client => (
			<div className='flex items-center gap-3'>
				<InitialsThumbnail
					initials={`${client.firstName[0]}${client.lastName[0]}`}
				/>
				<div>
					<p className='font-black text-[var(--text-primary)]'>
						{getClientFullName(client)}
					</p>
					<p className='mt-1 text-base'>{client.phone}</p>
				</div>
			</div>
		),
	},
	{
		key: "type",
		header: "Tipo",
		filterValue: client => client.type,
		filterLabel: formatEnumLabel,
		render: client => <StatusBadge value={client.type} />,
	},
	{
		key: "status",
		header: "Estado",
		filterValue: client => client.pipelineStatus,
		filterLabel: formatEnumLabel,
		render: client => <StatusBadge value={client.pipelineStatus} />,
	},
	{
		key: "lastContact",
		header: "Último contacto",
		sortValue: client => client.lastContactDate,
		render: client => formatDate(client.lastContactDate),
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
				`${getClientFullName(client)} ${client.phone} ${formatEnumLabel(client.type)}`
			}
			emptyTitle='Sin clientes todavía'
			emptyDescription='Creá el primer cliente para iniciar el embudo de ventas.'
		/>
	);
}
