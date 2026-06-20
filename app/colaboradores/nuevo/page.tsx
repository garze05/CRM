import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { PhoneInput } from "../../components/phone-input";
import { SectionCard } from "../../components/section-card";
import { listActiveCatalogItems } from "../../lib/server/catalog";

export default async function NewCollaboratorPage() {
	const characters = (await listActiveCatalogItems()).filter(
		item => item.category === "CHARACTER",
	);

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Colaboradores", href: "/colaboradores" },
					{ label: "Nuevo colaborador" },
				]}
				title='Nuevo colaborador'
				description='Alta operativa para asignaciones.'
				actions={
					<Link
						href='/colaboradores'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a colaboradores
					</Link>
				}
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<SectionCard
					title='Perfil del colaborador'
				>
					<form className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Nombre</span>
							<input className='form-control' placeholder='Luis' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Apellidos</span>
							<input className='form-control' placeholder='Alvarado' />
						</label>
						<PhoneInput
							name='phone'
							label='Teléfono'
							placeholder='7000 0000'
						/>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Rol</span>
							<select defaultValue='MASCOT_COSTUME' className='form-control'>
								<option value='MASCOT_COSTUME'>Botarga</option>
								<option value='ENTERTAINER'>Animador</option>
								<option value='LOGISTICS'>Logística</option>
								<option value='OTHER'>Otro</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Personajes disponibles</span>
							<select multiple className='form-control min-h-36 py-3'>
								{characters.map(item => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Notas</span>
							<textarea
								className='form-control min-h-28 resize-none py-3 leading-7'
								placeholder='Disponibilidad habitual, restricciones o experiencia.'
							/>
						</label>
					</form>
				</SectionCard>

				<aside className='space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Disponibilidad
						</h2>
						<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
							El colaborador inicia como disponible y luego se valida contra el
							calendario al asignarlo.
						</p>
						<button className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'>
							Guardar colaborador
						</button>
					</section>
				</aside>
			</div>
		</>
	);
}
