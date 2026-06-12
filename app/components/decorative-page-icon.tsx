"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";

addCollection(materialSymbolsIcons);

export function DecorativePageIcon({ icon }: { icon: string }) {
	return (
		<div
			className='pointer-events-none absolute right-2 top-1/2 z-0 hidden -translate-y-1/2 rotate-[-12deg] text-[var(--primary-color)] opacity-[0.055] md:block xl:right-12'
			aria-hidden='true'
		>
			<Icon icon={icon} className='h-52 w-52 xl:h-64 xl:w-64' />
		</div>
	);
}
