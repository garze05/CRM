"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { useToast } from "../components/toast";
import {
	moveToTrashNoRedirect,
	undoTrashAction,
} from "../lib/actions/details";
import { completeTaskAction, reopenTaskAction } from "../lib/actions/tasks";

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

/**
 * Botón de eliminar (borrado lógico → papelera) con aviso arriba a la derecha y
 * opción de deshacer, igual que el resto de pantallas. No usa el confirm nativo.
 */
export function TaskDeleteButton({
	taskId,
	title,
	redirectToList = false,
}: {
	taskId: string;
	title: string;
	/** Tras eliminar, navegar al listado (para la pantalla de edición). */
	redirectToList?: boolean;
}) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	const { addToast } = useToast();

	function handleDelete() {
		startTransition(async () => {
			const { label } = await moveToTrashNoRedirect("Task", taskId);
			addToast({
				message: `Tarea "${label}" enviada a la papelera`,
				type: "trash",
				onUndo: async () => {
					await undoTrashAction("Task", taskId);
					router.refresh();
				},
			});
			if (redirectToList) router.push("/tareas");
			else router.refresh();
		});
	}

	return (
		<Button
			type='button'
			onClick={handleDelete}
			disabled={pending}
			variant='ghost'
			size='sm'
			aria-label={`Eliminar tarea: ${title}`}
			className='gap-1 px-2.5 text-[var(--error-color)] hover:bg-[color-mix(in_srgb,var(--error-color)_12%,transparent)] hover:text-[var(--error-color)]'
		>
			<Icon
				icon='material-symbols:delete-outline-rounded'
				className='h-4 w-4 shrink-0'
				aria-hidden='true'
			/>
			{pending ? "Eliminando…" : "Eliminar"}
		</Button>
	);
}
