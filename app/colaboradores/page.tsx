import { Breadcrumb } from "../components/breadcrumb";
import { DeleteAction } from "../components/delete-action";
import { InitialsThumbnail } from "../components/entity-thumbnail";
import { IconLabel } from "../components/icon-label";
import { ManagementTable, type ManagementColumn } from "../components/management-table";
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
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Colaboradores" },
							]}
						/>
						<h1 className='page-heading'>
							Colaboradores
						</h1>
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							Personas disponibles para botargas, animación, logística y apoyo en
							eventos.
						</p>
					</div>
					<button
						type='button'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo colaborador' />
					</button>
				</div>
			</header>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<section className='surface-card p-5 md:p-7'>
					<div className='mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Buscar colaborador</span>
							<input
								placeholder='Nombre, teléfono o rol'
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Disponibilidad</span>
							<select className='form-control'>
								<option>Todos</option>
								<option>Disponible</option>
								<option>Asignado</option>
								<option>Inactivo</option>
							</select>
						</label>
					</div>

					<ManagementTable
						columns={columns}
						rows={collaborators}
						rowHref={collaborator => `/colaboradores/${collaborator.id}`}
					/>
				</section>
			</div>
		</>
	);
}
