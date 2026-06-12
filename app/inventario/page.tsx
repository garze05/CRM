import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { InventoryTable } from "./inventory-table";
import { inventoryItems } from "../lib/mock-data";

export default function InventoryPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Inventario" }]}
				title='Inventario'
				description='Catálogo visual de personajes, inflables, decoración y servicios disponibles para cotizaciones.'
				actions={
					<Link
						href='/inventario/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo ítem' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<div className='mb-5 rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f0ebe4] p-4 text-lg text-[var(--text-secondary)]'>
						Disponibilidad y mantenimiento quedan visibles como columnas para
						conectarse luego con un módulo operativo dedicado.
					</div>

					<InventoryTable rows={inventoryItems} />
				</SectionCard>
			</div>
		</>
	);
}
