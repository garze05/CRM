"use client";

import {
	type ColumnFiltersState,
	type SortingState,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import Link from "next/link";
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

addCollection(materialSymbolsIcons);

export type DataTableColumn<Row> = {
	key: string;
	header: string;
	width?: string;
	className?: string;
	render: (row: Row) => ReactNode;
	/** Habilita orden por encabezado. Devuelve el valor comparable de la fila. */
	sortValue?: (row: Row) => string | number | null;
	/** Habilita filtro por valores (estilo Excel). Devuelve el valor de la fila. */
	filterValue?: (row: Row) => string;
	/** Etiqueta visible para cada valor del filtro (por defecto: reemplaza "_"). */
	filterLabel?: (value: string) => string;
};

type PersistedState = {
	sorting: SortingState;
	filters: ColumnFiltersState;
};

function loadPersistedState(tableId: string): PersistedState | null {
	try {
		const raw = window.localStorage.getItem(`okidoki:tabla:${tableId}`);
		return raw ? (JSON.parse(raw) as PersistedState) : null;
	} catch {
		return null;
	}
}

function savePersistedState(tableId: string, state: PersistedState) {
	try {
		window.localStorage.setItem(
			`okidoki:tabla:${tableId}`,
			JSON.stringify(state),
		);
	} catch {
		// Almacenamiento no disponible (modo privado, etc.) — ignorar.
	}
}

function defaultFilterLabel(value: string) {
	return value.replaceAll("_", " ");
}

/** "PENDIENTE_ANTICIPO" → "Pendiente anticipo" (para filtros y etiquetas). */
export function formatEnumLabel(value: string) {
	const text = value.replaceAll("_", " ").toLowerCase();
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function DataTable<Row extends { id: string }>({
	tableId,
	columns,
	rows,
	rowHref,
	searchLabel = "Buscar",
	searchPlaceholder = "Buscar…",
	searchText,
	emptyTitle = "Sin registros todavía",
	emptyDescription,
	initialFilters,
}: {
	/** Identificador estable; clave de persistencia de filtros por usuario. */
	tableId: string;
	columns: DataTableColumn<Row>[];
	rows: Row[];
	rowHref?: (row: Row) => string;
	searchLabel?: string;
	searchPlaceholder?: string;
	/** Texto de búsqueda global por fila (nombre + teléfono + lugar, etc.). */
	searchText?: (row: Row) => string;
	emptyTitle?: string;
	emptyDescription?: string;
	/** Filtros iniciales (ej. desde query params); tienen prioridad sobre los guardados. */
	initialFilters?: Record<string, string[]>;
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
		initialFilters
			? Object.entries(initialFilters).map(([id, value]) => ({ id, value }))
			: [],
	);
	const [globalFilter, setGlobalFilter] = useState("");
	const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
	const hydratedRef = useRef(false);

	// Cargar estado guardado tras montar (evita desajustes de hidratación).
	useEffect(() => {
		if (!initialFilters || Object.keys(initialFilters).length === 0) {
			const persisted = loadPersistedState(tableId);
			if (persisted) {
				setSorting(persisted.sorting);
				setColumnFilters(persisted.filters);
			}
		}
		hydratedRef.current = true;
		// Solo al montar.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (hydratedRef.current) {
			savePersistedState(tableId, { sorting, filters: columnFilters });
		}
	}, [tableId, sorting, columnFilters]);

	const tanstackColumns = useMemo<ColumnDef<Row>[]>(
		() =>
			columns.map(column => ({
				id: column.key,
				accessorFn: (row: Row) =>
					column.sortValue?.(row) ?? column.filterValue?.(row) ?? "",
				enableSorting: Boolean(column.sortValue),
				enableColumnFilter: Boolean(column.filterValue),
				filterFn: (row, _columnId, selected: string[]) => {
					if (!selected || selected.length === 0) {
						return true;
					}
					const value = column.filterValue?.(row.original) ?? "";
					return selected.includes(value);
				},
			})),
		[columns],
	);

	const table = useReactTable({
		data: rows,
		columns: tanstackColumns,
		state: { sorting, columnFilters, globalFilter },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, query: string) => {
			const text = searchText?.(row.original) ?? "";
			return text.toLowerCase().includes(query.toLowerCase().trim());
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const visibleRows = table.getRowModel().rows;
	const hasActiveFilters = columnFilters.length > 0 || globalFilter.trim() !== "";
	const gridTemplateColumns = columns
		.map(column => column.width ?? "minmax(0, 1fr)")
		.join(" ");

	function clearAll() {
		setColumnFilters([]);
		setGlobalFilter("");
		setSorting([]);
	}

	if (rows.length === 0) {
		return (
			<div className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-10 text-center'>
				<p className='text-2xl font-black text-[var(--text-primary)]'>
					{emptyTitle}
				</p>
				{emptyDescription ? (
					<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
						{emptyDescription}
					</p>
				) : null}
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			<div className='flex flex-wrap items-end gap-4'>
				{searchText ? (
					<label className='min-w-64 flex-1 space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>{searchLabel}</span>
						<span className='relative block'>
							<Icon
								icon='material-symbols:search-rounded'
								className='pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[var(--text-muted)]'
								aria-hidden='true'
							/>
							<input
								type='search'
								value={globalFilter}
								onChange={event => setGlobalFilter(event.target.value)}
								placeholder={searchPlaceholder}
								className='form-control pl-12'
							/>
						</span>
					</label>
				) : null}

				<div className='flex items-center gap-3 pb-3 text-base font-bold text-[var(--text-secondary)]'>
					<span>
						Mostrando {visibleRows.length} de {rows.length}
					</span>
					{hasActiveFilters ? (
						<button
							type='button'
							onClick={clearAll}
							className='flex min-h-10 items-center gap-1 rounded-full border border-[color:var(--border-color)] bg-[var(--surface-color)] px-3 text-[var(--primary-color)] transition hover:bg-[#f0ebe4]'
						>
							<Icon
								icon='material-symbols:filter-alt-off-rounded'
								className='h-5 w-5'
								aria-hidden='true'
							/>
							<span>Limpiar filtros</span>
						</button>
					) : null}
				</div>
			</div>

			{/* Con un menú abierto se libera el overflow para no recortar el popover. */}
			<div
				role='table'
				className={`max-w-full rounded-lg border border-[color:var(--border-color)] bg-[var(--card-color)] shadow-[var(--crisp-shadow)] ${
					openMenuKey ? "overflow-visible" : "overflow-x-auto"
				}`}
			>
				<div
					role='row'
					className='grid min-w-[860px] bg-[#f0ebe4] px-5 py-2 text-base font-black text-[var(--text-secondary)]'
					style={{ gridTemplateColumns }}
				>
					{columns.map(column => (
						<HeaderCell
							key={column.key}
							column={column}
							table={table}
							isMenuOpen={openMenuKey === column.key}
							onToggleMenu={() =>
								setOpenMenuKey(current =>
									current === column.key ? null : column.key,
								)
							}
							onCloseMenu={() => setOpenMenuKey(null)}
							allRows={rows}
						/>
					))}
				</div>

				{visibleRows.length === 0 ? (
					<div className='border-t border-[color:var(--border-color)] p-10 text-center'>
						<p className='text-xl font-black text-[var(--text-primary)]'>
							Sin resultados con los filtros actuales
						</p>
						<button
							type='button'
							onClick={clearAll}
							className='secondary-action mx-auto mt-4 flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
						>
							<Icon
								icon='material-symbols:filter-alt-off-rounded'
								className='h-5 w-5'
								aria-hidden='true'
							/>
							<span>Limpiar filtros</span>
						</button>
					</div>
				) : (
					visibleRows.map(tableRow => {
						const row = tableRow.original;
						const content = (
							<div
								role='row'
								className='grid min-w-[860px] items-center px-5 py-5 text-lg text-[var(--text-secondary)]'
								style={{ gridTemplateColumns }}
							>
								{columns.map(column => (
									<div
										key={column.key}
										role='cell'
										className={`relative z-10 ${
											column.key === "action"
												? "pointer-events-auto"
												: rowHref
													? "pointer-events-none"
													: ""
										} ${column.className ?? ""}`}
									>
										{column.render(row)}
									</div>
								))}
							</div>
						);

						if (!rowHref) {
							return (
								<div
									key={row.id}
									className='border-t border-[color:var(--border-color)] transition hover:bg-[#f7f2ec]'
								>
									{content}
								</div>
							);
						}

						return (
							<div
								key={row.id}
								className='relative border-t border-[color:var(--border-color)] transition hover:bg-[#f7f2ec]'
							>
								<Link
									href={rowHref(row)}
									className='absolute inset-0 z-0'
									aria-label='Abrir detalle'
								/>
								{content}
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

function HeaderCell<Row extends { id: string }>({
	column,
	table,
	isMenuOpen,
	onToggleMenu,
	onCloseMenu,
	allRows,
}: {
	column: DataTableColumn<Row>;
	table: ReturnType<typeof useReactTable<Row>>;
	isMenuOpen: boolean;
	onToggleMenu: () => void;
	onCloseMenu: () => void;
	allRows: Row[];
}) {
	const menuRef = useRef<HTMLDivElement | null>(null);
	const tanstackColumn = table.getColumn(column.key);
	const isInteractive = Boolean(column.sortValue || column.filterValue);
	const sortDirection = tanstackColumn?.getIsSorted() ?? false;
	const selectedValues = (tanstackColumn?.getFilterValue() as string[]) ?? [];

	useEffect(() => {
		if (!isMenuOpen) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onCloseMenu();
			}
		}
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onCloseMenu();
			}
		}

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isMenuOpen, onCloseMenu]);

	const facetValues = useMemo(() => {
		if (!column.filterValue) {
			return [];
		}
		const counts = new Map<string, number>();
		for (const row of allRows) {
			const value = column.filterValue(row);
			counts.set(value, (counts.get(value) ?? 0) + 1);
		}
		return [...counts.entries()]
			.sort((a, b) => a[0].localeCompare(b[0], "es"))
			.map(([value, count]) => ({ value, count }));
	}, [column, allRows]);

	if (!isInteractive) {
		return (
			<span role='columnheader' className={`py-2 ${column.className ?? ""}`}>
				{column.header}
			</span>
		);
	}

	return (
		<div
			ref={menuRef}
			role='columnheader'
			aria-sort={
				sortDirection === "asc"
					? "ascending"
					: sortDirection === "desc"
						? "descending"
						: "none"
			}
			className={`relative ${column.className ?? ""}`}
		>
			<button
				type='button'
				onClick={onToggleMenu}
				aria-expanded={isMenuOpen}
				className='flex min-h-10 items-center gap-1 rounded-lg px-1 py-2 text-left transition hover:text-[var(--primary-color)]'
			>
				<span>{column.header}</span>
				{sortDirection ? (
					<Icon
						icon={
							sortDirection === "asc"
								? "material-symbols:arrow-upward-rounded"
								: "material-symbols:arrow-downward-rounded"
						}
						className='h-5 w-5 shrink-0 text-[var(--primary-color)]'
						aria-label={
							sortDirection === "asc" ? "Orden ascendente" : "Orden descendente"
						}
					/>
				) : null}
				{selectedValues.length > 0 ? (
					<Icon
						icon='material-symbols:filter-alt-rounded'
						className='h-5 w-5 shrink-0 text-[var(--primary-color)]'
						aria-label='Filtro activo'
					/>
				) : (
					<Icon
						icon='material-symbols:keyboard-arrow-down-rounded'
						className='h-5 w-5 shrink-0 text-[var(--text-muted)]'
						aria-hidden='true'
					/>
				)}
			</button>

			{isMenuOpen ? (
				<div className='absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-[color:var(--border-color)] bg-[var(--card-color)] p-2 shadow-[var(--soft-shadow)]'>
					{column.sortValue ? (
						<div className='space-y-1 border-b border-[color:var(--border-color)] pb-2'>
							<MenuButton
								icon='material-symbols:arrow-upward-rounded'
								label='Ordenar A → Z'
								active={sortDirection === "asc"}
								onClick={() => {
									tanstackColumn?.toggleSorting(false);
									onCloseMenu();
								}}
							/>
							<MenuButton
								icon='material-symbols:arrow-downward-rounded'
								label='Ordenar Z → A'
								active={sortDirection === "desc"}
								onClick={() => {
									tanstackColumn?.toggleSorting(true);
									onCloseMenu();
								}}
							/>
							{sortDirection ? (
								<MenuButton
									icon='material-symbols:close-rounded'
									label='Quitar orden'
									onClick={() => {
										tanstackColumn?.clearSorting();
										onCloseMenu();
									}}
								/>
							) : null}
						</div>
					) : null}

					{column.filterValue ? (
						<div className='pt-2'>
							<p className='px-2 pb-1 text-sm font-black uppercase text-[var(--text-muted)]'>
								Filtrar por valor
							</p>
							<div className='max-h-64 space-y-1 overflow-y-auto'>
								{facetValues.map(({ value, count }) => {
									const checked = selectedValues.includes(value);
									const label =
										column.filterLabel?.(value) ?? defaultFilterLabel(value);

									return (
										<label
											key={value}
											className='flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-base font-bold text-[var(--text-primary)] transition hover:bg-[#f0ebe4]'
										>
											<input
												type='checkbox'
												checked={checked}
												onChange={() => {
													const next = checked
														? selectedValues.filter(item => item !== value)
														: [...selectedValues, value];
													tanstackColumn?.setFilterValue(
														next.length > 0 ? next : undefined,
													);
												}}
												className='h-5 w-5 accent-[var(--primary-color)]'
											/>
											<span className='flex-1'>{label}</span>
											<span className='text-sm font-bold text-[var(--text-muted)]'>
												{count}
											</span>
										</label>
									);
								})}
							</div>
							{selectedValues.length > 0 ? (
								<div className='mt-1 border-t border-[color:var(--border-color)] pt-1'>
									<MenuButton
										icon='material-symbols:filter-alt-off-rounded'
										label='Limpiar filtro'
										onClick={() => {
											tanstackColumn?.setFilterValue(undefined);
											onCloseMenu();
										}}
									/>
								</div>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

function MenuButton({
	icon,
	label,
	active,
	onClick,
}: {
	icon: string;
	label: string;
	active?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-base font-bold transition hover:bg-[#f0ebe4] ${
				active
					? "text-[var(--primary-color)]"
					: "text-[var(--text-primary)]"
			}`}
		>
			<Icon icon={icon} className='h-5 w-5 shrink-0' aria-hidden='true' />
			<span>{label}</span>
		</button>
	);
}
