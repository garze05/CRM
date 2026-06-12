import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { PhoneInput } from "../../components/phone-input";
import { SectionCard } from "../../components/section-card";

export default function NewClientPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Clientes", href: "/clientes" },
					{ label: "Nuevo cliente" },
				]}
				title='Nuevo cliente'
				description='Alta rápida para prospectos que llegan por WhatsApp o llamada.'
				actions={
					<Link
						href='/clientes'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a clientes
					</Link>
				}
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<SectionCard
					title='Datos de contacto'
					description='El teléfono será el identificador natural para evitar duplicados.'
				>
					<form className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Nombre</span>
							<input className='form-control' placeholder='María' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Apellidos</span>
							<input className='form-control' placeholder='Rodríguez' />
						</label>
						<PhoneInput
							name='phone'
							label='Teléfono WhatsApp'
							placeholder='8888 0000'
							required
						/>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Tipo de cliente</span>
							<select defaultValue='FAMILIAR' className='form-control'>
								<option value='FAMILIAR'>Familiar</option>
								<option value='EDUCATIVO'>Educativo</option>
								<option value='CORPORATIVO'>Corporativo</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Notas</span>
							<textarea
								className='form-control min-h-32 resize-none py-3 leading-7'
								placeholder='Contexto del primer contacto, preferencias y próxima acción.'
							/>
						</label>
					</form>
				</SectionCard>

				<aside className='space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Primer seguimiento
						</h2>
						<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
							Al guardar, el cliente inicia como PROSPECTO y queda listo para
							crear evento o cotización.
						</p>
						<button className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'>
							Guardar cliente
						</button>
					</section>
				</aside>
			</div>
		</>
	);
}
