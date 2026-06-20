"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { TaskList } from "./task-list";
import { createTaskAction, type QuickTaskState } from "../lib/actions/tasks";
import type { TaskItem } from "../lib/server/tasks";

const initialState: QuickTaskState = {};

export type TaskEntityType = "client" | "event" | "collaborator";

export function TaskPanel({
	title,
	entityType,
	entityId,
	revalidatePath,
	tasks,
	showEntity = false,
	viewAllHref,
}: {
	title: string;
	entityType?: TaskEntityType;
	entityId?: string;
	/** Ruta a revalidar al completar una tarea (ej. /clientes/123). */
	revalidatePath: string;
	tasks: TaskItem[];
	showEntity?: boolean;
	viewAllHref?: string;
}) {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(
		createTaskAction,
		initialState,
	);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (!state.ok) return;
		const timer = window.setTimeout(() => {
			formRef.current?.reset();
			setOpen(false);
		}, 0);
		return () => window.clearTimeout(timer);
	}, [state.ok]);

	return (
		<section className='surface-card p-5'>
			<div className='mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start'>
				<div className='min-w-0'>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						{title}
					</h2>
				</div>
				<div className='grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:justify-end'>
					<button
						type='button'
						onClick={() => setOpen(v => !v)}
						aria-expanded={open}
						className='secondary-action flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition sm:text-base'
					>
						<Icon
							icon={
								open
									? "material-symbols:close-rounded"
									: "material-symbols:add-task-rounded"
							}
							className='h-5 w-5 shrink-0'
							aria-hidden='true'
						/>
						<span>{open ? "Cerrar" : "Agregar"}</span>
					</button>
					{viewAllHref ? (
						<Link
							href={viewAllHref}
							className='secondary-action flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-black transition sm:text-base'
						>
							Ver todas
						</Link>
					) : null}
				</div>
			</div>

			{open ? (
				<form
					ref={formRef}
					action={formAction}
					className='mb-4 space-y-3 rounded-lg border border-[color:var(--border-color)] bg-muted p-4'
				>
					<input type='hidden' name='revalidate' value={revalidatePath} />
					{entityType && entityId ? (
						<>
							<input type='hidden' name='entityType' value={entityType} />
							<input type='hidden' name='entityId' value={entityId} />
						</>
					) : null}
					<label className='block space-y-1 text-base font-bold text-[var(--text-primary)]'>
						<span>Título</span>
						<input
							name='title'
							required
							autoFocus
							placeholder='Confirmar dirección, dar seguimiento…'
							className='form-control'
						/>
					</label>
					<label className='block space-y-1 text-base font-bold text-[var(--text-primary)]'>
						<span>Fecha límite (opcional)</span>
						<input type='date' name='dueDate' className='form-control' />
					</label>
					{state.error ? (
						<p className='text-sm font-bold text-[var(--error-color)]'>
							{state.error}
						</p>
					) : null}
					<button
						type='submit'
						disabled={pending}
						className='primary-action min-h-11 w-full rounded-full px-4 py-2 text-base font-black transition disabled:opacity-60'
					>
						{pending ? "Guardando…" : "Guardar tarea"}
					</button>
				</form>
			) : null}

			<TaskList
				tasks={tasks}
				showEntity={showEntity}
				completeRevalidate={revalidatePath}
			/>
		</section>
	);
}
