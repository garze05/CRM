import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { SectionCard } from "../../components/section-card";
import { clients, getClientFullName } from "../../lib/mock-data";

export default function NewEventPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Eventos", href: "/eventos" },
					{ label: "Nuevo evento" },
				]}
				title='Nuevo evento'
				description='Registro inicial de evento para seguimiento comercial, cotización y calendario.'
				actions={
					<Link
						href='/eventos'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a eventos
					</Link>
				}
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='space-y-5'>
					<SectionCard
						title='Cliente y embudo'
						description='Un evento siempre queda vinculado a un cliente.'
					>
						<form className='grid gap-5 md:grid-cols-2'>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Cliente</span>
								<select className='form-control'>
									{clients.map(client => (
										<option key={client.id} value={client.id}>
											{getClientFullName(client)} · {client.phone}
										</option>
									))}
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Estado inicial</span>
								<select defaultValue='PROSPECTO' className='form-control'>
									<option value='PROSPECTO'>Prospecto</option>
									<option value='CONTACTADO'>Contactado</option>
									<option value='COTIZADO'>Cotizado</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Tipo de evento</span>
								<select defaultValue='INFANTIL' className='form-control'>
									<option value='INFANTIL'>Infantil</option>
									<option value='CORPORATIVO'>Corporativo</option>
									<option value='INSTITUCIONAL'>Institucional</option>
								</select>
							</label>
						</form>
					</SectionCard>

					<SectionCard
						title='Fecha y lugar'
						description='La fecha será obligatoria antes de reservar o confirmar.'
					>
						<form className='grid gap-5 md:grid-cols-2'>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Nombre del evento</span>
								<input className='form-control' placeholder='Cumpleaños de Emma' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Fecha</span>
								<input type='date' className='form-control' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Hora inicio</span>
								<input type='time' className='form-control' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Duración</span>
								<input type='number' step='0.5' className='form-control' placeholder='3' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Lugar</span>
								<input className='form-control' placeholder='Casa, escuela o centro de eventos' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Tipo de lugar</span>
								<select defaultValue='EXTERIOR' className='form-control'>
									<option value='INTERIOR'>Interior</option>
									<option value='EXTERIOR'>Exterior</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Dirección completa</span>
								<input className='form-control' placeholder='Dirección para Google Maps API' />
							</label>
						</form>
					</SectionCard>
				</div>

				<aside className='space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Listo para cotizar
						</h2>
						<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
							Al guardar, el evento queda disponible para asignar paquete,
							servicios y transporte.
						</p>
						<button className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'>
							Guardar evento
						</button>
					</section>
				</aside>
			</div>
		</>
	);
}
