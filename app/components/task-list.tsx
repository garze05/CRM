"use client";

import { useState } from "react";
import Link from "next/link";
import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { Button } from "./ui/button";
import { DateTimeField } from "./date-time-field";
import { StatusBadge } from "./status-badge";
import {
	completeTaskAction,
	reopenTaskAction,
	updateTaskAction,
} from "../lib/actions/tasks";
import { TASK_ORIGIN_LABELS } from "../lib/domain/labels";
import type { TaskItem } from "../lib/server/tasks";

addCollection(materialSymbolsIcons);

type DueUrgency = "overdue" | "today" | "upcoming" | "none";

function dueUrgency(due: Date | null): DueUrgency {
	if (!due) return "none";
	const dueKey = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Costa_Rica",
	}).format(due);
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
		timeZone: "America/Costa_Rica",
	}).format(date);
}

const URGENCY_META: Record<DueUrgency, { icon: string; className: string }> = {
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
	none: {
		icon: "material-symbols:event-busy-rounded",
		className: "text-[var(--text-muted)]",
	},
};

/** Línea de fecha límite con color según urgencia (atenuada si `muted`). */
function DueLine({
	due,
	hasTime = false,
	muted = false,
}: {
	due: Date | null;
	hasTime?: boolean;
	muted?: boolean;
}) {
	const urgency = dueUrgency(due);
	const meta = URGENCY_META[urgency];
	const timeSuffix = due && hasTime ? `, ${formatTime(due)}` : "";
	const text =
		urgency === "none" || !due
			? "Sin fecha límite"
			: urgency === "overdue"
				? `Venció: ${formatDueDate(due)}${timeSuffix}`
				: urgency === "today"
					? `Vence hoy${timeSuffix}`
					: `Vence: ${formatDueDate(due)}${timeSuffix}`;
	return (
		<span
			className={`inline-flex items-center gap-1 ${muted ? "text-[var(--text-muted)]" : meta.className}`}
		>
			<Icon icon={meta.icon} className='h-4 w-4 shrink-0' aria-hidden='true' />
			{text}
		</span>
	);
}

/** Metadatos comunes (fecha, entidad, origen) de una tarea. */
function TaskMeta({
	task,
	showEntity,
	muted = false,
}: {
	task: TaskItem;
	showEntity: boolean;
	muted?: boolean;
}) {
	return (
		<div className='mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-bold'>
			<DueLine due={task.dueAt} hasTime={task.dueHasTime} muted={muted} />
			{showEntity && task.entityHref ? (
				<Link
					href={task.entityHref}
					className={
						muted
							? "text-[var(--text-muted)] underline-offset-2 hover:underline"
							: "text-[var(--secondary-color)] underline-offset-2 hover:underline"
					}
				>
					{task.entityLabel}
				</Link>
			) : null}
			<StatusBadge
				value={task.origin}
				label={TASK_ORIGIN_LABELS[task.origin] ?? task.origin}
			/>
		</div>
	);
}

/** Día calendario en Costa Rica (YYYY-MM-DD) para precargar el campo de fecha. */
function dueDateValue(date: Date | null) {
	if (!date) return undefined;
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Costa_Rica",
	}).format(date);
}

/** Hora en Costa Rica (HH:mm) para precargar el campo de hora. */
function crTimeValue(date: Date) {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "America/Costa_Rica",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

/** Hora legible (ej. "10:30 p. m.") en Costa Rica. */
function formatTime(date: Date) {
	return new Intl.DateTimeFormat("es-CR", {
		timeZone: "America/Costa_Rica",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	}).format(date);
}

/**
 * Lista de tareas con check circular para completar/reabrir (sin texto),
 * edición en línea y una sección separada de "Tareas completadas". Al marcar
 * una tarea no desaparece: se tacha, se atenúa (conservando fecha y origen) y
 * baja a completadas; el mismo check la devuelve a pendientes. El estado es
 * optimista en el cliente mientras el server action revalida.
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
	// Overrides optimistas: completadas en esta sesión y reabiertas (snapshots,
	// para que no desaparezcan en lo que el server action revalida).
	const [completed, setCompleted] = useState<TaskItem[]>([]);
	const [reopened, setReopened] = useState<TaskItem[]>([]);

	const completedIds = new Set(completed.map(task => task.id));
	const serverPending = tasks.filter(task => !completedIds.has(task.id));
	const serverIds = new Set(serverPending.map(task => task.id));
	const extraPending = reopened.filter(
		task => !serverIds.has(task.id) && !completedIds.has(task.id),
	);
	const pending = [...serverPending, ...extraPending];

	function markCompleted(task: TaskItem) {
		setReopened(list => list.filter(item => item.id !== task.id));
		setCompleted(list => [task, ...list.filter(item => item.id !== task.id)]);
	}
	function markReopened(task: TaskItem) {
		setCompleted(list => list.filter(item => item.id !== task.id));
		setReopened(list => [task, ...list.filter(item => item.id !== task.id)]);
	}

	if (pending.length === 0 && completed.length === 0) {
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
									<DateTimeField
										dateName='dueDate'
										timeName='dueTime'
										dateLabel='Fecha límite'
										timeLabel='Hora'
										optional
										defaultDate={dueDateValue(task.dueAt)}
										defaultTime={
											task.dueHasTime && task.dueAt
												? crTimeValue(task.dueAt)
												: undefined
										}
									/>
									<div className='flex flex-wrap justify-end gap-2'>
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => setEditingTaskId(null)}
										>
											Cancelar
										</Button>
										<Button type='submit' size='sm'>
											Guardar
										</Button>
									</div>
								</form>
							</li>
						) : (
							<li key={task.id} className='flex items-start gap-2 py-3'>
								{completeRevalidate ? (
									<form
										action={async formData => {
											markCompleted(task);
											await completeTaskAction(formData);
										}}
									>
										<input type='hidden' name='taskId' value={task.id} />
										<input
											type='hidden'
											name='revalidate'
											value={completeRevalidate}
										/>
										<Button
											type='submit'
											variant='ghost'
											size='icon'
											aria-label={`Marcar como completada: ${task.title}`}
											className='group/check shrink-0 hover:bg-transparent'
										>
											<span className='grid h-6 w-6 place-items-center rounded-full border-2 border-[color:var(--border-color)] text-transparent transition group-hover/check:border-[var(--secondary-color)] group-hover/check:text-[var(--secondary-color)]'>
												<Icon
													icon='material-symbols:check-rounded'
													className='h-4 w-4'
													aria-hidden='true'
												/>
											</span>
										</Button>
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
									<TaskMeta task={task} showEntity={showEntity} />
								</div>

								<Button
									type='button'
									variant='ghost'
									size='sm'
									onClick={() => setEditingTaskId(task.id)}
									className='min-h-9 shrink-0 gap-1 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
								>
									<Icon
										icon='material-symbols:edit-rounded'
										className='h-4 w-4 shrink-0'
										aria-hidden='true'
									/>
									Editar
								</Button>
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
							<li key={task.id} className='flex items-start gap-2 py-3'>
								{completeRevalidate ? (
									<form
										action={async formData => {
											markReopened(task);
											await reopenTaskAction(formData);
										}}
									>
										<input type='hidden' name='taskId' value={task.id} />
										<input
											type='hidden'
											name='revalidate'
											value={completeRevalidate}
										/>
										<Button
											type='submit'
											variant='ghost'
											size='icon'
											aria-label={`Marcar como pendiente: ${task.title}`}
											className='shrink-0 hover:bg-transparent'
										>
											<span className='grid h-6 w-6 place-items-center rounded-full bg-[var(--secondary-color)] text-[var(--secondary-foreground)]'>
												<Icon
													icon='material-symbols:check-rounded'
													className='h-4 w-4'
													aria-hidden='true'
												/>
											</span>
										</Button>
									</form>
								) : null}

								<div className='min-w-0 flex-1'>
									<p className='text-sm font-bold leading-snug text-[var(--text-muted)] line-through'>
										{task.title}
									</p>
									<TaskMeta task={task} showEntity={showEntity} muted />
								</div>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
}
