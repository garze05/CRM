"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import type { PackageListItem } from "../lib/server/packages";

addCollection(materialSymbolsIcons);

/** Disclosure nativo con el detalle exacto de ítems que trae un paquete. */
export function PackageItemsDisclosure({
	items,
}: {
	items: PackageListItem[];
}) {
	if (items.length === 0) return null;
	return (
		<details className='group mt-3'>
			<summary className='flex min-h-5 cursor-pointer list-none items-center gap-1 text-base font-black text-[var(--primary-color)] [&::-webkit-details-marker]:hidden'>
				<Icon
					icon='material-symbols:expand-more-rounded'
					className='h-5 w-5 shrink-0 transition group-open:rotate-180'
					aria-hidden='true'
				/>
				Ver ítems incluidos
			</summary>
			<ul className='mt-2 list-none space-y-1 p-0'>
				{items.map(line => (
					<li
						key={line.id}
						className='flex items-baseline justify-between gap-2 text-sm font-semibold text-[var(--text-secondary)]'
					>
						<span className='min-w-0'>
							<span className='font-black text-[var(--text-primary)]'>
								{line.quantity}×
							</span>{" "}
							{line.name}
						</span>
						<span className='shrink-0'>{line.categoryLabel}</span>
					</li>
				))}
			</ul>
		</details>
	);
}
