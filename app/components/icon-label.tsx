"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";

addCollection(materialSymbolsIcons);

export function IconLabel({
	icon = "material-symbols:add-circle-rounded",
	label,
}: {
	icon?: string;
	label: string;
}) {
	return (
		<>
			<Icon icon={icon} className='h-6 w-6 shrink-0' aria-hidden='true' />
			<span>{label}</span>
		</>
	);
}
