import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { SectionCard } from "../../components/section-card";
import {
	clients,
	events,
	getClientFullName,
	quotes,
} from "../../lib/mock-data";

type EntityOption = {
	label: string;
	href: string;
	group: string;
};

function getEntityOptions(): EntityOption[] {
	return [
		...clients.map(client => ({
			label: getClientFullName(client),
			href: `/clientes/${client.id}`,
			group: "Clientes",
		})),
		...events.map(event => ({
			label: event.name,
			href: `/eventos/${event.id}`,
			group: "Eventos",
		})),
		...quotes.map(quote => ({
			label: quote.number,
			href: `/cotizaciones/${quote.id}`,
			group: "Cotizaciones",
		})),
	];
}

export default async function NewTaskPage({
	searchParams,
}: {
	searchParams: Promise<{ entidad?: string; nombre?: string }>;
}) {
	const { entidad, nombre } = await searchParams;
	const baseOptions = getEntityOptions();
	const hasIncomingEntity = entidad
		? baseOptions.some(option => option.href === entidad)
		: false;
	const options =
		entidad && !hasIncomingEntity
			? [
					{
						label: nombre ?? entidad,
						href: entidad,
						group: "Seleccionada",
					},
					...baseOptions,
				]
			: baseOptions;
	const defaultEntity = entidad ?? options[0]?.href;

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Tareas", href: "/tareas" },
					{ label: "Nueva tarea" },
				]}
				title='Nueva tarea'
				description='Crea un pendiente manual y asócialo a un cliente, evento o cotización.'
				actions={
					<Link
						href='/tareas'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a tareas
					</Link>
				}
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<SectionCard
					title='Datos de la tarea'
					description='Los recordatorios automáticos seguirán naciendo del sistema; esta pantalla cubre pendientes manuales del equipo.'
				>
					<form className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Título</span>
							<input
								className='form-control'
								placeholder='Confirmar dirección exacta del evento'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Asociada a</span>
							<select defaultValue={defaultEntity} className='form-control'>
								{options.map(option => (
									<option key={`${option.group}-${option.href}`} value={option.href}>
										{option.group} · {option.label}
									</option>
								))}
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Fecha límite</span>
							<input type='date' className='form-control' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Estado</span>
							<select defaultValue='PENDIENTE' className='form-control'>
								<option value='PENDIENTE'>Pendiente</option>
								<option value='EN_PROGRESO'>En progreso</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Origen</span>
							<select defaultValue='MANUAL' className='form-control'>
								<option value='MANUAL'>Manual</option>
								<option value='SISTEMA'>Sistema</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Prioridad</span>
							<select defaultValue='NORMAL' className='form-control'>
								<option value='NORMAL'>Normal</option>
								<option value='ALTA'>Alta</option>
								<option value='BAJA'>Baja</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Descripción</span>
							<textarea
								className='form-control min-h-32 resize-none py-3 leading-7'
								placeholder='Contexto para que cualquier persona del equipo pueda completar el seguimiento.'
							/>
						</label>
					</form>
				</SectionCard>

				<aside className='space-y-5'>
					<section className='surface-card p-5'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Seguimiento
						</h2>
						<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
							Al guardar, la tarea aparecerá en el tablero general y en el
							detalle del registro asociado.
						</p>
						<button className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'>
							Guardar tarea
						</button>
					</section>
				</aside>
			</div>
		</>
	);
}
