"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";

addCollection(materialSymbolsIcons);

export function InlineIconText({
	icon,
	text,
	className = "",
}: {
	icon: string;
	text: string;
	className?: string;
}) {
	return (
		<span className={`inline-flex items-center gap-1.5 ${className}`}>
			<Icon icon={icon} className='h-4 w-4 shrink-0' aria-hidden='true' />
			<span>{text}</span>
		</span>
	);
}
