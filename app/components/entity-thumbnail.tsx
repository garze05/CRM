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

export function CollaboratorThumbnail({
	size = "sm",
}: {
	size?: "sm" | "lg" | "profile";
}) {
	const iconSize = size === "sm" ? "h-10 w-10" : "h-16 w-16";
	const boxSize =
		size === "profile" ? "h-28 w-28 rounded-full" : size === "lg" ? "h-24 w-24 rounded-lg" : "h-14 w-14 rounded-lg";

	return (
		<div
			className={`grid ${boxSize} shrink-0 place-items-center border border-[color:var(--border-color)] bg-[#f0ebe4] text-[var(--primary-color)]`}
			aria-hidden='true'
		>
			<Icon icon='material-symbols:person-rounded' className={iconSize} />
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
