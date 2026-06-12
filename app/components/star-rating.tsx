"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { useId, useState } from "react";

addCollection(materialSymbolsIcons);

/**
 * Calificación 1–5 con estrellas. Accesible: en modo edición es un radiogroup
 * navegable por teclado; en modo lectura expone el valor como texto.
 * `value` null se muestra como "Sin calificación", nunca como 0.
 */
export function StarRating({
	value,
	label = "Calificación",
	readOnly = false,
	name,
	size = "md",
}: {
	value: number | null;
	label?: string;
	readOnly?: boolean;
	/** Nombre del campo (radios) cuando es editable. */
	name?: string;
	size?: "sm" | "md";
}) {
	const groupId = useId();
	const [current, setCurrent] = useState<number | null>(value);
	const starClass = size === "sm" ? "h-5 w-5" : "h-7 w-7";

	if (readOnly) {
		return (
			<span
				className='inline-flex items-center gap-1'
				role='img'
				aria-label={
					value === null ? "Sin calificación" : `${label}: ${value} de 5`
				}
			>
				{value === null ? (
					<span className='text-base font-bold text-[var(--text-muted)]'>
						Sin calificación
					</span>
				) : (
					<>
						{[1, 2, 3, 4, 5].map(star => (
							<Icon
								key={star}
								icon={
									star <= value
										? "material-symbols:star-rounded"
										: "material-symbols:star-outline-rounded"
								}
								className={`${starClass} ${
									star <= value
										? "text-[var(--tertiary-color)]"
										: "text-[var(--text-muted)]"
								}`}
								aria-hidden='true'
							/>
						))}
						<span className='ml-1 text-base font-black text-[var(--text-primary)]'>
							{value} / 5
						</span>
					</>
				)}
			</span>
		);
	}

	return (
		<fieldset className='border-0 p-0'>
			<legend className='mb-1 text-base font-bold text-[var(--text-primary)]'>
				{label}
			</legend>
			<div className='flex items-center gap-1'>
				{[1, 2, 3, 4, 5].map(star => {
					const checked = current === star;
					const filled = current !== null && star <= current;

					return (
						<label key={star} className='cursor-pointer'>
							<input
								type='radio'
								name={name ?? groupId}
								value={star}
								checked={checked}
								onChange={() => setCurrent(star)}
								className='sr-only'
							/>
							<Icon
								icon={
									filled
										? "material-symbols:star-rounded"
										: "material-symbols:star-outline-rounded"
								}
								className={`${starClass} transition ${
									filled
										? "text-[var(--tertiary-color)]"
										: "text-[var(--text-muted)] hover:text-[var(--tertiary-color)]"
								}`}
								aria-hidden='true'
							/>
							<span className='sr-only'>
								{star} {star === 1 ? "estrella" : "estrellas"}
							</span>
						</label>
					);
				})}
				<span className='ml-2 text-base font-bold text-[var(--text-secondary)]'>
					{current === null ? "Sin calificación" : `${current} / 5`}
				</span>
			</div>
		</fieldset>
	);
}
