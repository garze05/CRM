"use client";

import { DeleteAction } from "../components/delete-action";
import { InitialsThumbnail } from "../components/entity-thumbnail";
import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import type { Collaborator } from "../lib/mock-data";

const columns: DataTableColumn<Collaborator>[] = [
	{
		key: "collaborator",
		header: "Colaborador",
		sortValue: collaborator =>
			`${collaborator.firstName} ${collaborator.lastName}`.toLocaleLowerCase(
				"es",
			),
		render: collaborator => (
			<div className='flex items-center gap-3'>
				<InitialsThumbnail
					initials={`${collaborator.firstName[0]}${collaborator.lastName[0]}`}
				/>
				<div>
					<p className='font-black text-[var(--text-primary)]'>
						{collaborator.firstName} {collaborator.lastName}
					</p>
					<p className='mt-1 text-base'>{collaborator.phone}</p>
				</div>
			</div>
		),
	},
	{
		key: "role",
		header: "Rol",
		filterValue: collaborator => collaborator.role,
		filterLabel: formatEnumLabel,
		render: collaborator => <StatusBadge value={collaborator.role} />,
	},
	{
		key: "availability",
		header: "Disponibilidad",
		filterValue: collaborator => collaborator.availability,
		filterLabel: formatEnumLabel,
		render: collaborator => <StatusBadge value={collaborator.availability} />,
	},
	{
		key: "rating",
		header: "Calificación",
		sortValue: collaborator => collaborator.ratingAverage ?? -1,
		render: collaborator =>
			collaborator.ratingAverage === null ? (
				<span>Sin calificación</span>
			) : (
				<span className='font-black text-[var(--text-primary)]'>
					{collaborator.ratingAverage.toFixed(1)} / 5
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

export function CollaboratorsTable({ rows }: { rows: Collaborator[] }) {
	return (
		<DataTable
			tableId='colaboradores'
			columns={columns}
			rows={rows}
			rowHref={collaborator => `/colaboradores/${collaborator.id}`}
			searchLabel='Buscar colaborador'
			searchPlaceholder='Nombre, teléfono o rol'
			searchText={collaborator =>
				`${collaborator.firstName} ${collaborator.lastName} ${collaborator.phone} ${formatEnumLabel(collaborator.role)}`
			}
			emptyTitle='Sin colaboradores todavía'
			emptyDescription='Registrá al equipo que ejecuta los eventos para poder asignarlo.'
		/>
	);
}
