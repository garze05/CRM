"use client";

import { useState, useTransition } from "react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { deletePermanentlyNoRedirect } from "../lib/actions/details";
import { useToast } from "./toast";
import type { TrashEntityType } from "../lib/server/trash";

addCollection(materialSymbolsIcons);

export function PermanentDeleteAction({
	entityType,
	id,
	name,
}: {
	entityType: TrashEntityType;
	id: string;
	name: string;
}) {
	const [open, setOpen] = useState(false);
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	const { addToast } = useToast();

	function handleConfirm() {
		startTransition(async () => {
			const result = await deletePermanentlyNoRedirect(entityType, id);
			setOpen(false);
			if (result) {
				addToast({ message: `${result.label} eliminado definitivamente`, type: "error" });
			}
			router.refresh();
		});
	}

	const modal =
		open && typeof document !== "undefined" ? (
			<div className='fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-black/45 px-4'>
				<div
					role='dialog'
					aria-modal='true'
					aria-labelledby={`delete-forever-title-${id}`}
					className='w-full max-w-md rounded-lg border border-[color:var(--border-color)] bg-[var(--card-color)] p-5 shadow-[var(--soft-shadow)]'
				>
					<div className='flex items-start gap-3'>
						<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] text-[var(--error-color)]'>
							<Icon
								icon='material-symbols:warning-rounded'
								className='h-6 w-6'
								aria-hidden='true'
							/>
						</div>
						<div>
							<h2
								id={`delete-forever-title-${id}`}
								className='text-xl font-black text-[var(--text-primary)]'
							>
								Eliminar definitivamente
							</h2>
							<p className='mt-2 text-base font-semibold leading-snug text-[var(--text-secondary)]'>
								{name} ya no se va a poder recuperar después de esta acción.
							</p>
						</div>
					</div>

					<div className='mt-5 flex flex-wrap justify-end gap-2'>
						<button
							type='button'
							onClick={() => setOpen(false)}
							disabled={pending}
							className='secondary-action min-h-11 rounded-full px-4 py-2 text-base font-black disabled:opacity-60'
						>
							Cancelar
						</button>
						<button
							type='button'
							onClick={handleConfirm}
							disabled={pending}
							className='min-h-11 rounded-full bg-[var(--error-color)] px-4 py-2 text-base font-black text-destructive-foreground transition hover:brightness-95 disabled:opacity-60'
						>
							{pending ? "Eliminando…" : "Eliminar definitivamente"}
						</button>
					</div>
				</div>
			</div>
		) : null;

	return (
		<>
			<button
				type='button'
				onClick={() => setOpen(true)}
				className='flex min-h-10 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error-color)_38%,var(--border-color))] bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)] px-3 py-2 text-sm font-black text-[var(--error-color)] transition hover:bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)]'
			>
				<Icon
					icon='material-symbols:delete-forever-outline-rounded'
					className='h-5 w-5 shrink-0'
					aria-hidden='true'
				/>
				<span>Eliminar definitivamente</span>
			</button>

			{modal ? createPortal(modal, document.body) : null}
		</>
	);
}
