import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { SectionCard } from "../../components/section-card";

export default function NewInventoryItemPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Catálogo", href: "/inventario" },
					{ label: "Nuevo ítem" },
				]}
				title='Nuevo ítem'
				description='Registro visual para personajes, inflables, decoración o servicios del catálogo.'
				actions={
					<Link
						href='/inventario'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a inventario
					</Link>
				}
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<SectionCard
					title='Información del catálogo'
					description='Estos datos alimentan la vista pública y el PDF de cotización.'
				>
					<form className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Nombre</span>
							<input className='form-control' placeholder='Princesa Estrella' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Categoría</span>
							<select defaultValue='PERSONAJE' className='form-control'>
								<option value='PERSONAJE'>Personaje</option>
								<option value='INFLABLE'>Inflable</option>
								<option value='DECORACION'>Decoración</option>
								<option value='OTRO'>Otro</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Imagen principal</span>
							<input type='url' className='form-control' placeholder='https://...' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Disponibilidad</span>
							<select defaultValue='DISPONIBLE' className='form-control'>
								<option value='DISPONIBLE'>Disponible</option>
								<option value='RESERVADO'>Reservado</option>
								<option value='MANTENIMIENTO_PENDIENTE'>Mantenimiento</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Descripción</span>
							<textarea
								className='form-control min-h-28 resize-none py-3 leading-7'
								placeholder='Descripción corta visible en catálogo y cotización.'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Etiquetas</span>
							<input className='form-control' placeholder='Disney, niñas, fotos' />
						</label>
					</form>
				</SectionCard>

				<aside className='space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Vista pública
						</h2>
						<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
							Los ítems activos podrán mostrarse en el enlace público del
							catálogo.
						</p>
						<button className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'>
							Guardar ítem
						</button>
					</section>
				</aside>
			</div>
		</>
	);
}
