import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { SectionCard } from "../../components/section-card";
import { DateTimeField } from "../../components/date-time-field";
import { createStandaloneTaskAction } from "../../lib/actions/tasks";
import { listTaskEntityOptions } from "../../lib/server/tasks";

export default async function NewTaskPage({
	searchParams,
}: {
	searchParams: Promise<{ entidad?: string; nombre?: string }>;
}) {
	const { entidad, nombre } = await searchParams;
	const baseOptions = await listTaskEntityOptions();
	const hasIncomingEntity = entidad
		? baseOptions.some(option => option.value === entidad)
		: false;
	const options =
		entidad && !hasIncomingEntity
			? [
					{
						label: nombre ?? entidad,
						value: entidad,
						group: "Seleccionada",
					},
					...baseOptions,
				]
			: baseOptions;
	const defaultEntity = entidad ?? options[0]?.value;

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Tareas", href: "/tareas" },
					{ label: "Nueva tarea" },
				]}
				title='Nueva tarea'
				description='Pendiente manual asociado a un registro.'
				actions={
					<Link
						href='/tareas'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a tareas
					</Link>
				}
			/>

			<div className='max-w-4xl px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard
					title='Datos de la tarea'
					description='Los recordatorios automáticos seguirán naciendo del sistema; esta pantalla cubre pendientes manuales del equipo.'
				>
					<form action={createStandaloneTaskAction} className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Título</span>
							<input
								name='title'
								required
								className='form-control'
								placeholder='Confirmar dirección exacta del evento'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Asociada a</span>
							<select name='entity' defaultValue={defaultEntity} className='form-control'>
								{options.map(option => (
									<option key={`${option.group}-${option.value}`} value={option.value}>
										{option.group} · {option.label}
									</option>
								))}
							</select>
						</label>
						<div className='md:col-span-2'>
							<DateTimeField
								dateName='dueDate'
								timeName='dueTime'
								dateLabel='Fecha límite'
								timeLabel='Hora'
								optional
							/>
						</div>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Descripción</span>
							<textarea
								name='description'
								className='form-control min-h-32 resize-none py-3 leading-7'
								placeholder='Contexto para que cualquier persona del equipo pueda completar el seguimiento.'
							/>
						</label>
						<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition md:col-span-2'>
							Guardar tarea
						</button>
					</form>
				</SectionCard>
			</div>
		</>
	);
}
