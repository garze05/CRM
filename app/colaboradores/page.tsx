import Link from "next/link";
import { DeleteAction } from "../components/delete-action";
import { InitialsThumbnail } from "../components/entity-thumbnail";
import { IconLabel } from "../components/icon-label";
import { ListFilters } from "../components/list-filters";
import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";
import { collaborators, type Collaborator } from "../lib/mock-data";

function getCollaboratorInitials(collaborator: Collaborator) {
	return `${collaborator.firstName[0]}${collaborator.lastName[0]}`;
}

const columns: ManagementColumn<Collaborator>[] = [
	{
		key: "collaborator",
		header: "Colaborador",
		render: collaborator => (
			<div className='flex items-center gap-3'>
				<InitialsThumbnail initials={getCollaboratorInitials(collaborator)} />
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
		render: collaborator => <StatusBadge value={collaborator.role} />,
	},
	{
		key: "availability",
		header: "Disponibilidad",
		render: collaborator => <StatusBadge value={collaborator.availability} />,
	},
	{
		key: "rating",
		header: "Calificación",
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

export default function CollaboratorsPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Colaboradores" },
				]}
				title='Colaboradores'
				description='Personas disponibles para botargas, animación, logística y apoyo en eventos.'
				actions={
					<Link
						href='/colaboradores/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo colaborador' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<ListFilters
						searchLabel='Buscar colaborador'
						searchPlaceholder='Nombre, teléfono o rol'
						selectLabel='Disponibilidad'
						selectOptions={[
							{ label: "Todos" },
							{ label: "Disponible" },
							{ label: "Asignado" },
							{ label: "Inactivo" },
						]}
					/>

					<ManagementTable
						columns={columns}
						rows={collaborators}
						rowHref={collaborator => `/colaboradores/${collaborator.id}`}
					/>
				</SectionCard>
			</div>
		</>
	);
}
