import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { completeTaskAction } from "../lib/actions/tasks";
import {
	TASK_ORIGIN_LABELS,
	TASK_STATUS_LABELS,
} from "../lib/domain/labels";
import type { TaskItem } from "../lib/server/tasks";

function formatDue(date: Date | null) {
	if (!date) return "Sin fecha límite";
	return `Vence: ${new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date)}`;
}

/**
 * Lista de tareas. Si `completeRevalidate` se pasa, cada tarea muestra un botón
 * para marcarla como completada (revalida esa ruta). `showEntity` muestra el
 * enlace a la entidad (útil en el tablero general; redundante en una ficha).
 */
export function TaskList({
	tasks,
	showEntity = true,
	completeRevalidate,
}: {
	tasks: TaskItem[];
	showEntity?: boolean;
	completeRevalidate?: string;
}) {
	if (tasks.length === 0) {
		return (
			<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
				Todo al día. Sin tareas pendientes.
			</p>
		);
	}

	return (
		<ul className='list-none space-y-3 p-0'>
			{tasks.map(task => (
				<li
					key={task.id}
					className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-3'
				>
					<div className='flex items-start justify-between gap-2'>
						<p className='text-[0.95rem] font-black leading-snug text-[var(--text-primary)]'>
							{task.title}
						</p>
						<StatusBadge
							value={task.origin}
							label={TASK_ORIGIN_LABELS[task.origin] ?? task.origin}
						/>
					</div>
					{task.description ? (
						<p className='mt-1 text-sm font-semibold leading-snug text-[var(--text-secondary)]'>
							{task.description}
						</p>
					) : null}
					<div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold'>
						<StatusBadge
							value={task.status}
							label={TASK_STATUS_LABELS[task.status] ?? task.status}
						/>
						{showEntity && task.entityHref ? (
							<Link
								href={task.entityHref}
								className='text-[var(--secondary-color)] underline-offset-2 hover:underline'
							>
								{task.entityLabel}
							</Link>
						) : null}
						<span className='text-[var(--text-muted)]'>{formatDue(task.dueAt)}</span>
						{completeRevalidate ? (
							<form action={completeTaskAction} className='ml-auto'>
								<input type='hidden' name='taskId' value={task.id} />
								<input
									type='hidden'
									name='revalidate'
									value={completeRevalidate}
								/>
								<button
									type='submit'
									className='font-black text-[var(--secondary-color)] underline-offset-2 hover:underline'
								>
									Completar
								</button>
							</form>
						) : null}
					</div>
				</li>
			))}
		</ul>
	);
}
