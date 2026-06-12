"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { useMemo, useState } from "react";
import { InventoryThumbnail } from "../../components/entity-thumbnail";
import { StatusBadge } from "../../components/status-badge";
import type { InventoryItem } from "../../lib/mock-data";

addCollection(materialSymbolsIcons);

type BuilderLine = {
	item: InventoryItem;
	quantity: number;
};

/**
 * Creador de paquetes: compone un paquete seleccionando ítems del catálogo.
 * Interactivo en el cliente; el guardado real llega con los server actions
 * de la fase 11 (los datos componen el payload de `PackageItem`).
 */
export function PackageBuilder({ catalog }: { catalog: InventoryItem[] }) {
	const [search, setSearch] = useState("");
	const [lines, setLines] = useState<BuilderLine[]>([]);
	const [name, setName] = useState("");
	const [priceFamily, setPriceFamily] = useState("");
	const [priceEducational, setPriceEducational] = useState("");
	const [priceCorporate, setPriceCorporate] = useState("");

	const available = useMemo(() => {
		const query = search.toLowerCase().trim();
		return catalog.filter(
			item =>
				item.active &&
				(query === "" ||
					item.name.toLowerCase().includes(query) ||
					item.tags.some(tag => tag.toLowerCase().includes(query))),
		);
	}, [catalog, search]);

	function addItem(item: InventoryItem) {
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

	const validationIssues: string[] = [];
	if (name.trim() === "") {
		validationIssues.push("El paquete necesita un nombre.");
	}
	if (lines.length === 0) {
		validationIssues.push("Agregá al menos un ítem del catálogo.");
	}
	if (
		[priceFamily, priceEducational, priceCorporate].some(
			price => price.trim() === "" || Number(price) <= 0,
		)
	) {
		validationIssues.push(
			"Definí los tres precios (familiar, educativo y corporativo).",
		);
	}

	return (
		<div className='grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
			<section className='surface-card min-w-0 p-5'>
				<h2 className='text-2xl font-black text-[var(--text-primary)]'>
					Catálogo disponible
				</h2>
				<p className='mt-1 text-lg text-[var(--text-secondary)]'>
					Buscá y agregá personajes, inflables o decoración al paquete.
				</p>

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

				<ul className='mt-4 list-none space-y-3 p-0'>
					{available.length === 0 ? (
						<li className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
							Sin resultados en el catálogo.
						</li>
					) : (
						available.map(item => (
							<li
								key={item.id}
								className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-3'
							>
								<InventoryThumbnail category={item.category} />
								<div className='min-w-0 flex-1'>
									<p className='font-black text-[var(--text-primary)]'>
										{item.name}
									</p>
									<StatusBadge value={item.category} />
								</div>
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
						))
					)}
				</ul>
			</section>

			<section className='surface-card min-w-0 p-5'>
				<h2 className='text-2xl font-black text-[var(--text-primary)]'>
					Composición del paquete
				</h2>
				<p className='mt-1 text-lg text-[var(--text-secondary)]'>
					Nombre, contenido y precio por tipo de cliente.
				</p>

				<div className='mt-4 grid gap-4'>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Nombre del paquete</span>
						<input
							value={name}
							onChange={event => setName(event.target.value)}
							placeholder='Ej. Fiesta Premium'
							className='form-control'
						/>
					</label>

					<div>
						<p className='mb-2 text-lg font-bold text-[var(--text-primary)]'>
							Ítems incluidos
						</p>
						{lines.length === 0 ? (
							<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-5 text-center text-base font-bold text-[var(--text-secondary)]'>
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
												className='grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border-color)] text-lg font-black transition hover:bg-[#f0ebe4]'
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
												className='grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border-color)] text-lg font-black transition hover:bg-[#f0ebe4]'
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

					<div className='grid gap-4 sm:grid-cols-3'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Precio familiar (₡)</span>
							<input
								type='number'
								min='0'
								value={priceFamily}
								onChange={event => setPriceFamily(event.target.value)}
								placeholder='150000'
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Precio educativo (₡)</span>
							<input
								type='number'
								min='0'
								value={priceEducational}
								onChange={event => setPriceEducational(event.target.value)}
								placeholder='157500'
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Precio corporativo (₡)</span>
							<input
								type='number'
								min='0'
								value={priceCorporate}
								onChange={event => setPriceCorporate(event.target.value)}
								placeholder='165000'
								className='form-control'
							/>
						</label>
					</div>

					{validationIssues.length > 0 ? (
						<ul
							className='list-none space-y-1 rounded-lg bg-[#fff0cf] p-4 text-base font-bold text-[#6f5600]'
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
						<p className='flex items-center gap-2 rounded-lg bg-[#d8f5f2] p-4 text-base font-black text-[var(--secondary-color)]'>
							<Icon
								icon='material-symbols:check-circle-rounded'
								className='h-5 w-5 shrink-0'
								aria-hidden='true'
							/>
							<span>Paquete completo y listo para guardar.</span>
						</p>
					)}

					<button
						type='button'
						disabled={validationIssues.length > 0}
						className='primary-action min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:cursor-not-allowed disabled:opacity-50'
					>
						Guardar paquete
					</button>
				</div>
			</section>
		</div>
	);
}
