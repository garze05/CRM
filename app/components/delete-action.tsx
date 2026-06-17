"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import { moveToTrashAction } from "../lib/actions/details";

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
	entityType?: "Client" | "Event" | "Quote" | "CatalogItem" | "Collaborator";
	id?: string;
	returnTo?: string;
}) {
	const button = (
		<button
			type={entityType && id ? "submit" : "button"}
			className='cursor-pointer flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-base font-black text-[var(--primary-color)] transition hover:bg-[#ffe2cf]'
		>
			<Icon
				icon={icon}
				className='h-5 w-5 shrink-0'
				aria-hidden='true'
			/>
			<span>{label}</span>
		</button>
	);

	if (!entityType || !id) return button;

	return (
		<form action={moveToTrashAction}>
			<input type='hidden' name='entityType' value={entityType} />
			<input type='hidden' name='id' value={id} />
			<input type='hidden' name='returnTo' value={returnTo ?? "/"} />
			{button}
		</form>
	);
}
