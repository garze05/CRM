import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { formatDate, type TaskRecord } from "../lib/mock-data";

/** Lista compacta de tareas para el dashboard (la gestión completa vive en /tareas). */
export function TaskList({ tasks }: { tasks: TaskRecord[] }) {
	if (tasks.length === 0) {
		return (
			<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
				Todo al día. Sin tareas pendientes ✅
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
						<p className='text-lg font-black text-[var(--text-primary)]'>
							{task.title}
						</p>
						<StatusBadge value={task.origin} />
					</div>
					{task.description ? (
						<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
							{task.description}
						</p>
					) : null}
					<div className='mt-2 flex flex-wrap items-center gap-3 text-base font-bold'>
						<Link
							href={task.entityHref}
							className='text-[var(--secondary-color)] underline-offset-2 hover:underline'
						>
							{task.entityLabel}
						</Link>
						<span className='text-[var(--text-muted)]'>
							{task.dueDate ? `Vence: ${formatDate(task.dueDate)}` : "Sin fecha límite"}
						</span>
					</div>
				</li>
			))}
		</ul>
	);
}
