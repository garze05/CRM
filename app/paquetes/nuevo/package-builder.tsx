"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { useActionState, useMemo, useState } from "react";
import { InventoryThumbnail } from "../../components/entity-thumbnail";
import { formatCrc } from "../../lib/format";
import type { PackageBuilderEntry } from "../../lib/domain/package-builder";
import {
	type DiscountSettings,
	suggestedPackageBasePrice,
} from "../../lib/domain/pricing";
import {
	createPackageAction,
	updatePackageAction,
	type PackageFormState,
} from "../actions";

addCollection(materialSymbolsIcons);

type BuilderLine = {
	entry: PackageBuilderEntry;
	quantity: number;
};

type BuilderSettings = DiscountSettings & { priceRoundingTo: number };

type PackageBuilderProps = {
	entries: PackageBuilderEntry[];
	settings: BuilderSettings;
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

const initialState: PackageFormState = {};

/** Precio mostrado de una entrada (ej. "₡45 000/h" o "₡7 000"). */
function entryPriceLabel(entry: PackageBuilderEntry): string {
	if (entry.unitPrice == null) return "Sin precio";
	return entry.perHour
		? `${formatCrc(entry.unitPrice)}/h`
		: formatCrc(entry.unitPrice);
}

/**
 * Creador y editor de paquetes: compone un paquete con ítems del catálogo y
 * servicios, filtrando por categoría real, mostrando el precio de cada cosa y
 * sumando un precio base sugerido (que el usuario puede ajustar).
 */
export function PackageBuilder({
	entries,
	settings,
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
	const [category, setCategory] = useState<string>("ALL");
	const [lines, setLines] = useState<BuilderLine[]>(initialLines);
	const [name, setName] = useState(initialValues?.name ?? "");
	const [durationHours, setDurationHours] = useState(
		initialValues?.durationHours ?? "",
	);
	// Valor escrito por el usuario; solo se usa una vez que tocó el campo.
	const [basePriceInput, setBasePriceInput] = useState(
		initialValues?.basePrice ?? "",
	);
	const [active, setActive] = useState(initialValues?.active ?? true);
	// En edición arrancamos respetando el precio guardado (no autocompletar);
	// al crear, el precio base sigue al sugerido hasta que el usuario lo toque.
	const [basePriceTouched, setBasePriceTouched] = useState(isEdit);

	// Categorías reales presentes (catálogo primero, luego servicios), con conteo.
	const categoryList = useMemo(() => {
		const counts = new Map<string, { count: number; kind: string }>();
		for (const entry of entries) {
			const current = counts.get(entry.categoryLabel) ?? {
				count: 0,
				kind: entry.kind,
			};
			current.count += 1;
			counts.set(entry.categoryLabel, current);
		}
		return [...counts.entries()]
			.sort((a, b) => {
				if (a[1].kind !== b[1].kind) return a[1].kind === "catalog" ? -1 : 1;
				return a[0].localeCompare(b[0], "es");
			})
			.map(([label, value]) => ({ label, count: value.count }));
	}, [entries]);

	const available = useMemo(() => {
		const query = search.toLowerCase().trim();
		return entries.filter(
			entry =>
				(category === "ALL" || entry.categoryLabel === category) &&
				(query === "" || entry.name.toLowerCase().includes(query)),
		);
	}, [entries, search, category]);

	const addedQuantities = useMemo(() => {
		const map: Record<string, number> = {};
		for (const line of lines) map[line.entry.id] = line.quantity;
		return map;
	}, [lines]);

	const durationValue = Number(durationHours) || 0;

	const suggestedBasePrice = useMemo(
		() =>
			suggestedPackageBasePrice(
				lines.map(line => ({
					groupKey: line.entry.categoryLabel,
					unitPrice: line.entry.unitPrice ?? 0,
					perHour: line.entry.perHour,
					quantity: line.quantity,
				})),
				durationValue,
				settings,
			),
		[lines, durationValue, settings],
	);

	// Precio base mostrado/enviado: mientras el usuario no haya tocado el campo,
	// sigue al sugerido (derivado en render, sin efectos).
	const basePrice = basePriceTouched
		? basePriceInput
		: suggestedBasePrice > 0
			? String(suggestedBasePrice)
			: "";

	function addEntry(entry: PackageBuilderEntry) {
		setLines(current => {
			const existing = current.find(line => line.entry.id === entry.id);
			if (existing) {
				return current.map(line =>
					line.entry.id === entry.id
						? { ...line, quantity: line.quantity + 1 }
						: line,
				);
			}
			return [...current, { entry, quantity: 1 }];
		});
	}

	function changeQuantity(entryId: string, delta: number) {
		setLines(current =>
			current
				.map(line =>
					line.entry.id === entryId
						? { ...line, quantity: line.quantity + delta }
						: line,
				)
				.filter(line => line.quantity > 0),
		);
	}

	const validationIssues: string[] = [];
	if (name.trim() === "") {
		validationIssues.push("El paquete necesita un nombre.");
	}
	if (durationHours.trim() === "" || durationValue <= 0) {
		validationIssues.push("Definí la duración incluida.");
	}
	if (lines.length === 0) {
		validationIssues.push("Agregá al menos un ítem.");
	}
	if (basePrice.trim() === "" || Number(basePrice) <= 0) {
		validationIssues.push("Definí el precio base del paquete.");
	}

	const showSuggestionHint =
		suggestedBasePrice > 0 && Number(basePrice) !== suggestedBasePrice;

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
					key={line.entry.id}
					type='hidden'
					name='item'
					value={`${line.entry.kind}:${line.entry.id}:${line.quantity}`}
				/>
			))}

			<section className='surface-card min-w-0 p-5'>
				<h2 className='text-2xl font-black text-[var(--text-primary)]'>
					Catálogo disponible
				</h2>

				<label className='mt-4 block space-y-2 text-base font-bold text-[var(--text-primary)]'>
					<span>Buscar</span>
					<input
						type='search'
						value={search}
						onChange={event => setSearch(event.target.value)}
						placeholder='Nombre (ej. princesas, sonido)'
						className='form-control'
					/>
				</label>

				<div
					role='group'
					aria-label='Filtrar por categoría'
					className='mt-3 flex flex-wrap gap-2'
				>
					<CategoryChip
						label='Todo'
						count={entries.length}
						active={category === "ALL"}
						onClick={() => setCategory("ALL")}
					/>
					{categoryList.map(item => (
						<CategoryChip
							key={item.label}
							label={item.label}
							count={item.count}
							active={category === item.label}
							onClick={() => setCategory(item.label)}
						/>
					))}
				</div>

				<ul className='mt-4 max-h-[32rem] list-none space-y-2 overflow-y-auto p-0 pr-1'>
					{available.length === 0 ? (
						<li className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-base font-bold text-[var(--text-secondary)]'>
							Sin resultados.
						</li>
					) : (
						available.map(entry => {
							const addedQty = addedQuantities[entry.id] ?? 0;
							return (
								<li
									key={entry.id}
									className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-2.5'
								>
									<InventoryThumbnail category={entry.catalogCategory} />
									<div className='min-w-0 flex-1'>
										<p className='truncate font-black text-[var(--text-primary)]'>
											{entry.name}
										</p>
										<p className='text-sm font-semibold text-[var(--text-secondary)]'>
											{entry.categoryLabel} ·{" "}
											<span className='font-black text-[var(--primary-color)]'>
												{entryPriceLabel(entry)}
											</span>
										</p>
									</div>
									{addedQty > 0 ? (
										<span className='shrink-0 rounded-full bg-[color-mix(in_srgb,var(--secondary-color)_20%,transparent)] px-2.5 py-1 text-sm font-black text-[var(--secondary-color)]'>
											×{addedQty}
										</span>
									) : null}
									<button
										type='button'
										onClick={() => addEntry(entry)}
										className='secondary-action flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition'
										aria-label={`Agregar ${entry.name}`}
									>
										<Icon
											icon='material-symbols:add-circle-rounded'
											className='h-6 w-6 shrink-0'
											aria-hidden='true'
										/>
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
					<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
						<span>Nombre del paquete</span>
						<input
							name='name'
							value={name}
							onChange={event => setName(event.target.value)}
							placeholder='Ej. Fiesta Premium'
							className='form-control'
						/>
					</label>

					<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
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
						<p className='mb-2 text-base font-bold text-[var(--text-primary)]'>
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
										key={line.entry.id}
										className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] px-3 py-2'
									>
										<div className='min-w-0 flex-1'>
											<p className='truncate font-black text-[var(--text-primary)]'>
												{line.entry.name}
											</p>
											<p className='text-sm font-semibold text-[var(--text-secondary)]'>
												{entryPriceLabel(line.entry)}
											</p>
										</div>
										<div className='flex items-center gap-1'>
											<button
												type='button'
												onClick={() => changeQuantity(line.entry.id, -1)}
												className='grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border-color)] text-lg font-black transition hover:bg-muted'
												aria-label={`Quitar uno de ${line.entry.name}`}
											>
												−
											</button>
											<span
												className='w-8 text-center text-lg font-black text-[var(--text-primary)]'
												aria-label={`Cantidad de ${line.entry.name}`}
											>
												{line.quantity}
											</span>
											<button
												type='button'
												onClick={() => changeQuantity(line.entry.id, 1)}
												className='grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border-color)] text-lg font-black transition hover:bg-muted'
												aria-label={`Agregar uno de ${line.entry.name}`}
											>
												+
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>

					<div className='space-y-2'>
						<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
							<span>Precio base (₡)</span>
							<input
								type='number'
								name='basePrice'
								min='0'
								value={basePrice}
								onChange={event => {
									setBasePriceTouched(true);
									setBasePriceInput(event.target.value);
								}}
								placeholder='150000'
								className='form-control'
							/>
						</label>
						{suggestedBasePrice > 0 ? (
							<div className='flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-[var(--text-secondary)]'>
								<span>
									Precio sugerido (suma de ítems con descuentos):{" "}
									<span className='font-black text-[var(--text-primary)]'>
										{formatCrc(suggestedBasePrice)}
									</span>
								</span>
								{showSuggestionHint ? (
									<button
										type='button'
										onClick={() => setBasePriceTouched(false)}
										className='secondary-action flex min-h-9 items-center rounded-full px-3 py-1 text-sm font-black transition'
									>
										Usar sugerido
									</button>
								) : null}
							</div>
						) : null}
						<p className='text-sm font-semibold text-[var(--text-secondary)]'>
							El recargo por tipo de cliente (escuela, empresa, agencia…) se
							aplica automáticamente sobre este precio según los Ajustes.
						</p>
					</div>

					{isEdit ? (
						<label className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 text-base font-bold text-[var(--text-primary)]'>
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

function CategoryChip({
	label,
	count,
	active,
	onClick,
}: {
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			aria-pressed={active}
			className={`min-h-11 rounded-full border px-4 py-2 text-base font-black transition ${
				active
					? "border-transparent bg-[var(--accent-color)] text-[var(--on-accent)]"
					: "border-[color:var(--border-color)] bg-[var(--surface-color)] text-[var(--text-secondary)] hover:bg-muted"
			}`}
		>
			{label}
			<span className='ml-1.5 font-bold opacity-80'>({count})</span>
		</button>
	);
}
