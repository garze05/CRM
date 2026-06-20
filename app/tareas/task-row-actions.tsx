"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { Button } from "../components/ui/button";
import {
	completeTaskAction,
	deleteTaskAction,
	reopenTaskAction,
} from "../lib/actions/tasks";

addCollection(materialSymbolsIcons);

/** Check circular para completar (vacío) o reabrir (lleno) una tarea. */
export function TaskCheckButton({
	taskId,
	title,
	completed,
	revalidate = "/tareas",
}: {
	taskId: string;
	title: string;
	completed: boolean;
	revalidate?: string;
}) {
	return (
		<form action={completed ? reopenTaskAction : completeTaskAction}>
			<input type='hidden' name='taskId' value={taskId} />
			<input type='hidden' name='revalidate' value={revalidate} />
			<Button
				type='submit'
				variant='ghost'
				size='icon'
				aria-label={
					completed
						? `Marcar como pendiente: ${title}`
						: `Marcar como completada: ${title}`
				}
				className='group/check shrink-0 hover:bg-transparent'
			>
				{completed ? (
					<span className='grid h-6 w-6 place-items-center rounded-full bg-[var(--secondary-color)] text-[var(--secondary-foreground)]'>
						<Icon icon='material-symbols:check-rounded' className='h-4 w-4' />
					</span>
				) : (
					<span className='grid h-6 w-6 place-items-center rounded-full border-2 border-[color:var(--border-color)] text-transparent transition group-hover/check:border-[var(--secondary-color)] group-hover/check:text-[var(--secondary-color)]'>
						<Icon icon='material-symbols:check-rounded' className='h-4 w-4' />
					</span>
				)}
			</Button>
		</form>
	);
}

/** Botón de eliminar (borrado lógico) con confirmación. */
export function TaskDeleteButton({
	taskId,
	title,
	revalidate = "/tareas",
	redirectToList = false,
}: {
	taskId: string;
	title: string;
	revalidate?: string;
	/** Tras eliminar, navegar al listado (para la pantalla de edición). */
	redirectToList?: boolean;
}) {
	return (
		<form
			action={deleteTaskAction}
			onSubmit={event => {
				if (!window.confirm(`¿Eliminar la tarea "${title}"?`)) {
					event.preventDefault();
				}
			}}
		>
			<input type='hidden' name='taskId' value={taskId} />
			<input type='hidden' name='revalidate' value={revalidate} />
			{redirectToList ? (
				<input type='hidden' name='redirectToList' value='1' />
			) : null}
			<Button
				type='submit'
				variant='ghost'
				size='sm'
				className='gap-1 px-2.5 text-[var(--error-color)] hover:bg-[color-mix(in_srgb,var(--error-color)_12%,transparent)] hover:text-[var(--error-color)]'
			>
				<Icon
					icon='material-symbols:delete-outline-rounded'
					className='h-4 w-4 shrink-0'
					aria-hidden='true'
				/>
				Eliminar
			</Button>
		</form>
	);
}
