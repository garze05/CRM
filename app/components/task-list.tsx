"use client";

import { useState } from "react";
import Link from "next/link";
import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { StatusBadge } from "./status-badge";
import { completeTaskAction, updateTaskAction } from "../lib/actions/tasks";
import { TASK_ORIGIN_LABELS } from "../lib/domain/labels";
import type { TaskItem } from "../lib/server/tasks";

addCollection(materialSymbolsIcons);

type DueUrgency = "overdue" | "today" | "upcoming" | "none";

function dueUrgency(due: Date | null): DueUrgency {
	if (!due) return "none";
	const dueKey = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(
		due,
	);
	const todayKey = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Costa_Rica",
	}).format(new Date());
	if (dueKey < todayKey) return "overdue";
	if (dueKey === todayKey) return "today";
	return "upcoming";
}

function formatDueDate(date: Date) {
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

const URGENCY_META: Record<
	DueUrgency,
	{ icon: string; className: string } | null
> = {
	overdue: {
		icon: "material-symbols:history-rounded",
		className: "text-[var(--error-color)]",
	},
	today: {
		icon: "material-symbols:schedule-rounded",
		className: "text-[var(--warning-color)]",
	},
	upcoming: {
		icon: "material-symbols:event-rounded",
		className: "text-[var(--text-muted)]",
	},
	none: null,
};

function DueLine({ due }: { due: Date | null }) {
	const urgency = dueUrgency(due);
	if (urgency === "none" || !due) {
		return (
			<span className='text-[var(--text-muted)]'>Sin fecha límite</span>
		);
	}
	const meta = URGENCY_META[urgency]!;
	const text =
		urgency === "overdue"
			? `Venció: ${formatDueDate(due)}`
			: urgency === "today"
				? "Vence hoy"
				: `Vence: ${formatDueDate(due)}`;
	return (
		<span className={`inline-flex items-center gap-1 ${meta.className}`}>
			<Icon icon={meta.icon} className='h-4 w-4 shrink-0' aria-hidden='true' />
			{text}
		</span>
	);
}

function toDateInputValue(date: Date | null) {
	if (!date) return "";
	return new Date(date).toISOString().slice(0, 10);
}

/**
 * Lista de tareas con check circular para completar (sin texto), edición en
 * línea y una sección separada de "Tareas completadas". Al marcar una tarea no
 * desaparece: se tacha, se atenúa y baja a la sección de completadas (estado
 * optimista en el cliente mientras el server action revalida).
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
	// Tareas completadas en esta sesión (snapshot para que no desaparezcan al
	// revalidar, que ya no las devuelve entre las pendientes).
	const [completed, setCompleted] = useState<TaskItem[]>([]);
	const completedIds = new Set(completed.map(task => task.id));
	const pending = tasks.filter(task => !completedIds.has(task.id));

	if (tasks.length === 0 && completed.length === 0) {
		return (
			<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-4 text-center text-sm font-bold text-[var(--text-secondary)]'>
				Todo al día. Sin tareas pendientes.
			</p>
		);
	}

	return (
		<div className='space-y-5'>
			{pending.length > 0 ? (
				<ul className='list-none divide-y divide-[color:var(--border-color)] p-0'>
					{pending.map(task =>
						editingTaskId === task.id ? (
							<li key={task.id} className='py-3'>
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
							</li>
						) : (
							<li key={task.id} className='flex items-start gap-2.5 py-3'>
								{completeRevalidate ? (
									<form
										action={async formData => {
											setCompleted(current => [task, ...current]);
											await completeTaskAction(formData);
										}}
									>
										<input type='hidden' name='taskId' value={task.id} />
										<input
											type='hidden'
											name='revalidate'
											value={completeRevalidate}
										/>
										<button
											type='submit'
											aria-label={`Marcar como completada: ${task.title}`}
											className='group/check flex h-11 w-11 shrink-0 items-center justify-center'
										>
											<span className='grid h-6 w-6 place-items-center rounded-full border-2 border-[color:var(--border-color)] text-transparent transition group-hover/check:border-[var(--secondary-color)] group-hover/check:text-[var(--secondary-color)]'>
												<Icon
													icon='material-symbols:check-rounded'
													className='h-4 w-4'
													aria-hidden='true'
												/>
											</span>
										</button>
									</form>
								) : null}

								<div className='min-w-0 flex-1'>
									<p className='text-sm font-black leading-snug text-[var(--text-primary)]'>
										{task.title}
									</p>
									{task.description ? (
										<p className='mt-0.5 text-xs font-semibold leading-snug text-[var(--text-secondary)]'>
											{task.description}
										</p>
									) : null}
									<div className='mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-bold'>
										<DueLine due={task.dueAt} />
										{showEntity && task.entityHref ? (
											<Link
												href={task.entityHref}
												className='text-[var(--secondary-color)] underline-offset-2 hover:underline'
											>
												{task.entityLabel}
											</Link>
										) : null}
										<StatusBadge
											value={task.origin}
											label={TASK_ORIGIN_LABELS[task.origin] ?? task.origin}
										/>
									</div>
								</div>

								<button
									type='button'
									onClick={() => setEditingTaskId(task.id)}
									className='flex min-h-9 shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-black text-[var(--text-secondary)] transition hover:bg-muted hover:text-[var(--primary-color)]'
								>
									<Icon
										icon='material-symbols:edit-rounded'
										className='h-4 w-4 shrink-0'
										aria-hidden='true'
									/>
									<span>Editar</span>
								</button>
							</li>
						),
					)}
				</ul>
			) : null}

			{completed.length > 0 ? (
				<div>
					<h3 className='mb-1 text-xs font-black uppercase tracking-wide text-[var(--text-muted)]'>
						Tareas completadas
					</h3>
					<ul className='list-none divide-y divide-[color:var(--border-color)] p-0'>
						{completed.map(task => (
							<li key={task.id} className='flex items-start gap-2.5 py-3'>
								<span className='flex h-11 w-11 shrink-0 items-center justify-center'>
									<span className='grid h-6 w-6 place-items-center rounded-full bg-[var(--secondary-color)] text-[var(--on-accent)]'>
										<Icon
											icon='material-symbols:check-rounded'
											className='h-4 w-4'
											aria-hidden='true'
										/>
									</span>
								</span>
								<div className='min-w-0 flex-1'>
									<p className='text-sm font-bold leading-snug text-[var(--text-muted)] line-through'>
										{task.title}
									</p>
									{task.entityLabel && showEntity ? (
										<p className='mt-0.5 text-xs font-semibold text-[var(--text-muted)]'>
											{task.entityLabel}
										</p>
									) : null}
								</div>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
}
