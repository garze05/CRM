"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { TaskList } from "./task-list";
import {
	createTaskAction,
	type QuickTaskState,
} from "../lib/actions/tasks";
import type { TaskItem } from "../lib/server/tasks";

const initialState: QuickTaskState = {};

export type TaskEntityType = "client" | "event" | "collaborator";

export function TaskPanel({
	title,
	entityType,
	entityId,
	revalidatePath,
	tasks,
}: {
	title: string;
	entityType: TaskEntityType;
	entityId: string;
	/** Ruta a revalidar al completar una tarea (ej. /clientes/123). */
	revalidatePath: string;
	tasks: TaskItem[];
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
			<div className='mb-4 flex items-start justify-between gap-3'>
				<div>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						{title}
					</h2>
				</div>
				<button
					type='button'
					onClick={() => setOpen(v => !v)}
					aria-expanded={open}
					className='secondary-action flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-base font-black transition'
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
			</div>

			{open ? (
				<form
					ref={formRef}
					action={formAction}
					className='mb-4 space-y-3 rounded-lg border border-[color:var(--border-color)] bg-[#f7f2ec] p-4'
				>
					<input type='hidden' name='entityType' value={entityType} />
					<input type='hidden' name='entityId' value={entityId} />
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
				showEntity={false}
				completeRevalidate={revalidatePath}
			/>
		</section>
	);
}
