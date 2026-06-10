import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";

export default function SettingsPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Ajustes" }]}
				title='Ajustes'
				description='Configuración general del CRM, integraciones y preferencias del equipo.'
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='space-y-5'>
					<SectionCard
						title='Negocio'
						description='Valores base que usará el backend para cotizaciones y documentos.'
					>
						<form className='grid gap-5 md:grid-cols-2'>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Moneda principal</span>
								<select defaultValue='CRC' className='form-control'>
									<option value='CRC'>Colones costarricenses</option>
									<option value='USD'>Dólares estadounidenses</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Zona horaria</span>
								<input
									defaultValue='America/Costa_Rica'
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Vigencia de cotización</span>
								<input type='number' defaultValue='7' className='form-control' />
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Porcentaje de anticipo</span>
								<input type='number' defaultValue='50' className='form-control' />
							</label>
						</form>
					</SectionCard>

					<SectionCard
						title='Integraciones'
						description='Estado visual para preparar conexión con servicios externos.'
					>
						<div className='grid gap-3 md:grid-cols-3'>
							{[
								"Google OAuth",
								"Google Maps API",
								"Script Python de cotización",
							].map(item => (
								<div
									key={item}
									className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-4'
								>
									<p className='text-lg font-black text-[var(--text-primary)]'>
										{item}
									</p>
									<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
										Pendiente de conectar
									</p>
								</div>
							))}
						</div>
					</SectionCard>
				</div>

				<aside className='space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Preparado para backend
						</h2>
						<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
							Estos campos quedan como contrato visual para variables de entorno,
							configuración regional y reglas de pago.
						</p>
						<button className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'>
							Guardar ajustes
						</button>
					</section>
				</aside>
			</div>
		</>
	);
}
