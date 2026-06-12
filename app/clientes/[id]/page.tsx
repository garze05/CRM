import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../components/page-header";
import { PhoneInput } from "../../components/phone-input";
import { PhotoThumbnailControl } from "../../components/photo-thumbnail-control";
import { StatusBadge } from "../../components/status-badge";
import { TaskPanel } from "../../components/task-panel";
import {
	formatCrc,
	formatDate,
	getClientById,
	getClientEvents,
	getClientFullName,
	getClientInteractions,
	getClientTasks,
} from "../../lib/mock-data";

export default async function ClientDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const client = getClientById(id);

	if (!client) {
		notFound();
	}

	const linkedEvents = getClientEvents(client.id);
	const clientInteractions = getClientInteractions(client.id);
	const clientTasks = getClientTasks(client.id);
	const initials = `${client.firstName[0]}${client.lastName[0]}`;

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Clientes", href: "/clientes" },
					{ label: getClientFullName(client) },
				]}
				title={getClientFullName(client)}
				badges={<StatusBadge value={client.pipelineStatus} />}
				actions={
					<div className='grid grid-cols-2 gap-3 sm:flex'>
						<button className='secondary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition'>
							Guardar cambios
						</button>
						<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition'>
							Crear evento
						</button>
					</div>
				}
			/>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='min-w-0 space-y-5'>
					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									Datos del cliente
								</h2>
								<p className='mt-1 text-lg text-[var(--text-secondary)]'>
									Contacto principal para WhatsApp y cotizaciones.
								</p>
							</div>
							<StatusBadge value={client.type} />
						</div>

						<form className='grid gap-5 md:grid-cols-2'>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Nombre</span>
								<input
									defaultValue={client.firstName}
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Apellidos</span>
								<input
									defaultValue={client.lastName}
									className='form-control'
								/>
							</label>
							<PhoneInput
								name='phone'
								label='Teléfono'
								defaultValue={client.phone}
							/>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Tipo</span>
								<select
									defaultValue={client.type}
									className='form-control'
								>
									<option value='FAMILIAR'>Familiar</option>
									<option value='EDUCATIVO'>Educativo</option>
									<option value='CORPORATIVO'>Corporativo</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Notas</span>
								<textarea
									defaultValue={client.notes}
									className='form-control min-h-28 resize-none py-3 leading-7'
								/>
							</label>
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

						<div className='max-w-full overflow-x-auto rounded-lg border border-[color:var(--border-color)]'>
							<div className='grid min-w-[760px] grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.7fr] bg-[#f0ebe4] px-5 py-4 text-base font-black text-[var(--text-secondary)]'>
								<span>Evento</span>
								<span>Fecha</span>
								<span>Tipo</span>
								<span>Estado</span>
								<span>Total</span>
							</div>
							{linkedEvents.map(event => (
								<Link
									key={event.id}
									href={`/eventos/${event.id}`}
									className='grid min-w-[760px] grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.7fr] items-center border-t border-[color:var(--border-color)] px-5 py-5 text-lg text-[var(--text-secondary)] transition hover:bg-[#f7f2ec]'
								>
									<span className='font-bold text-[var(--text-primary)]'>
										{event.name}
									</span>
									<span>{formatDate(event.date)}</span>
									<span>
										<StatusBadge value={event.type} />
									</span>
									<span>
										<StatusBadge value={event.pipelineStatus} />
									</span>
									<span className='font-black text-[var(--text-primary)]'>
										{formatCrc(event.estimatedTotal)}
									</span>
								</Link>
							))}
						</div>
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
						{clientInteractions.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
								Sin interacciones registradas todavía.
							</p>
						) : (
							<ol className='list-none space-y-3 p-0'>
								{clientInteractions.map(interaction => (
									<li
										key={interaction.id}
										className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4'
									>
										<div className='flex flex-wrap items-center gap-2'>
											<StatusBadge value={interaction.channel} />
											<StatusBadge value={interaction.direction} />
											<span className='text-base font-bold text-[var(--text-muted)]'>
												{formatDate(interaction.date)}
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
								name={getClientFullName(client)}
								initials={initials}
							/>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									{getClientFullName(client)}
								</h2>
								<p className='text-lg font-semibold text-[var(--text-secondary)]'>
									Cliente {client.type.toLowerCase()}
								</p>
							</div>
						</div>

						<dl className='space-y-4 text-lg'>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Primer contacto
								</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{formatDate(client.firstContactDate)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Último contacto
								</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{formatDate(client.lastContactDate)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Eventos realizados
								</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{client.eventsCompleted}
								</dd>
							</div>
						</dl>
					</section>

					<TaskPanel
						title='Tareas del cliente'
						entityHref={`/clientes/${client.id}`}
						entityLabel={getClientFullName(client)}
						tasks={clientTasks}
					/>
				</aside>
			</div>
		</>
	);
}
