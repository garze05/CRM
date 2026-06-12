import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../components/page-header";
import { StarRating } from "../../components/star-rating";
import { StatusBadge } from "../../components/status-badge";
import { TaskList } from "../../components/task-list";
import {
	collaborators,
	formatCrc,
	formatDate,
	getEventAssignments,
	getEventById,
	getEventClient,
	getEventTasks,
	quotes,
} from "../../lib/mock-data";

export default async function EventDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const event = getEventById(id);

	if (!event) {
		notFound();
	}

	const client = getEventClient(event);
	const isCompleted = event.pipelineStatus === "REALIZADO";
	const assignments = getEventAssignments(event.id).map(assignment => ({
		assignment,
		collaborator: collaborators.find(
			person => person.id === assignment.collaboratorId,
		),
	}));
	const eventQuotes = quotes.filter(quote => quote.eventId === event.id);
	const eventTasks = getEventTasks(event.id);

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Eventos", href: "/eventos" },
					{ label: event.name },
				]}
				title={event.name}
				badges={
					<div className='flex flex-wrap gap-2'>
						<StatusBadge value={event.pipelineStatus} />
						<StatusBadge value={event.paymentStatus} />
					</div>
				}
				actions={
					<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition'>
						Guardar cambios
					</button>
				}
			/>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='min-w-0 space-y-5'>
					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-6'>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Datos del evento
							</h2>
							<p className='mt-1 text-lg text-[var(--text-secondary)]'>
								Información operativa y comercial vinculada al cliente.
							</p>
						</div>
						<form className='grid gap-5 md:grid-cols-2'>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Nombre del evento</span>
								<input defaultValue={event.name} className='form-control' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Cliente</span>
								<input
									defaultValue={
										client ? `${client.firstName} ${client.lastName}` : "Sin cliente"
									}
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Tipo</span>
								<select defaultValue={event.type} className='form-control'>
									<option value='INFANTIL'>Infantil</option>
									<option value='CORPORATIVO'>Corporativo</option>
									<option value='INSTITUCIONAL'>Institucional</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Estado del embudo</span>
								<select defaultValue={event.pipelineStatus} className='form-control'>
									<option value='COTIZADO'>Cotizado</option>
									<option value='RESERVADO'>Reservado</option>
									<option value='CONFIRMADO'>Confirmado</option>
									<option value='REALIZADO'>Realizado</option>
									<option value='CANCELADO'>Cancelado</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Fecha</span>
								<input type='date' defaultValue={event.date} className='form-control' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Hora inicio</span>
								<input
									type='time'
									defaultValue={event.startTime}
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Lugar</span>
								<input defaultValue={event.venueName} className='form-control' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Invitados</span>
								<input
									type='number'
									defaultValue={event.guestCount}
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Dirección</span>
								<input defaultValue={event.venueAddress} className='form-control' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Notas internas</span>
								<textarea
									className='form-control min-h-28 resize-none py-3 leading-7'
									placeholder='Detalles del lugar, trato del cliente, logística y aprendizajes para futuros eventos.'
								/>
							</label>
						</form>
					</section>

					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Colaboradores asignados
							</h2>
							<button className='secondary-action flex min-h-12 w-fit items-center rounded-full px-4 py-3 text-base font-black transition'>
								Asignar colaborador
							</button>
						</div>
						{assignments.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin colaboradores asignados todavía. El sistema validará
								conflictos de fecha y hora al asignar.
							</p>
						) : (
							<ul className='list-none space-y-3 p-0'>
								{assignments.map(({ assignment, collaborator }) => (
									<li
										key={assignment.id}
										className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4'
									>
										<div className='flex flex-wrap items-center justify-between gap-2'>
											{collaborator ? (
												<Link
													href={`/colaboradores/${collaborator.id}`}
													className='text-lg font-black text-[var(--text-primary)] underline-offset-2 hover:underline'
												>
													{collaborator.firstName} {collaborator.lastName}
												</Link>
											) : (
												<span className='text-lg font-black text-[var(--text-muted)]'>
													Colaborador eliminado
												</span>
											)}
											<StarRating
												value={assignment.rating}
												readOnly={!isCompleted}
												label='Calificación del colaborador'
												size='sm'
											/>
										</div>
										<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
											{assignment.roleInEvent}
										</p>
										{assignment.note ? (
											<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
												Nota: {assignment.note}
											</p>
										) : null}
									</li>
								))}
							</ul>
						)}
					</section>

					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Cotizaciones del evento
							</h2>
							<Link
								href={`/cotizaciones/nueva?evento=${event.id}`}
								className='secondary-action flex min-h-12 w-fit items-center rounded-full px-4 py-3 text-base font-black transition'
							>
								Nueva cotización
							</Link>
						</div>
						{eventQuotes.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin cotizaciones todavía. Solo puede haber una cotización
								enviada activa; las demás quedan en historial.
							</p>
						) : (
							<ul className='list-none space-y-3 p-0'>
								{eventQuotes.map(quote => (
									<li key={quote.id}>
										<Link
											href={`/cotizaciones/${quote.id}`}
											className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 transition hover:border-[color:var(--accent-color)]'
										>
											<div>
												<p className='text-lg font-black text-[var(--text-primary)]'>
													{quote.number}
												</p>
												<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
													Vigente hasta {formatDate(quote.validUntil)}
												</p>
											</div>
											<div className='flex items-center gap-3'>
												<StatusBadge value={quote.status} />
												<span className='text-lg font-black text-[var(--text-primary)]'>
													{formatCrc(quote.total)}
												</span>
											</div>
										</Link>
									</li>
								))}
							</ul>
						)}
					</section>

					{eventTasks.length > 0 ? (
						<section className='surface-card min-w-0 p-5 md:p-7'>
							<h2 className='mb-4 text-2xl font-black text-[var(--text-primary)]'>
								Tareas del evento
							</h2>
							<TaskList tasks={eventTasks} />
						</section>
					) : null}
				</div>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Resumen
						</h2>
						<dl className='mt-5 space-y-4 text-lg'>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>Fecha</dt>
								<dd className='mt-1 font-black text-[var(--text-primary)]'>
									{formatDate(event.date)} · {event.startTime}
								</dd>
							</div>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Personajes y servicios
								</dt>
								<dd className='mt-1 font-black text-[var(--text-primary)]'>
									{event.characters.length > 0
										? event.characters.join(", ")
										: "Por definir"}
								</dd>
							</div>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>Pago</dt>
								<dd className='mt-2'>
									<StatusBadge value={event.paymentStatus} />
								</dd>
							</div>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>Total</dt>
								<dd className='mt-1 font-black text-[var(--text-primary)]'>
									{formatCrc(event.estimatedTotal)}
								</dd>
							</div>
						</dl>
					</section>

					<section className='surface-card p-5'>
						<h2 className='text-xl font-black text-[var(--text-primary)]'>
							Calificación del evento
						</h2>
						{isCompleted ? (
							<div className='mt-3'>
								<StarRating
									value={null}
									label='Calificación del evento'
									name='eventRating'
								/>
							</div>
						) : (
							<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
								Disponible al marcar el evento como realizado.
							</p>
						)}
					</section>
				</aside>
			</div>
		</>
	);
}
