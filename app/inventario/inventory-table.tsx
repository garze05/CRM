"use client";

import { DeleteAction } from "../components/delete-action";
import { InventoryThumbnail } from "../components/entity-thumbnail";
import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import type { InventoryItem } from "../lib/mock-data";

function getAvailabilityBadgeValue(item: InventoryItem) {
	return item.availabilityStatus === "RESERVADO"
		? "RESERVADO_INVENTARIO"
		: item.availabilityStatus;
}

const columns: DataTableColumn<InventoryItem>[] = [
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
		filterLabel: formatEnumLabel,
		render: item => <StatusBadge value={item.category} />,
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
		filterLabel: value =>
			value === "MANTENIMIENTO_PENDIENTE"
				? "Mantenimiento"
				: formatEnumLabel(value),
		render: item => (
			<StatusBadge
				value={getAvailabilityBadgeValue(item)}
				label={
					item.availabilityStatus === "MANTENIMIENTO_PENDIENTE"
						? "MANTENIMIENTO"
						: item.availabilityStatus.replaceAll("_", " ")
				}
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

export function InventoryTable({ rows }: { rows: InventoryItem[] }) {
	return (
		<DataTable
			tableId='inventario'
			columns={columns}
			rows={rows}
			rowHref={item => `/inventario/${item.id}`}
			searchLabel='Buscar inventario'
			searchPlaceholder='Nombre, categoría o etiqueta'
			searchText={item =>
				`${item.name} ${item.description} ${formatEnumLabel(item.category)} ${item.tags.join(" ")}`
			}
			emptyTitle='Sin ítems en el catálogo'
			emptyDescription='Agregá personajes, inflables y servicios para alimentar cotizaciones y paquetes.'
		/>
	);
}
