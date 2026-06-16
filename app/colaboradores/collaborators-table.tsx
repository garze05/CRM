"use client";

import { DeleteAction } from "../components/delete-action";
import { InitialsThumbnail } from "../components/entity-thumbnail";
import {
	DataTable,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { COLLABORATOR_ROLE_LABELS } from "../lib/domain/labels";
import type { CollaboratorListRow } from "../lib/server/collaborators";

function roleLabel(role: string) {
	return COLLABORATOR_ROLE_LABELS[role] ?? role;
}

const columns: DataTableColumn<CollaboratorListRow>[] = [
	{
		key: "collaborator",
		header: "Colaborador",
		sortValue: c => `${c.firstName} ${c.lastName}`.toLocaleLowerCase("es"),
		render: c => (
			<div className='flex items-center gap-3'>
				<InitialsThumbnail initials={`${c.firstName[0]}${c.lastName[0]}`} />
				<div>
					<p className='font-black text-[var(--text-primary)]'>
						{c.firstName} {c.lastName}
					</p>
					<p className='mt-1 text-base'>{c.phoneFormatted ?? "Sin teléfono"}</p>
				</div>
			</div>
		),
	},
	{
		key: "role",
		header: "Rol",
		filterValue: c => c.role,
		filterLabel: roleLabel,
		render: c => <StatusBadge value={c.role} label={roleLabel(c.role)} />,
	},
	{
		key: "status",
		header: "Estado",
		filterValue: c => (c.active ? "ACTIVO" : "INACTIVO"),
		filterLabel: value => (value === "ACTIVO" ? "Activo" : "Inactivo"),
		render: c => (
			<StatusBadge
				value={c.active ? "ACTIVO" : "INACTIVO"}
				label={c.active ? "Activo" : "Inactivo"}
			/>
		),
	},
	{
		key: "rating",
		header: "Calificación",
		sortValue: c => c.ratingAverage ?? -1,
		render: c =>
			c.ratingAverage === null ? (
				<span>Sin calificación</span>
			) : (
				<span className='font-black text-[var(--text-primary)]'>
					{c.ratingAverage.toFixed(1)} / 5
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

export function CollaboratorsTable({ rows }: { rows: CollaboratorListRow[] }) {
	return (
		<DataTable
			tableId='colaboradores'
			columns={columns}
			rows={rows}
			rowHref={c => `/colaboradores/${c.id}`}
			searchLabel='Buscar colaborador'
			searchPlaceholder='Nombre, teléfono o rol'
			searchText={c =>
				`${c.firstName} ${c.lastName} ${c.phoneFormatted ?? ""} ${roleLabel(c.role)}`
			}
			emptyTitle='Sin colaboradores todavía'
			emptyDescription='Registrá al equipo que ejecuta los eventos para poder asignarlo.'
		/>
	);
}
