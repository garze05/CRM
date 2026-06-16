"use client";

import { DeleteAction } from "../components/delete-action";
import { InventoryThumbnail } from "../components/entity-thumbnail";
import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import {
	CATALOG_AVAILABILITY_LABELS,
	CATALOG_CATEGORY_LABELS,
	type CatalogListItem,
} from "../lib/domain/catalog";

function getAvailabilityBadgeValue(item: CatalogListItem) {
	return item.availabilityStatus === "RESERVED"
		? "RESERVED_INVENTORY"
		: item.availabilityStatus;
}

const columns: DataTableColumn<CatalogListItem>[] = [
	{
		key: "item",
		header: "Ítem",
		width: "minmax(250px, 1.7fr)",
		sortValue: item => item.name.toLocaleLowerCase("es"),
		render: item => (
			<div className='flex items-center gap-3'>
				<InventoryThumbnail category={item.category} />
				<div>
					<p className='font-black text-[var(--text-primary)]'>{item.name}</p>
					<p className='mt-1 line-clamp-1 text-base'>{item.description}</p>
				</div>
			</div>
		),
	},
	{
		key: "category",
		header: "Categoría",
		width: "minmax(150px, 0.85fr)",
		filterValue: item => item.category,
		filterLabel: value => CATALOG_CATEGORY_LABELS[value] ?? value,
		render: item => (
			<StatusBadge
				value={item.category}
				label={CATALOG_CATEGORY_LABELS[item.category]}
			/>
		),
	},
	{
		key: "active",
		header: "Estado",
		width: "minmax(130px, 0.75fr)",
		filterValue: item => (item.active ? "ACTIVO" : "PAUSADO"),
		filterLabel: formatEnumLabel,
		render: item => <StatusBadge value={item.active ? "ACTIVO" : "PAUSADO"} />,
	},
	{
		key: "availability",
		header: "Disponibilidad",
		width: "minmax(180px, 1fr)",
		filterValue: item => item.availabilityStatus,
		filterLabel: value => CATALOG_AVAILABILITY_LABELS[value] ?? value,
		render: item => (
			<StatusBadge
				value={getAvailabilityBadgeValue(item)}
				label={CATALOG_AVAILABILITY_LABELS[item.availabilityStatus]}
			/>
		),
	},
	{
		key: "tags",
		header: "Etiquetas",
		width: "minmax(190px, 1.1fr)",
		render: item => item.tags.join(", "),
	},
	{
		key: "action",
		header: "Acción",
		width: "minmax(130px, 0.75fr)",
		render: () => <DeleteAction />,
	},
];

export function InventoryTable({ rows }: { rows: CatalogListItem[] }) {
	return (
		<DataTable
			tableId='inventario'
			columns={columns}
			rows={rows}
			rowHref={item => `/inventario/${item.id}`}
			searchLabel='Buscar inventario'
			searchPlaceholder='Nombre, categoría o etiqueta'
			searchText={item =>
				`${item.name} ${item.description} ${CATALOG_CATEGORY_LABELS[item.category]} ${item.tags.join(" ")}`
			}
			emptyTitle='Sin ítems en el catálogo'
			emptyDescription='Agregá personajes, inflables y servicios para alimentar cotizaciones y paquetes.'
		/>
	);
}
