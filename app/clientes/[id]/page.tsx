import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../components/page-header";
import { PhoneInput } from "../../components/phone-input";
import { PhotoThumbnailControl } from "../../components/photo-thumbnail-control";
import { StatusBadge } from "../../components/status-badge";
import { TaskPanel } from "../../components/task-panel";
import { updateClientDetailAction } from "../../lib/actions/details";
import { TrashButton } from "../../components/trash-button";
import { ClientTypeFields } from "../client-type-fields";
import { getClientDetail } from "../../lib/server/clients";
import { listTasksForEntity } from "../../lib/server/tasks";
import {
	CLIENT_TYPE_LABELS,
	EVENT_TYPE_LABELS,
	FUNNEL_STAGE_LABELS,
	INTERACTION_CHANNEL_LABELS,
	INTERACTION_DIRECTION_LABELS,
} from "../../lib/domain/labels";

// Fechas date-only (@db.Date) se guardan a medianoche UTC; formatearlas en zona
// CR las retrocede un día. Para date-only usamos UTC; para timestamps, CR local.
function formatEventDate(date: Date | null) {
	if (!date) return "Sin fecha";
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function formatContactDate(date: Date) {
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "America/Costa_Rica",
	}).format(date);
}

export default async function ClientDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const client = await getClientDetail(id);

	if (!client) {
		notFound();
	}

	const clientTasks = await listTasksForEntity({ clientId: client.id });
	const fullName = `${client.firstName} ${client.lastName}`;
	const initials = `${client.firstName[0]}${client.lastName[0]}`;
	const typeLabel = CLIENT_TYPE_LABELS[client.type] ?? client.type;
	const completedEvents = client.events.filter(
		event => event.funnelStage === "COMPLETED",
	).length;
	const activeEvent = client.events.find(event =>
		["PROSPECT", "CONTACTED", "QUOTED", "RESERVED", "CONFIRMED"].includes(
			event.funnelStage,
		),
	);

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Clientes", href: "/clientes" },
					{ label: fullName },
				]}
				title={fullName}
				badges={
					<div className='flex flex-wrap items-center gap-1.5'>
						{activeEvent ? (
							<StatusBadge
								value={activeEvent.funnelStage}
								label={`Oportunidad: ${FUNNEL_STAGE_LABELS[activeEvent.funnelStage]}`}
							/>
						) : null}
						{client.isRecurring ? (
							<StatusBadge value='RECURRING' label='Recurrente' />
						) : null}
					</div>
				}
				actions={
					<div className='grid grid-cols-2 gap-3 sm:flex'>
						<TrashButton
							entityType='Client'
							id={client.id}
							returnTo='/clientes'
						/>
						<Link
							href={`/eventos/nuevo?cliente=${client.id}`}
							className='primary-action flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-base font-black transition'
						>
							Crear evento
						</Link>
					</div>
				}
			/>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-5'>
					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									Datos del cliente
								</h2>
								<p className='mt-1 text-lg text-[var(--text-secondary)]'>
									Contacto principal. Su tipo comercial define precios por
									defecto; el embudo se controla en cada evento.
								</p>
							</div>
							<StatusBadge value={client.type} label={typeLabel} />
						</div>

						<form
							action={updateClientDetailAction}
							className='grid gap-5 md:grid-cols-2'
						>
							<input type='hidden' name='id' value={client.id} />
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Nombre</span>
								<input
									name='firstName'
									defaultValue={client.firstName}
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Apellidos</span>
								<input
									name='lastName'
									defaultValue={client.lastName}
									className='form-control'
								/>
							</label>
							<PhoneInput
								name='phone'
								label='Teléfono'
								defaultValue={client.phone}
							/>
							<div className='contents'>
								<ClientTypeFields
									defaultType={client.type}
									companyName={client.companyName}
									companyPhone={client.companyPhone}
									typeHint='Se usa para cotizar; no cambia el tipo de cada evento.'
								/>
							</div>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Notas</span>
								<textarea
									name='notes'
									defaultValue={client.notes ?? ""}
									className='form-control min-h-28 resize-none py-3 leading-7'
								/>
							</label>
							<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition md:col-span-2'>
								Guardar cambios
							</button>
						</form>
					</section>

					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									Eventos vinculados
								</h2>
								<p className='mt-1 text-lg text-[var(--text-secondary)]'>
									Historial y oportunidades asociadas a este cliente.
								</p>
							</div>
							<Link
								href='/eventos'
								className='secondary-action flex min-h-12 w-fit items-center rounded-full px-4 py-3 text-base font-black transition'
							>
								Ver eventos
							</Link>
						</div>

						{client.events.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin eventos vinculados todavía.
							</p>
						) : (
							<div className='max-w-full overflow-x-auto rounded-lg border border-[color:var(--border-color)]'>
								<div className='grid min-w-[680px] grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-muted px-5 py-4 text-base font-black text-[var(--text-secondary)]'>
									<span>Evento</span>
									<span>Fecha</span>
									<span>Tipo</span>
									<span>Estado</span>
								</div>
								{client.events.map(event => (
									<Link
										key={event.id}
										href={`/eventos/${event.id}`}
										className='grid min-w-[680px] grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] items-center border-t border-[color:var(--border-color)] px-5 py-5 text-lg text-[var(--text-secondary)] transition hover:bg-muted'
									>
										<span className='font-bold text-[var(--text-primary)]'>
											{event.name}
										</span>
										<span>{formatEventDate(event.eventDate)}</span>
										<span>
											<StatusBadge
												value={event.eventType}
												label={EVENT_TYPE_LABELS[event.eventType]}
											/>
										</span>
										<span>
											<StatusBadge
												value={event.funnelStage}
												label={FUNNEL_STAGE_LABELS[event.funnelStage]}
											/>
										</span>
									</Link>
								))}
							</div>
						)}
					</section>

					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									Interacciones
								</h2>
								<p className='mt-1 text-lg text-[var(--text-secondary)]'>
									Registro manual de WhatsApp y llamadas; actualiza el último
									contacto.
								</p>
							</div>
							<button className='secondary-action flex min-h-12 w-fit items-center rounded-full px-4 py-3 text-base font-black transition'>
								Registrar contacto
							</button>
						</div>
						{client.interactions.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin interacciones registradas todavía.
							</p>
						) : (
							<ol className='list-none space-y-3 p-0'>
								{client.interactions.map(interaction => (
									<li
										key={interaction.id}
										className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4'
									>
										<div className='flex flex-wrap items-center gap-2'>
											<StatusBadge
												value={interaction.channel}
												label={INTERACTION_CHANNEL_LABELS[interaction.channel]}
											/>
											<StatusBadge
												value={interaction.direction}
												label={
													INTERACTION_DIRECTION_LABELS[interaction.direction]
												}
											/>
											<span className='text-base font-bold text-[var(--text-muted)]'>
												{formatContactDate(interaction.occurredAt)}
											</span>
										</div>
										<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
											{interaction.summary}
										</p>
									</li>
								))}
							</ol>
						)}
					</section>
				</div>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card p-5'>
						<div className='mb-5 flex items-center gap-4'>
							<PhotoThumbnailControl
								kind='client'
								name={fullName}
								initials={initials}
							/>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									{fullName}
								</h2>
								<p className='text-lg font-semibold text-[var(--text-secondary)]'>
									Cliente {typeLabel.toLowerCase()}
								</p>
							</div>
						</div>

						<dl className='space-y-4 text-lg'>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Primer contacto
								</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{formatContactDate(client.firstContactAt)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Último contacto
								</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{formatContactDate(client.lastContactAt)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Eventos realizados
								</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{completedEvents}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Oportunidad activa
								</dt>
								<dd className='text-right font-black text-[var(--text-primary)]'>
									{activeEvent
										? FUNNEL_STAGE_LABELS[activeEvent.funnelStage]
										: "Sin oportunidad activa"}
								</dd>
							</div>
						</dl>
					</section>

					<TaskPanel
						title='Tareas del cliente'
						entityType='client'
						entityId={client.id}
						revalidatePath={`/clientes/${client.id}`}
						tasks={clientTasks}
					/>
				</aside>
			</div>
		</>
	);
}
