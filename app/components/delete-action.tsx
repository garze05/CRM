"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveToTrashNoRedirect, undoTrashAction } from "../lib/actions/details";
import { useToast } from "./toast";
import type { EntityType } from "../lib/server/activity";

addCollection(materialSymbolsIcons);

export function DeleteAction({
	icon = "material-symbols:delete-outline-rounded",
	label = "Eliminar",
	entityType,
	id,
	returnTo,
}: {
	icon?: string;
	label?: string;
	entityType?: Exclude<EntityType, "Task">;
	id?: string;
	returnTo?: string;
}) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	const { addToast } = useToast();

	const disabled = !entityType || !id;

	function handleConfirm() {
		if (!entityType || !id) return;
		startTransition(async () => {
			const { label: entityLabel } = await moveToTrashNoRedirect(entityType, id);
			addToast({
				message: `${entityLabel} enviado a la papelera`,
				type: "trash",
				onUndo: async () => {
					await undoTrashAction(entityType, id);
					router.refresh();
				},
			});
			if (returnTo) router.push(returnTo);
			else router.refresh();
		});
	}

	return (
		<button
			type='button'
			onClick={handleConfirm}
			disabled={disabled || pending}
			className='flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-base font-black text-[var(--primary-color)] transition hover:bg-[#ffe2cf] disabled:cursor-not-allowed disabled:opacity-60'
		>
			<Icon icon={icon} className='h-5 w-5 shrink-0' aria-hidden='true' />
			<span>{pending ? "Eliminando…" : label}</span>
		</button>
	);
}
