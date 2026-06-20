"use client";

import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { addCollection, Icon } from "@iconify/react";
import type { CatalogCategory } from "../lib/domain/catalog";

addCollection(materialSymbolsIcons);

const inventoryCategoryIcons: Record<CatalogCategory, string> = {
	CHARACTER: "material-symbols:theater-comedy-rounded",
	INFLATABLE: "material-symbols:attractions-rounded",
	DECORATION: "material-symbols:celebration-rounded",
	SERVICE: "material-symbols:room-service-rounded",
	OTHER: "material-symbols:widgets-rounded",
};

export function InitialsThumbnail({
	initials,
	size = "sm",
}: {
	initials: string;
	size?: "xs" | "sm" | "profile";
}) {
	const boxSize =
		size === "profile"
			? "h-28 w-28 text-4xl"
			: size === "xs"
				? "h-10 w-10 text-base"
				: "h-14 w-14 text-xl";
	const borderClass =
		size === "profile"
			? "border-4 border-card shadow-[var(--crisp-shadow)]"
			: "border border-card shadow-sm";

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
	category: CatalogCategory;
	size?: "sm" | "lg";
}) {
	const iconSize = size === "lg" ? "h-16 w-16" : "h-10 w-10";
	const boxSize = size === "lg" ? "h-44 w-full" : "h-14 w-14";

	return (
		<div
			className={`grid ${boxSize} shrink-0 place-items-center rounded-lg border border-[color:var(--border-color)] bg-muted text-[var(--primary-color)]`}
			aria-hidden='true'
		>
			<Icon icon={inventoryCategoryIcons[category]} className={iconSize} />
		</div>
	);
}
