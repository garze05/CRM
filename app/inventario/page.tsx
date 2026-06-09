import { CrmShell } from "../components/crm-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { DeleteAction } from "../components/delete-action";
import { InventoryThumbnail } from "../components/entity-thumbnail";
import { IconLabel } from "../components/icon-label";
import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { StatusBadge } from "../components/status-badge";
import { inventoryItems, type InventoryItem } from "../lib/mock-data";

function getInventoryAvailabilityBadgeValue(item: InventoryItem) {
	if (item.availabilityStatus === "RESERVADO") {
		return "RESERVADO_INVENTARIO";
	}

	return item.availabilityStatus;
}

const columns: ManagementColumn<InventoryItem>[] = [
	{
		key: "item",
		header: "Ítem",
		width: "minmax(250px, 1.7fr)",
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
		width: "minmax(130px, 0.85fr)",
		render: item => <StatusBadge value={item.category} />,
	},
	{
		key: "active",
		header: "Estado",
		width: "minmax(110px, 0.75fr)",
		render: item => <StatusBadge value={item.active ? "ACTIVO" : "PAUSADO"} />,
	},
	{
		key: "availability",
		header: "Disponibilidad",
		width: "minmax(170px, 1fr)",
		render: item => (
			<StatusBadge
				value={getInventoryAvailabilityBadgeValue(item)}
				label={
					item.availabilityStatus === "MANTENIMIENTO_PENDIENTE"
						? "MANTENIMIENTO"
						: item.availabilityStatus.replaceAll("_", " ")
				}
			/>
		),
	},
	{
		key: "maintenance",
		header: "Mantenimiento",
		width: "minmax(150px, 0.9fr)",
		render: item =>
			item.availabilityStatus === "MANTENIMIENTO_PENDIENTE" ? (
				<span className='font-black text-[var(--accent-color)]'>Pendiente</span>
			) : (
				<span>Sin alerta</span>
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

export default function InventoryPage() {
	return (
		<CrmShell>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Inventario" },
							]}
						/>
						<h1 className='page-heading'>Inventario</h1>
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							Catálogo visual de personajes, inflables, decoración y servicios
							disponibles para cotizaciones.
						</p>
					</div>
					<button
						type='button'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo ítem' />
					</button>
				</div>
			</header>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<section className='surface-card p-5 md:p-7'>
					<div className='mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Buscar inventario</span>
							<input
								placeholder='Nombre, categoría o tag'
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Categoría</span>
							<select className='form-control'>
								<option>Todas</option>
								<option>Personaje</option>
								<option>Inflable</option>
								<option>Decoración</option>
								<option>Otro</option>
							</select>
						</label>
					</div>

					<div className='mb-5 rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f0ebe4] p-4 text-lg text-[var(--text-secondary)]'>
						Disponibilidad y mantenimiento quedan visibles como columnas para
						conectarse luego con un módulo operativo dedicado.
					</div>

					<ManagementTable
						columns={columns}
						rows={inventoryItems}
						rowHref={item => `/inventario/${item.id}`}
					/>
				</section>
			</div>
		</CrmShell>
	);
}
