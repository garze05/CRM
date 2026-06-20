"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveToTrashNoRedirect, undoTrashAction } from "../lib/actions/details";
import { useToast } from "./toast";
import type { EntityType } from "../lib/server/activity";

export function TrashButton({
	entityType,
	id,
	returnTo = "/",
}: {
	entityType: Exclude<EntityType, "Task">;
	id: string;
	returnTo?: string;
}) {
	const router = useRouter();
	const { addToast } = useToast();
	const [pending, startTransition] = useTransition();

	function handleClick() {
		startTransition(async () => {
			const { label } = await moveToTrashNoRedirect(entityType, id);
			addToast({
				message: `${label} enviado a la papelera`,
				type: "trash",
				onUndo: async () => {
					await undoTrashAction(entityType, id);
					router.refresh();
				},
			});
			router.push(returnTo);
		});
	}

	return (
		<button
			type='button'
			onClick={handleClick}
			disabled={pending}
			className='secondary-action min-h-12 rounded-full px-5 py-3 text-base font-black text-[var(--error-color)] transition disabled:opacity-60'
		>
			{pending ? "Eliminando…" : "Eliminar"}
		</button>
	);
}
