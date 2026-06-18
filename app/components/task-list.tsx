"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { completeTaskAction, updateTaskAction } from "../lib/actions/tasks";
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

function toDateInputValue(date: Date | null) {
	if (!date) return "";
	return new Date(date).toISOString().slice(0, 10);
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
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

	if (tasks.length === 0) {
		return (
			<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-4 text-center text-sm font-bold text-[var(--text-secondary)]'>
				Todo al día. Sin tareas pendientes.
			</p>
		);
	}

	return (
		<ul className='list-none space-y-3 p-0'>
			{tasks.map(task => (
				<li
					key={task.id}
					className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-2.5'
				>
					{editingTaskId === task.id ? (
						<form
							action={async formData => {
								await updateTaskAction(formData);
								setEditingTaskId(null);
							}}
							className='space-y-2'
						>
							<input type='hidden' name='taskId' value={task.id} />
							{completeRevalidate ? (
								<input
									type='hidden'
									name='revalidate'
									value={completeRevalidate}
								/>
							) : null}
							<label className='block space-y-1 text-xs font-black text-[var(--text-primary)]'>
								<span>Título</span>
								<input
									name='title'
									required
									defaultValue={task.title}
									className='form-control min-h-10 px-3 py-2 text-sm'
								/>
							</label>
							<label className='block space-y-1 text-xs font-black text-[var(--text-primary)]'>
								<span>Descripción</span>
								<textarea
									name='description'
									defaultValue={task.description ?? ""}
									rows={2}
									className='form-control min-h-16 px-3 py-2 text-sm'
								/>
							</label>
							<label className='block space-y-1 text-xs font-black text-[var(--text-primary)]'>
								<span>Fecha límite</span>
								<input
									type='date'
									name='dueDate'
									defaultValue={toDateInputValue(task.dueAt)}
									className='form-control min-h-10 px-3 py-2 text-sm'
								/>
							</label>
							<div className='flex flex-wrap justify-end gap-2 text-xs font-black'>
								<button
									type='button'
									onClick={() => setEditingTaskId(null)}
									className='secondary-action min-h-9 rounded-full px-3 py-1.5'
								>
									Cancelar
								</button>
								<button
									type='submit'
									className='primary-action min-h-9 rounded-full px-3 py-1.5'
								>
									Guardar
								</button>
							</div>
						</form>
					) : (
						<>
							<div className='flex items-start justify-between gap-2'>
								<p className='text-sm font-black leading-snug text-[var(--text-primary)]'>
									{task.title}
								</p>
								<StatusBadge
									value={task.origin}
									label={TASK_ORIGIN_LABELS[task.origin] ?? task.origin}
								/>
							</div>
							{task.description ? (
								<p className='mt-1 text-xs font-semibold leading-snug text-[var(--text-secondary)]'>
									{task.description}
								</p>
							) : null}
							<div className='mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-bold'>
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
								<span className='text-[var(--text-muted)]'>
									{formatDue(task.dueAt)}
								</span>
							</div>
							<div className='mt-2 flex flex-wrap justify-end gap-2 text-xs font-black'>
								<button
									type='button'
									onClick={() => setEditingTaskId(task.id)}
									className='secondary-action min-h-9 rounded-full px-3 py-1.5'
								>
									Editar
								</button>
								{completeRevalidate ? (
									<form action={completeTaskAction}>
										<input type='hidden' name='taskId' value={task.id} />
										<input
											type='hidden'
											name='revalidate'
											value={completeRevalidate}
										/>
										<button
											type='submit'
											className='secondary-action min-h-9 rounded-full px-3 py-1.5 text-[var(--secondary-color)]'
										>
											Completar
										</button>
									</form>
								) : null}
							</div>
						</>
					)}
				</li>
			))}
		</ul>
	);
}
