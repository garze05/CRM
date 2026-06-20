"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreNoRedirect } from "../lib/actions/details";
import { useToast } from "./toast";
import type { TrashEntityType } from "../lib/server/trash";

export function RestoreButton({
	entityType,
	id,
}: {
	entityType: TrashEntityType;
	id: string;
}) {
	const router = useRouter();
	const { addToast } = useToast();
	const [pending, startTransition] = useTransition();

	function handleClick() {
		startTransition(async () => {
			const { label } = await restoreNoRedirect(entityType, id);
			addToast({
				message: `${label} restaurado exitosamente`,
				type: "success",
			});
			router.refresh();
		});
	}

	return (
		<button
			type='button'
			onClick={handleClick}
			disabled={pending}
			className='secondary-action flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-black transition disabled:opacity-60'
		>
			{pending ? "Restaurando…" : "Restaurar"}
		</button>
	);
}
