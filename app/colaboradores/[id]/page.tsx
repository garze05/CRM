import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/breadcrumb";
import { PhoneInput } from "../../components/phone-input";
import { PhotoThumbnailControl } from "../../components/photo-thumbnail-control";
import { StatusBadge } from "../../components/status-badge";
import { getCollaboratorById } from "../../lib/mock-data";

export default async function CollaboratorDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const collaborator = getCollaboratorById(id);

	if (!collaborator) {
		notFound();
	}

	const fullName = `${collaborator.firstName} ${collaborator.lastName}`;
	const initials = `${collaborator.firstName[0]}${collaborator.lastName[0]}`;

	return (
		<>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Colaboradores", href: "/colaboradores" },
								{ label: fullName },
							]}
						/>
						<div className='flex flex-wrap items-center gap-3'>
							<h1 className='page-heading'>{fullName}</h1>
							<StatusBadge value={collaborator.availability} />
						</div>
					</div>
					<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition'>
						Guardar cambios
					</button>
				</div>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<section className='surface-card min-w-0 p-5 md:p-7'>
					<div className='mb-6'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Datos del colaborador
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							Perfil operativo para asignación a eventos y disponibilidad.
						</p>
					</div>
					<form className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Nombre</span>
							<input defaultValue={collaborator.firstName} className='form-control' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Apellidos</span>
							<input defaultValue={collaborator.lastName} className='form-control' />
						</label>
						<PhoneInput
							name='phone'
							label='Teléfono'
							defaultValue={collaborator.phone}
						/>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Rol</span>
							<select defaultValue={collaborator.role} className='form-control'>
								<option value='BOTARGA'>Botarga</option>
								<option value='ANIMADOR'>Animador</option>
								<option value='LOGISTICA'>Logística</option>
								<option value='OTRO'>Otro</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Disponibilidad</span>
							<select
								defaultValue={collaborator.availability}
								className='form-control'
							>
								<option value='DISPONIBLE'>Disponible</option>
								<option value='ASIGNADO'>Asignado</option>
								<option value='INACTIVO'>Inactivo</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Calificación promedio</span>
							<input
								defaultValue={
									collaborator.ratingAverage === null
										? "Sin calificación"
										: collaborator.ratingAverage.toFixed(1)
								}
								className='form-control'
							/>
						</label>
					</form>
				</section>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card p-5'>
						<div className='mb-5'>
							<PhotoThumbnailControl
								kind='collaborator'
								name={fullName}
								initials={initials}
							/>
						</div>
						<div className='mb-5'>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									{fullName}
								</h2>
								<p className='text-lg font-semibold text-[var(--text-secondary)]'>
									{collaborator.role.toLowerCase()}
								</p>
							</div>
						</div>
						<StatusBadge value={collaborator.availability} />
					</section>
				</aside>
			</div>
		</>
	);
}
