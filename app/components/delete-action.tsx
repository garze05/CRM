"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";

addCollection(materialSymbolsIcons);

export function DeleteAction() {
	return (
		<button
			type='button'
			className='cursor-pointer flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-base font-black text-[var(--primary-color)] transition hover:bg-[#ffe2cf]'
		>
			<Icon
				icon='material-symbols:delete-outline-rounded'
				className='h-5 w-5 shrink-0'
				aria-hidden='true'
			/>
			<span>Eliminar</span>
		</button>
	);
}
