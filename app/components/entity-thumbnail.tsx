"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import type { InventoryCategory } from "../lib/mock-data";

addCollection(materialSymbolsIcons);

const inventoryCategoryIcons: Record<InventoryCategory, string> = {
	PERSONAJE: "material-symbols:theater-comedy-rounded",
	INFLABLE: "material-symbols:attractions-rounded",
	DECORACION: "material-symbols:celebration-rounded",
	OTRO: "material-symbols:widgets-rounded",
};

export function InitialsThumbnail({
	initials,
	size = "sm",
}: {
	initials: string;
	size?: "sm" | "profile";
}) {
	const boxSize =
		size === "profile" ? "h-28 w-28 text-4xl" : "h-14 w-14 text-xl";
	const borderClass =
		size === "profile"
			? "border-4 border-white shadow-[var(--crisp-shadow)]"
			: "border border-white shadow-sm";

	return (
		<div
			className={`grid ${boxSize} ${borderClass} shrink-0 place-items-center rounded-full bg-[var(--accent-color)] font-black uppercase text-[var(--on-accent)]`}
			aria-hidden='true'
		>
			{initials}
		</div>
	);
}

export function InventoryThumbnail({
	category,
	size = "sm",
}: {
	category: InventoryCategory;
	size?: "sm" | "lg";
}) {
	const iconSize = size === "lg" ? "h-16 w-16" : "h-10 w-10";
	const boxSize = size === "lg" ? "h-44 w-full" : "h-14 w-14";

	return (
		<div
			className={`grid ${boxSize} shrink-0 place-items-center rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] text-[var(--primary-color)]`}
			aria-hidden='true'
		>
			<Icon icon={inventoryCategoryIcons[category]} className={iconSize} />
		</div>
	);
}
