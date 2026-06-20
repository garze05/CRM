import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../components/page-header";
import { StarRating } from "../../components/star-rating";
import { StatusBadge } from "../../components/status-badge";
import { TaskPanel } from "../../components/task-panel";
import { getEventDetail, listClientsForSelect } from "../../lib/server/events";
import { listCollaboratorsForSelect } from "../../lib/server/collaborators";
import { listTasksForEntity } from "../../lib/server/tasks";
import { formatCrc, formatDateKey } from "../../lib/format";
import {
	FUNNEL_STAGE_LABELS,
	PAYMENT_STATUS_LABELS,
	QUOTE_STATUS_LABELS,
} from "../../lib/domain/labels";
import { EventDetailForm } from "./event-detail-form";
import { AssignmentsPanel, type AssignmentRow } from "./assignments-panel";
import { TrashButton } from "../../components/trash-button";

export default async function EventDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const event = await getEventDetail(id);

	if (!event) {
		notFound();
	}

	const [eventTasks, clientOptions, collaboratorOptions] = await Promise.all([
		listTasksForEntity({ eventId: event.id }),
		listClientsForSelect(),
		listCollaboratorsForSelect(),
	]);
	const isCompleted = event.funnelStage === "COMPLETED";
	const paymentStatus = event.reservation?.paymentStatus ?? null;
	const total =
		event.reservation?.agreedTotal != null
			? Number(event.reservation.agreedTotal)
			: event.quotes[0]?.total != null
				? Number(event.quotes[0].total)
				: null;
	const characters = event.characters.map(c => c.catalogItem.name);
	const dateKey = event.eventDate
		? event.eventDate.toISOString().slice(0, 10)
		: "";

	const assignmentRows: AssignmentRow[] = event.assignments.map(a => ({
		id: a.id,
		collaboratorId: a.collaborator.id,
		collaboratorName: `${a.collaborator.firstName} ${a.collaborator.lastName}`,
		roleInEvent: a.roleInEvent,
		rating: a.rating,
	}));

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
						<StatusBadge
							value={event.funnelStage}
							label={FUNNEL_STAGE_LABELS[event.funnelStage]}
						/>
						{paymentStatus ? (
							<StatusBadge
								value={paymentStatus}
								label={PAYMENT_STATUS_LABELS[paymentStatus]}
							/>
						) : null}
					</div>
				}
				actions={
					<TrashButton entityType='Event' id={event.id} returnTo='/eventos' />
				}
			/>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-5'>
					<EventDetailForm
						event={{
							id: event.id,
							name: event.name,
							clientId: event.clientId,
							eventType: event.eventType,
							funnelStage: event.funnelStage,
							eventDate: dateKey,
							startTime: event.startTime ?? "",
							guestCount: event.guestCount,
							honoreeName: event.honoreeName ?? "",
							honoreeAge: event.honoreeAge,
							partyTheme: event.partyTheme ?? "",
							venueAddress: event.venueAddress ?? "",
							internalNotes: event.internalNotes ?? "",
						}}
						clientOptions={clientOptions}
					/>

					<AssignmentsPanel
						eventId={event.id}
						assignments={assignmentRows}
						collaboratorOptions={collaboratorOptions}
						isCompleted={isCompleted}
					/>

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
						{event.quotes.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin cotizaciones todavía. Solo puede haber una cotización
								enviada activa; las demás quedan en historial.
							</p>
						) : (
							<ul className='list-none space-y-3 p-0'>
								{event.quotes.map(quote => (
									<li key={quote.id}>
										<Link
											href={`/cotizaciones/${quote.id}`}
											className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 transition hover:border-[color:var(--accent-color)]'
										>
											<div>
												<p className='text-lg font-black text-[var(--text-primary)]'>
													{quote.quoteNumber}
												</p>
												<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
													Vigente hasta {formatDateKey(quote.validUntil)}
												</p>
											</div>
											<div className='flex items-center gap-3'>
												<StatusBadge
													value={quote.status}
													label={QUOTE_STATUS_LABELS[quote.status]}
												/>
												<span className='text-lg font-black text-[var(--text-primary)]'>
													{formatCrc(Number(quote.total))}
												</span>
											</div>
										</Link>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Resumen
						</h2>
						<dl className='mt-5 space-y-4 text-lg'>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Fecha
								</dt>
								<dd className='mt-1 font-black text-[var(--text-primary)]'>
									{formatDateKey(dateKey || null)}
									{event.startTime ? ` · ${event.startTime}` : ""}
								</dd>
							</div>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Personajes y servicios
								</dt>
								<dd className='mt-1 font-black text-[var(--text-primary)]'>
									{characters.length > 0
										? characters.join(", ")
										: "Por definir"}
								</dd>
							</div>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>Pago</dt>
								<dd className='mt-2'>
									{paymentStatus ? (
										<StatusBadge
											value={paymentStatus}
											label={PAYMENT_STATUS_LABELS[paymentStatus]}
										/>
									) : (
										<span className='text-base font-semibold text-[var(--text-muted)]'>
											Sin reservación
										</span>
									)}
								</dd>
							</div>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Total
								</dt>
								<dd className='mt-1 font-black text-[var(--text-primary)]'>
									{total !== null ? formatCrc(total) : "Por cotizar"}
								</dd>
							</div>
						</dl>
					</section>

					<TaskPanel
						title='Tareas del evento'
						entityType='event'
						entityId={event.id}
						revalidatePath={`/eventos/${event.id}`}
						tasks={eventTasks}
					/>

					<section className='surface-card p-5'>
						<h2 className='text-xl font-black text-[var(--text-primary)]'>
							Calificación del evento
						</h2>
						{isCompleted ? (
							<div className='mt-3'>
								<StarRating
									value={event.rating}
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
