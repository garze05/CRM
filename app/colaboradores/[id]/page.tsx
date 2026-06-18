import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../components/page-header";
import { PhoneInput } from "../../components/phone-input";
import { PhotoThumbnailControl } from "../../components/photo-thumbnail-control";
import { StarRating } from "../../components/star-rating";
import { StatusBadge } from "../../components/status-badge";
import { TaskPanel } from "../../components/task-panel";
import { getCollaboratorDetail } from "../../lib/server/collaborators";
import { listTasksForEntity } from "../../lib/server/tasks";
import { COLLABORATOR_ROLE_LABELS } from "../../lib/domain/labels";
import { formatDateKey } from "../../lib/format";
import { updateCollaboratorDetailAction } from "../../lib/actions/details";
import { TrashButton } from "../../components/trash-button";

function roleLabel(role: string | null) {
	if (!role) return "Sin rol";
	return COLLABORATOR_ROLE_LABELS[role] ?? role;
}

export default async function CollaboratorDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const collaborator = await getCollaboratorDetail(id);

	if (!collaborator) {
		notFound();
	}
	const collaboratorTasks = await listTasksForEntity({ collaboratorId: collaborator.id });

	const fullName = `${collaborator.firstName} ${collaborator.lastName}`;
	const initials = `${collaborator.firstName[0]}${collaborator.lastName[0]}`;
	const ratingAverage =
		collaborator.ratingAverage != null
			? Number(collaborator.ratingAverage)
			: null;

	const today = new Date().toISOString().slice(0, 10);
	const dated = collaborator.assignments.map(assignment => ({
		assignment,
		event: assignment.event,
		dateKey: assignment.event.eventDate
			? assignment.event.eventDate.toISOString().slice(0, 10)
			: "",
	}));
	const upcoming = dated.filter(d => d.dateKey >= today);
	const past = dated
		.filter(d => d.dateKey < today && d.dateKey !== "")
		.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
	const recentComments = dated.filter(d => d.assignment.notes);

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Colaboradores", href: "/colaboradores" },
					{ label: fullName },
				]}
				title={fullName}
				badges={
					<StatusBadge
						value={collaborator.active ? "ACTIVO" : "INACTIVO"}
						label={collaborator.active ? "Activo" : "Inactivo"}
					/>
				}
				actions={
					<TrashButton entityType='Collaborator' id={collaborator.id} returnTo='/colaboradores' />
				}
			/>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='min-w-0 space-y-5'>
					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-6'>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Datos del colaborador
							</h2>
							<p className='mt-1 text-lg text-[var(--text-secondary)]'>
								Perfil operativo para asignación a eventos y disponibilidad.
							</p>
						</div>
						<form action={updateCollaboratorDetailAction} className='grid gap-5 md:grid-cols-2'>
							<input type='hidden' name='id' value={collaborator.id} />
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Nombre</span>
								<input
									name='firstName'
									defaultValue={collaborator.firstName}
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Apellidos</span>
								<input
									name='lastName'
									defaultValue={collaborator.lastName}
									className='form-control'
								/>
							</label>
							<PhoneInput
								name='phone'
								label='Teléfono'
								defaultValue={collaborator.phone ?? undefined}
							/>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Rol base</span>
								<select name='role' defaultValue={collaborator.role} className='form-control'>
									<option value='MASCOT_COSTUME'>Botarga</option>
									<option value='ENTERTAINER'>Animador</option>
									<option value='LOGISTICS'>Logística</option>
									<option value='OTHER'>Otro</option>
								</select>
								<span className='block text-base font-semibold text-[var(--text-secondary)]'>
									Rol por defecto; cada evento puede asignarle un rol distinto.
								</span>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Estado</span>
								<select
									name='active'
									defaultValue={collaborator.active ? "ACTIVE" : "INACTIVE"}
									className='form-control'
								>
									<option value='ACTIVE'>Activo</option>
									<option value='INACTIVE'>Inactivo</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Notas</span>
								<textarea
									name='notes'
									defaultValue={collaborator.notes ?? ""}
									className='form-control min-h-28 resize-none py-3 leading-7'
								/>
							</label>
							<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition md:col-span-2'>
								Guardar cambios
							</button>
						</form>
					</section>

					<section className='surface-card min-w-0 p-5 md:p-7'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Próximos eventos asignados
						</h2>
						{upcoming.length === 0 ? (
							<p className='mt-4 rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin eventos asignados todavía.
							</p>
						) : (
							<ul className='mt-4 list-none space-y-3 p-0'>
								{upcoming.map(({ assignment, event }) => (
									<li key={assignment.id}>
										<Link
											href={`/eventos/${event.id}`}
											className='block rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 transition hover:border-[color:var(--accent-color)]'
										>
											<p className='text-lg font-black text-[var(--text-primary)]'>
												{event.name}
											</p>
											<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
												{formatDateKey(event.eventDate)} ·{" "}
												{roleLabel(assignment.roleInEvent)}
											</p>
											{assignment.notes ? (
												<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
													Nota: {assignment.notes}
												</p>
											) : null}
										</Link>
									</li>
								))}
							</ul>
						)}
					</section>

					<section className='surface-card min-w-0 p-5 md:p-7'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Eventos pasados y calificaciones
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							La calificación se registra por evento; el promedio se calcula solo
							con eventos calificados.
						</p>
						{past.length === 0 ? (
							<p className='mt-4 rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin eventos realizados todavía.
							</p>
						) : (
							<ul className='mt-4 list-none space-y-3 p-0'>
								{past.map(({ assignment, event }) => (
									<li
										key={assignment.id}
										className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4'
									>
										<div className='flex flex-wrap items-center justify-between gap-2'>
											<Link
												href={`/eventos/${event.id}`}
												className='text-lg font-black text-[var(--text-primary)] underline-offset-2 hover:underline'
											>
												{event.name}
											</Link>
											<StarRating value={assignment.rating} readOnly size='sm' />
										</div>
										<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
											{formatDateKey(event.eventDate)} ·{" "}
											{roleLabel(assignment.roleInEvent)}
										</p>
										{assignment.notes ? (
											<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
												“{assignment.notes}”
											</p>
										) : null}
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card p-5'>
						<div className='mb-5'>
							<PhotoThumbnailControl
								kind='collaborator'
								name={fullName}
								initials={initials}
							/>
						</div>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							{fullName}
						</h2>
						<p className='text-lg font-semibold text-[var(--text-secondary)]'>
							<StatusBadge
								value={collaborator.role}
								label={roleLabel(collaborator.role)}
							/>
						</p>
						<div className='mt-4 border-t border-[color:var(--border-color)] pt-4'>
							<p className='text-sm font-black uppercase text-[var(--text-muted)]'>
								Calificación promedio
							</p>
							<div className='mt-1'>
								{ratingAverage !== null ? (
									<StarRating value={ratingAverage} readOnly />
								) : (
									<span className='text-base font-semibold text-[var(--text-muted)]'>
										Sin calificación
									</span>
								)}
							</div>
						</div>
					</section>

					{recentComments.length > 0 ? (
						<section className='surface-card p-5'>
							<h2 className='text-xl font-black text-[var(--text-primary)]'>
								Últimos comentarios
							</h2>
							<ul className='mt-3 list-none space-y-3 p-0'>
								{recentComments.slice(0, 3).map(({ assignment, event }) => (
									<li
										key={assignment.id}
										className='border-l-4 border-[color:var(--border-color)] pl-3'
									>
										<p className='text-base font-semibold text-[var(--text-secondary)]'>
											“{assignment.notes}”
										</p>
										<p className='mt-1 text-sm font-bold uppercase text-[var(--text-muted)]'>
											{event.name}
										</p>
									</li>
								))}
							</ul>
						</section>
					) : null}

					<TaskPanel
						title='Tareas del colaborador'
						entityType='collaborator'
						entityId={collaborator.id}
						revalidatePath={`/colaboradores/${collaborator.id}`}
						tasks={collaboratorTasks}
					/>
				</aside>
			</div>
		</>
	);
}
