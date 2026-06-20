"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import Link from "next/link";
import { Button } from "./ui/button";
import { DateTimeField } from "./date-time-field";
import { TaskList } from "./task-list";
import { createTaskAction, type QuickTaskState } from "../lib/actions/tasks";
import type { TaskItem } from "../lib/server/tasks";

addCollection(materialSymbolsIcons);

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
			<div className='mb-4 flex items-start justify-between gap-3'>
				<h2 className='min-w-0 text-2xl font-black text-[var(--text-primary)]'>
					{title}
				</h2>
				{viewAllHref ? (
					<Button asChild variant='ghost' size='sm' className='shrink-0'>
						<Link href={viewAllHref}>Ver todas</Link>
					</Button>
				) : null}
			</div>

			<TaskList
				tasks={tasks}
				showEntity={showEntity}
				completeRevalidate={revalidatePath}
			/>

			{open ? (
				<form
					ref={formRef}
					action={formAction}
					className='mt-4 space-y-3 rounded-lg border border-[color:var(--border-color)] bg-muted p-4'
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
					<DateTimeField
						dateName='dueDate'
						timeName='dueTime'
						dateLabel='Fecha límite'
						timeLabel='Hora'
						optional
					/>
					{state.error ? (
						<p className='text-sm font-bold text-[var(--error-color)]'>
							{state.error}
						</p>
					) : null}
					<div className='flex flex-wrap justify-end gap-2'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={() => setOpen(false)}
						>
							Cancelar
						</Button>
						<Button type='submit' size='sm' disabled={pending}>
							{pending ? "Guardando…" : "Guardar tarea"}
						</Button>
					</div>
				</form>
			) : (
				<Button
					type='button'
					variant='outline'
					onClick={() => setOpen(true)}
					className='mt-4 w-full border-dashed text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
				>
					<Icon
						icon='material-symbols:add-task-rounded'
						className='h-5 w-5 shrink-0'
						aria-hidden='true'
					/>
					Nueva tarea manual
				</Button>
			)}
		</section>
	);
}
