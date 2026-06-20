"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { useActionState, useMemo, useState } from "react";
import { InventoryThumbnail } from "../../components/entity-thumbnail";
import { StatusBadge } from "../../components/status-badge";
import {
	CATALOG_CATEGORY_LABELS,
	type CatalogCategory,
	type CatalogListItem,
} from "../../lib/domain/catalog";
import {
	createPackageAction,
	updatePackageAction,
	type PackageFormState,
} from "../actions";

addCollection(materialSymbolsIcons);

type BuilderLine = {
	item: CatalogListItem;
	quantity: number;
};

type CategoryFilter = CatalogCategory | "ALL";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
	{ value: "ALL", label: "Todo" },
	{ value: "CHARACTER", label: "Personajes" },
	{ value: "INFLATABLE", label: "Inflables" },
	{ value: "DECORATION", label: "Decoración" },
	{ value: "SERVICE", label: "Servicios" },
	{ value: "OTHER", label: "Otros" },
];

type PackageBuilderProps = {
	catalog: CatalogListItem[];
	mode?: "create" | "edit";
	packageId?: string;
	initialLines?: BuilderLine[];
	initialValues?: {
		name: string;
		durationHours: string;
		basePrice: string;
		active: boolean;
	};
};

/**
 * Creador y editor de paquetes: compone un paquete seleccionando ítems del
 * catálogo, con filtro por categoría (personajes, inflables, etc.) y búsqueda.
 */
const initialState: PackageFormState = {};

export function PackageBuilder({
	catalog,
	mode = "create",
	packageId,
	initialLines = [],
	initialValues,
}: PackageBuilderProps) {
	const isEdit = mode === "edit";
	const [state, formAction, pending] = useActionState(
		isEdit ? updatePackageAction : createPackageAction,
		initialState,
	);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<CategoryFilter>("ALL");
	const [lines, setLines] = useState<BuilderLine[]>(initialLines);
	const [name, setName] = useState(initialValues?.name ?? "");
	const [durationHours, setDurationHours] = useState(
		initialValues?.durationHours ?? "",
	);
	const [basePrice, setBasePrice] = useState(initialValues?.basePrice ?? "");
	const [active, setActive] = useState(initialValues?.active ?? true);

	// Conteo por categoría para mostrar cuántos ítems hay en cada filtro.
	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const item of catalog) {
			if (!item.active) continue;
			counts[item.category] = (counts[item.category] ?? 0) + 1;
		}
		return counts;
	}, [catalog]);

	const available = useMemo(() => {
		const query = search.toLowerCase().trim();
		return catalog.filter(
			item =>
				item.active &&
				(category === "ALL" || item.category === category) &&
				(query === "" ||
					item.name.toLowerCase().includes(query) ||
					item.tags.some(tag => tag.toLowerCase().includes(query))),
		);
	}, [catalog, search, category]);

	function addItem(item: CatalogListItem) {
		setLines(current => {
			const existing = current.find(line => line.item.id === item.id);
			if (existing) {
				return current.map(line =>
					line.item.id === item.id
						? { ...line, quantity: line.quantity + 1 }
						: line,
				);
			}
			return [...current, { item, quantity: 1 }];
		});
	}

	function changeQuantity(itemId: string, delta: number) {
		setLines(current =>
			current
				.map(line =>
					line.item.id === itemId
						? { ...line, quantity: line.quantity + delta }
						: line,
				)
				.filter(line => line.quantity > 0),
		);
	}

	const addedQuantities = useMemo(() => {
		const map: Record<string, number> = {};
		for (const line of lines) map[line.item.id] = line.quantity;
		return map;
	}, [lines]);

	const validationIssues: string[] = [];
	if (name.trim() === "") {
		validationIssues.push("El paquete necesita un nombre.");
	}
	if (durationHours.trim() === "" || Number(durationHours) <= 0) {
		validationIssues.push("Definí la duración incluida.");
	}
	if (lines.length === 0) {
		validationIssues.push("Agregá al menos un ítem del catálogo.");
	}
	if (basePrice.trim() === "" || Number(basePrice) <= 0) {
		validationIssues.push(
			"Definí el precio base del paquete (el recargo por tipo de cliente se aplica automáticamente).",
		);
	}

	return (
		<form
			action={formAction}
			className='grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
		>
			{isEdit && packageId ? (
				<input type='hidden' name='packageId' value={packageId} />
			) : null}
			{lines.map(line => (
				<input
					key={line.item.id}
					type='hidden'
					name='catalogItemId'
					value={line.item.id}
				/>
			))}
			{lines.map(line => (
				<input
					key={`${line.item.id}-quantity`}
					type='hidden'
					name={`quantity:${line.item.id}`}
					value={line.quantity}
				/>
			))}
			<section className='surface-card min-w-0 p-5'>
				<h2 className='text-2xl font-black text-[var(--text-primary)]'>
					Catálogo disponible
				</h2>

				<label className='mt-4 block space-y-2 text-lg font-bold text-[var(--text-primary)]'>
					<span>Buscar en el catálogo</span>
					<input
						type='search'
						value={search}
						onChange={event => setSearch(event.target.value)}
						placeholder='Nombre o etiqueta (ej. princesas)'
						className='form-control'
					/>
				</label>

				<div
					role='group'
					aria-label='Filtrar por categoría'
					className='mt-4 flex flex-wrap gap-2'
				>
					{CATEGORY_FILTERS.map(filter => {
						const isActive = category === filter.value;
						const count =
							filter.value === "ALL"
								? catalog.filter(item => item.active).length
								: (categoryCounts[filter.value] ?? 0);
						return (
							<button
								key={filter.value}
								type='button'
								onClick={() => setCategory(filter.value)}
								aria-pressed={isActive}
								className={`min-h-11 rounded-full border px-4 py-2 text-base font-black transition ${
									isActive
										? "border-transparent bg-[var(--accent-color)] text-[var(--on-accent)]"
										: "border-[color:var(--border-color)] bg-[var(--surface-color)] text-[var(--text-secondary)] hover:bg-muted"
								}`}
							>
								{filter.label}
								<span className='ml-1.5 font-bold opacity-80'>({count})</span>
							</button>
						);
					})}
				</div>

				<ul className='mt-4 list-none space-y-3 p-0'>
					{available.length === 0 ? (
						<li className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
							Sin resultados en el catálogo.
						</li>
					) : (
						available.map(item => {
							const addedQty = addedQuantities[item.id] ?? 0;
							return (
								<li
									key={item.id}
									className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-3'
								>
									<InventoryThumbnail category={item.category} />
									<div className='min-w-0 flex-1'>
										<p className='font-black text-[var(--text-primary)]'>
											{item.name}
										</p>
										<StatusBadge
											value={item.category}
											label={CATALOG_CATEGORY_LABELS[item.category]}
										/>
									</div>
									{addedQty > 0 ? (
										<span className='shrink-0 rounded-full bg-[color-mix(in_srgb,var(--secondary-color)_20%,transparent)] px-3 py-1 text-sm font-black text-[var(--secondary-color)]'>
											{addedQty} agregado{addedQty > 1 ? "s" : ""}
										</span>
									) : null}
									<button
										type='button'
										onClick={() => addItem(item)}
										className='secondary-action flex min-h-11 shrink-0 items-center gap-1 rounded-full px-4 py-2 text-base font-black transition'
									>
										<Icon
											icon='material-symbols:add-circle-rounded'
											className='h-5 w-5 shrink-0'
											aria-hidden='true'
										/>
										<span>Agregar</span>
									</button>
								</li>
							);
						})
					)}
				</ul>
			</section>

			<section className='surface-card min-w-0 p-5'>
				<h2 className='text-2xl font-black text-[var(--text-primary)]'>
					Composición del paquete
				</h2>

				<div className='mt-4 grid gap-4'>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Nombre del paquete</span>
						<input
							name='name'
							value={name}
							onChange={event => setName(event.target.value)}
							placeholder='Ej. Fiesta Premium'
							className='form-control'
						/>
					</label>

					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Duración incluida (horas)</span>
						<input
							name='durationHours'
							type='number'
							min='0.5'
							step='0.5'
							value={durationHours}
							onChange={event => setDurationHours(event.target.value)}
							placeholder='3'
							className='form-control'
						/>
					</label>

					<div>
						<p className='mb-2 text-lg font-bold text-[var(--text-primary)]'>
							Ítems incluidos
						</p>
						{lines.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-base font-bold text-[var(--text-secondary)]'>
								Todavía no hay ítems. Agregalos desde el catálogo.
							</p>
						) : (
							<ul className='list-none space-y-2 p-0'>
								{lines.map(line => (
									<li
										key={line.item.id}
										className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] px-3 py-2'
									>
										<p className='min-w-0 flex-1 truncate font-black text-[var(--text-primary)]'>
											{line.item.name}
										</p>
										<div className='flex items-center gap-1'>
											<button
												type='button'
												onClick={() => changeQuantity(line.item.id, -1)}
												className='grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border-color)] text-lg font-black transition hover:bg-muted'
												aria-label={`Quitar uno de ${line.item.name}`}
											>
												−
											</button>
											<span
												className='w-8 text-center text-lg font-black text-[var(--text-primary)]'
												aria-label={`Cantidad de ${line.item.name}`}
											>
												{line.quantity}
											</span>
											<button
												type='button'
												onClick={() => changeQuantity(line.item.id, 1)}
												className='grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border-color)] text-lg font-black transition hover:bg-muted'
												aria-label={`Agregar uno de ${line.item.name}`}
											>
												+
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>

					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Precio base (₡)</span>
						<input
							type='number'
							name='basePrice'
							min='0'
							value={basePrice}
							onChange={event => setBasePrice(event.target.value)}
							placeholder='150000'
							className='form-control'
						/>
						<span className='block text-sm font-semibold text-[var(--text-secondary)]'>
							El recargo por tipo de cliente (escuela, empresa, agencia…) se
							aplica automáticamente sobre este precio según los Ajustes.
						</span>
					</label>

					{isEdit ? (
						<label className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 text-lg font-bold text-[var(--text-primary)]'>
							<input
								type='checkbox'
								name='active'
								checked={active}
								onChange={event => setActive(event.target.checked)}
								className='h-5 w-5 shrink-0 accent-[var(--accent-color)]'
							/>
							<span>
								Paquete activo
								<span className='block text-sm font-semibold text-[var(--text-secondary)]'>
									Los paquetes pausados no se ofrecen en cotizaciones nuevas.
								</span>
							</span>
						</label>
					) : null}

					{validationIssues.length > 0 ? (
						<ul
							className='list-none space-y-1 rounded-lg bg-[color-mix(in_srgb,var(--tertiary-color)_30%,transparent)] p-4 text-base font-bold text-[var(--warning-color)]'
							aria-label='Pendientes para completar el paquete'
						>
							{validationIssues.map(issue => (
								<li key={issue} className='flex items-center gap-2'>
									<Icon
										icon='material-symbols:info-rounded'
										className='h-5 w-5 shrink-0'
										aria-hidden='true'
									/>
									<span>{issue}</span>
								</li>
							))}
						</ul>
					) : (
						<p className='flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--secondary-color)_20%,transparent)] p-4 text-base font-black text-[var(--secondary-color)]'>
							<Icon
								icon='material-symbols:check-circle-rounded'
								className='h-5 w-5 shrink-0'
								aria-hidden='true'
							/>
							<span>Paquete completo y listo para guardar.</span>
						</p>
					)}

					{state.error ? (
						<p className='rounded-lg bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] p-4 text-base font-bold text-[var(--error-color)]'>
							{state.error}
						</p>
					) : null}

					<button
						type='submit'
						disabled={pending || validationIssues.length > 0}
						className='primary-action min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:cursor-not-allowed disabled:opacity-50'
					>
						{pending
							? "Guardando…"
							: isEdit
								? "Guardar cambios"
								: "Guardar paquete"}
					</button>
				</div>
			</section>
		</form>
	);
}
