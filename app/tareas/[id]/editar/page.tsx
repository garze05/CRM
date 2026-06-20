import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../components/page-header";
import { SectionCard } from "../../../components/section-card";
import { DateTimeField } from "../../../components/date-time-field";
import { TaskDeleteButton } from "../../task-row-actions";
import { updateTaskAction } from "../../../lib/actions/tasks";
import { getTask, listTaskEntityOptions } from "../../../lib/server/tasks";

function crDate(date: Date) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Costa_Rica",
	}).format(date);
}

function crTime(date: Date) {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "America/Costa_Rica",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

export default async function EditTaskPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [task, baseOptions] = await Promise.all([
		getTask(id),
		listTaskEntityOptions(),
	]);
	if (!task) notFound();

	// Garantizar que la asociación actual sea seleccionable aunque no esté en la
	// lista base (ej. tareas de colaboradores o recordatorios automáticos).
	const hasCurrent =
		task.entityValue === "" ||
		baseOptions.some(option => option.value === task.entityValue);
	const options = [
		{ value: "", label: "Sin asociación", group: "General" },
		...(hasCurrent
			? []
			: [
					{
						value: task.entityValue,
						label: task.entityLabel ?? task.entityValue,
						group: "Actual",
					},
				]),
		...baseOptions,
	];

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Tareas", href: "/tareas" },
					{ label: "Editar tarea" },
				]}
				title='Editar tarea'
				description='Actualizá el seguimiento o reasignalo a otro registro.'
				actions={
					<Link
						href='/tareas'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a tareas
					</Link>
				}
			/>

			<div className='max-w-4xl space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard title='Datos de la tarea'>
					<form action={updateTaskAction} className='grid gap-5 md:grid-cols-2'>
						<input type='hidden' name='taskId' value={task.id} />
						<input type='hidden' name='revalidate' value='/tareas' />
						<input type='hidden' name='redirectToList' value='1' />
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Título</span>
							<input
								name='title'
								required
								defaultValue={task.title}
								className='form-control'
								placeholder='Confirmar dirección exacta del evento'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Asociada a</span>
							<select
								name='entity'
								defaultValue={task.entityValue}
								className='form-control'
							>
								{options.map(option => (
									<option
										key={`${option.group}-${option.value}`}
										value={option.value}
									>
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
								defaultDate={task.dueAt ? crDate(task.dueAt) : undefined}
								defaultTime={
									task.dueAt && task.dueHasTime
										? crTime(task.dueAt)
										: undefined
								}
							/>
						</div>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Descripción</span>
							<textarea
								name='description'
								defaultValue={task.description ?? ""}
								className='form-control min-h-32 resize-none py-3 leading-7'
								placeholder='Contexto para que cualquier persona del equipo pueda completar el seguimiento.'
							/>
						</label>
						<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition md:col-span-2'>
							Guardar cambios
						</button>
					</form>
				</SectionCard>

				<div className='flex justify-end'>
					<TaskDeleteButton taskId={task.id} title={task.title} redirectToList />
				</div>
			</div>
		</>
	);
}
