import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/breadcrumb";
import { StatusBadge } from "../../components/status-badge";
import {
	formatCrc,
	formatDate,
	getEventById,
	getEventClient,
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

	return (
		<>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Eventos", href: "/eventos" },
								{ label: event.name },
							]}
						/>
						<div className='flex flex-wrap items-center gap-3'>
							<h1 className='page-heading'>{event.name}</h1>
							<StatusBadge value={event.pipelineStatus} />
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
							<span>Estado pipeline</span>
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
					</form>
				</section>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Resumen
						</h2>
						<dl className='mt-5 space-y-4 text-lg'>
							<div className='border-t border-[color:var(--border-color)] pt-4'>
								<dt className='font-bold text-[var(--text-secondary)]'>Fecha</dt>
								<dd className='mt-1 font-black text-[var(--text-primary)]'>
									{formatDate(event.date)}
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
				</aside>
			</div>
		</>
	);
}
