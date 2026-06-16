"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";

export type ComboOption = {
	id: string;
	label: string;
	/** Texto contra el que se filtra (nombre, teléfono, tipo…). */
	searchText: string;
};

/**
 * Combobox accesible con búsqueda. Emite el id seleccionado en un input oculto
 * (`name`) para los server actions. Filtra por nombre, teléfono u otros
 * atributos incluidos en `searchText`.
 */
export function ClientCombobox({
	name,
	label,
	options,
	defaultId,
	placeholder = "Buscar por nombre o teléfono…",
}: {
	name: string;
	label: string;
	options: ComboOption[];
	defaultId?: string;
	placeholder?: string;
}) {
	const selectedOption = options.find(o => o.id === defaultId);
	const [selectedId, setSelectedId] = useState(defaultId ?? "");
	const [query, setQuery] = useState(selectedOption?.label ?? "");
	const [open, setOpen] = useState(false);
	const [highlight, setHighlight] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return options.slice(0, 50);
		const tokens = q.split(/\s+/);
		return options
			.filter(o => {
				const hay = o.searchText.toLowerCase();
				return tokens.every(t => hay.includes(t));
			})
			.slice(0, 50);
	}, [query, options]);

	useEffect(() => {
		function onClickOutside(event: MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);

	function select(option: ComboOption) {
		setSelectedId(option.id);
		setQuery(option.label);
		setOpen(false);
	}

	function onKeyDown(event: React.KeyboardEvent) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setOpen(true);
			setHighlight(h => Math.min(h + 1, filtered.length - 1));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setHighlight(h => Math.max(h - 1, 0));
		} else if (event.key === "Enter") {
			if (open && filtered[highlight]) {
				event.preventDefault();
				select(filtered[highlight]);
			}
		} else if (event.key === "Escape") {
			setOpen(false);
		}
	}

	return (
		<div className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
			<label className='block' htmlFor={`${name}-input`}>
				{label}
			</label>
			<div className='relative' ref={containerRef}>
				<input type='hidden' name={name} value={selectedId} />
				<div className='relative'>
					<Icon
						icon='material-symbols:search-rounded'
						className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]'
						aria-hidden='true'
					/>
					<input
						id={`${name}-input`}
						type='text'
						role='combobox'
						aria-expanded={open}
						aria-controls={`${name}-listbox`}
						autoComplete='off'
						value={query}
						placeholder={placeholder}
						onChange={e => {
							setQuery(e.target.value);
							setSelectedId("");
							setOpen(true);
							setHighlight(0);
						}}
						onFocus={() => setOpen(true)}
						onKeyDown={onKeyDown}
						className='search-control'
					/>
				</div>

				{open && filtered.length > 0 ? (
					<ul
						id={`${name}-listbox`}
						role='listbox'
						className='absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] py-1 shadow-[var(--soft-shadow)]'
					>
						{filtered.map((option, index) => (
							<li
								key={option.id}
								role='option'
								aria-selected={option.id === selectedId}
								onMouseDown={e => {
									e.preventDefault();
									select(option);
								}}
								onMouseEnter={() => setHighlight(index)}
								className={`cursor-pointer px-4 py-2 text-base font-bold ${
									index === highlight
										? "bg-[var(--accent-color)] text-[var(--on-accent)]"
										: "text-[var(--text-primary)] hover:bg-[#f0ebe4]"
								}`}
							>
								{option.label}
							</li>
						))}
					</ul>
				) : null}

				{open && query.trim() && filtered.length === 0 ? (
					<div className='absolute z-20 mt-1 w-full rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] px-4 py-3 text-base font-bold text-[var(--text-secondary)] shadow-[var(--soft-shadow)]'>
						Sin coincidencias.
					</div>
				) : null}
			</div>
		</div>
	);
}
