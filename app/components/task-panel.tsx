import Link from "next/link";
import { IconLabel } from "./icon-label";
import { TaskList } from "./task-list";
import type { TaskRecord } from "../lib/mock-data";

function buildNewTaskHref(entityHref: string, entityLabel: string) {
	const params = new URLSearchParams({
		entidad: entityHref,
		nombre: entityLabel,
	});

	return `/tareas/nueva?${params.toString()}`;
}

export function TaskPanel({
	entityHref,
	entityLabel,
	tasks,
	title,
}: {
	entityHref: string;
	entityLabel: string;
	tasks: TaskRecord[];
	title: string;
}) {
	return (
		<section className='surface-card p-5'>
			<div className='mb-4 flex items-start justify-between gap-3'>
				<div>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						{title}
					</h2>
					<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
						Seguimientos asociados a este registro.
					</p>
				</div>
				<Link
					href={buildNewTaskHref(entityHref, entityLabel)}
					className='secondary-action flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-base font-black transition'
				>
					<IconLabel icon='material-symbols:add-task-rounded' label='Agregar' />
				</Link>
			</div>
			<TaskList tasks={tasks} />
		</section>
	);
}
